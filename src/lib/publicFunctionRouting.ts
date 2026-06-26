import { supabase } from '@/integrations/supabase/client'

const invoke = supabase.functions.invoke.bind(supabase.functions)

Object.defineProperty(supabase.functions, 'invoke', {
  configurable: true,
  value: (name: string, options?: any) => {
    if (name === 'submit-guest-lead') {
      return invoke('improve-description', {
        ...options,
        body: {
          action: 'submit_guest_lead',
          payload: options?.body || {},
        },
      })
    }

    return invoke(name, options)
  },
})
