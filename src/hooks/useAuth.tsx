import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, SupplierProfile, UserRole } from '@/types'
import { TRIAL_LEADS, TRIAL_DAYS } from '@/lib/constants'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  supplierProfile: SupplierProfile | null
  loading: boolean
  isAuthenticated: boolean
  isBuyer: boolean
  isSupplier: boolean
  isAdmin: boolean
  isOnTrial: boolean
  trialLeadsLeft: number
  trialDaysLeft: number
  trialExpired: boolean
  hasActiveSubscription: boolean
  canUnlockLeads: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  role: UserRole
  full_name: string
  company_name?: string
  city?: string
  phone?: string
  categories?: string[]
  org_number?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileData) {
      setProfile(profileData as unknown as Profile)

      if (profileData.role === 'supplier') {
        const { data: supplierData } = await supabase
          .from('supplier_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (supplierData) {
          setSupplierProfile(supplierData as unknown as SupplierProfile)
        }
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const createPendingProject = useCallback(async (userId: string) => {
    const raw = localStorage.getItem('pending_project')
    if (!raw) return
    try {
      const pending = JSON.parse(raw)
      localStorage.removeItem('pending_project')
      const { error } = await supabase.from('projects').insert({
        buyer_id: userId,
        title: pending.title,
        description: pending.description,
        category: pending.category,
        budget_range: pending.budget_range,
        start_time: pending.start_time,
        is_company: pending.is_company ?? true,
        status: 'pending',
      })
      if (!error) {
        toast.success('Ditt uppdrag har publicerats! ✅')
      }
    } catch {
      localStorage.removeItem('pending_project')
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // First, get the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        createPendingProject(session.user.id)
      }
      if (isMounted) setLoading(false)
    })

    // Then listen for auth changes (don't await inside callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id).then(() => {
            if (isMounted) setLoading(false)
            // Auto-create pending project after email verification
            createPendingProject(session.user.id)
          })
        } else {
          setProfile(null)
          setSupplierProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, createPendingProject])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (data: SignUpData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (authError || !authData.user) return { error: authError as Error | null }

    const userId = authData.user.id

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role: data.role,
      full_name: data.full_name,
      email: data.email,
      company_name: data.company_name || null,
      city: data.city || null,
      phone: data.phone || null,
    })

    if (profileError) return { error: profileError as Error }

    // If supplier, create supplier profile with trial
    if (data.role === 'supplier') {
      const slug = (data.company_name || data.full_name)
        .toLowerCase()
        .replace(/[^a-z0-9åäö]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + userId.slice(0, 6)

      const trialEnds = new Date()
      trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS)

      const { error: supplierError } = await supabase.from('supplier_profiles').insert({
        id: userId,
        slug,
        plan: 'trial',
        trial_ends_at: trialEnds.toISOString(),
        lead_credits: TRIAL_LEADS,
        trial_leads_used: 0,
        categories: data.categories || [],
        org_number: data.org_number || null,
      })

      if (supplierError) return { error: supplierError as Error }
    }

    // Fetch the newly created profile so state is ready before navigation
    await fetchProfile(userId)

    return { error: null }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSupplierProfile(null)
  }

  // Trial calculations
  const isOnTrial = supplierProfile?.plan === 'trial' &&
    !!supplierProfile.trial_ends_at &&
    new Date(supplierProfile.trial_ends_at) > new Date() &&
    (supplierProfile.lead_credits ?? 0) > 0

  const trialLeadsLeft = supplierProfile?.lead_credits ?? 0

  const trialDaysLeft = supplierProfile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(supplierProfile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const trialExpired = supplierProfile?.plan === 'trial' && !isOnTrial

  // Active subscription = monthly plan
  const hasActiveSubscription = supplierProfile?.plan === 'monthly'

  // Can unlock leads = on trial with credits, or has active subscription, or pay-per-lead (always can if willing to pay)
  const canUnlockLeads = isOnTrial || hasActiveSubscription

  const value: AuthContextType = {
    user,
    session,
    profile,
    supplierProfile,
    loading,
    isAuthenticated: !!user,
    isBuyer: profile?.role === 'buyer',
    isSupplier: profile?.role === 'supplier',
    isAdmin: profile?.role === 'admin',
    isOnTrial,
    trialLeadsLeft,
    trialDaysLeft,
    trialExpired,
    hasActiveSubscription,
    canUnlockLeads,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
