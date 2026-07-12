import { useState, useEffect, useCallback, createContext, useContext, useRef, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, SupplierProfile, UserRole } from '@/types'
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
  const pendingProjectInFlight = useRef(false)

  const claimGuestProjects = useCallback(async () => {
    const { error } = await (supabase as any).rpc('claim_guest_projects')
    if (error && import.meta.env.DEV) console.warn('Guest projects could not be claimed', error)
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      setProfile(null)
      setSupplierProfile(null)
      if (import.meta.env.DEV) console.warn('Profile could not be loaded', profileError)
      return
    }

    setProfile(profileData as unknown as Profile)

    if (profileData.role === 'buyer') {
      setSupplierProfile(null)
      await claimGuestProjects()
      return
    }

    if (profileData.role === 'supplier') {
      const { data: supplierData, error: supplierError } = await supabase
        .from('supplier_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (supplierError && import.meta.env.DEV) console.warn('Supplier profile could not be loaded', supplierError)
      setSupplierProfile(supplierData ? supplierData as unknown as SupplierProfile : null)
      return
    }

    setSupplierProfile(null)
  }, [claimGuestProjects])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const createPendingProject = useCallback(async (userId: string) => {
    if (pendingProjectInFlight.current) return
    const raw = localStorage.getItem('pending_project')
    if (!raw) return

    pendingProjectInFlight.current = true
    try {
      const pending = JSON.parse(raw)
      if (!pending?.title || !pending?.description || !pending?.category) {
        localStorage.removeItem('pending_project')
        return
      }

      const { error } = await supabase.from('projects').insert({
        buyer_id: userId,
        title: String(pending.title).trim().slice(0, 100),
        description: String(pending.description).trim().slice(0, 5000),
        category: pending.category,
        budget_range: pending.budget_range,
        start_time: pending.start_time,
        is_company: pending.is_company ?? true,
        status: 'pending',
      })

      if (error) {
        console.error('Pending project could not be created', error)
        toast.error('Kontot är klart, men uppdraget kunde inte sparas ännu. Det ligger kvar och försöks igen nästa gång du loggar in.')
        return
      }

      localStorage.removeItem('pending_project')
      toast.success('Ditt uppdrag har skickats in för granskning! ✅')
    } catch (error) {
      console.error('Invalid pending project', error)
      localStorage.removeItem('pending_project')
    } finally {
      pendingProjectInFlight.current = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
        await createPendingProject(session.user.id)
      }
      if (isMounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id).then(async () => {
            await createPendingProject(session.user.id)
            if (isMounted) setLoading(false)
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
    const { data: result, error } = await supabase.functions.invoke<{
      error?: string
      userId?: string
      session?: Session | null
    }>('create-account', { body: data })

    if (error || result?.error) {
      return { error: new Error(result?.error || error?.message || 'Något gick fel vid registrering.') }
    }

    if (result?.session) {
      await supabase.auth.setSession(result.session)
      setSession(result.session)
      setUser(result.session.user)
      await fetchProfile(result.session.user.id)
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSupplierProfile(null)
  }

  const isOnTrial = supplierProfile?.plan === 'trial' &&
    !!supplierProfile.trial_ends_at &&
    new Date(supplierProfile.trial_ends_at) > new Date() &&
    (supplierProfile.lead_credits ?? 0) > 0

  const trialLeadsLeft = supplierProfile?.lead_credits ?? 0

  const trialDaysLeft = supplierProfile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(supplierProfile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  const trialExpired = supplierProfile?.plan === 'trial' && !isOnTrial
  const hasActiveSubscription = supplierProfile?.plan === 'monthly'
  const canUnlockLeads = hasActiveSubscription || (supplierProfile?.lead_credits ?? 0) > 0

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
