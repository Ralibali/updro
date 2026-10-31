import { describe, expect, it, vi } from 'vitest'

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }))
import { belongsToConversation, chatLink, conversationKey, mergeMessages, type ChatMessage } from '../chat'

const message = (id: string, sender: string, receiver: string, created_at: string, project = 'p1'): ChatMessage => ({
  id, project_id: project, sender_id: sender, receiver_id: receiver, content: id, is_read: false, created_at,
})

describe('chat helpers', () => {
  it('builds the same deep link as the database notice', () => {
    expect(chatLink('buyer', 'p1', 'agency')).toBe('/dashboard/buyer/chatt?project=p1&user=agency')
    expect(chatLink('supplier', 'p1', 'buyer')).toBe('/dashboard/supplier/chatt?project=p1&user=buyer')
    expect(conversationKey('p1', 'agency')).toBe('p1:agency')
  })

  it('keeps another agency’s live message out of the open thread', () => {
    expect(belongsToConversation(message('a', 'agency-a', 'buyer', 't'), 'buyer', 'agency-a', 'p1')).toBe(true)
    expect(belongsToConversation(message('b', 'buyer', 'agency-a', 't'), 'buyer', 'agency-a', 'p1')).toBe(true)
    expect(belongsToConversation(message('c', 'agency-b', 'buyer', 't'), 'buyer', 'agency-a', 'p1')).toBe(false)
    expect(belongsToConversation(message('d', 'agency-a', 'buyer', 't', 'p2'), 'buyer', 'agency-a', 'p1')).toBe(false)
  })

  it('merges sent and realtime copies of the same message once, in time order', () => {
    const first = message('m1', 'buyer', 'agency', '2026-10-31T10:00:00Z')
    const second = message('m2', 'agency', 'buyer', '2026-10-31T10:01:00Z')
    const merged = mergeMessages([second], [first, { ...second, is_read: true }])
    expect(merged.map(item => item.id)).toEqual(['m1', 'm2'])
    expect(merged[1].is_read).toBe(true)
  })
})
