import { supabase } from '@/integrations/supabase/client'

export const MAX_MESSAGE_LENGTH = 5000

export type ChatRole = 'buyer' | 'supplier'

export type Conversation = {
  otherId: string
  otherName: string
  projectId: string
  projectTitle: string
  lastMessage: string
  lastAt: string
  lastFromMe: boolean
  unread: number
}

export type ChatMessage = {
  id: string
  project_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean | null
  created_at: string
}

export const conversationKey = (projectId: string, otherId: string) => `${projectId}:${otherId}`

/** Same format as the notice created by notify_message_receiver(), so opening a chat can mark it read. */
export const chatLink = (role: ChatRole, projectId: string, otherId: string) =>
  `/dashboard/${role}/chatt?project=${projectId}&user=${otherId}`

/** A realtime row belongs to the open thread only if it is between exactly these two people on this project. */
export function belongsToConversation(message: Pick<ChatMessage, 'project_id' | 'sender_id' | 'receiver_id'>, me: string, other: string, projectId: string) {
  return message.project_id === projectId && (
    (message.sender_id === me && message.receiver_id === other) ||
    (message.sender_id === other && message.receiver_id === me)
  )
}

export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map(current.map(message => [message.id, message]))
  for (const message of incoming) byId.set(message.id, { ...byId.get(message.id), ...message })
  return [...byId.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id))
}

type ConversationRow = {
  project_id: string; other_id: string; other_name: string; project_title: string
  last_message: string; last_at: string; last_from_me: boolean; unread_count: number
}

export async function loadConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase.rpc('get_my_conversations')
  if (!error && Array.isArray(data)) {
    return (data as ConversationRow[]).map(row => ({
      otherId: row.other_id,
      otherName: row.other_name || 'Motpart',
      projectId: row.project_id,
      projectTitle: row.project_title || 'Uppdrag',
      lastMessage: row.last_message || '',
      lastAt: row.last_at,
      lastFromMe: Boolean(row.last_from_me),
      unread: Number(row.unread_count) || 0,
    }))
  }

  // Fallback until the conversation RPC is deployed: names stay generic.
  const { data: messages, error: messageError } = await supabase
    .from('messages')
    .select('id, project_id, sender_id, receiver_id, content, is_read, created_at, project:projects!messages_project_id_fkey(title)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(500)
  if (messageError) throw messageError
  const conversations = new Map<string, Conversation>()
  for (const message of (messages || []) as Array<ChatMessage & { project?: { title?: string | null } | null }>) {
    const otherId = message.sender_id === userId ? message.receiver_id : message.sender_id
    const key = conversationKey(message.project_id, otherId)
    const unread = message.receiver_id === userId && !message.is_read ? 1 : 0
    const existing = conversations.get(key)
    if (existing) { existing.unread += unread; continue }
    conversations.set(key, {
      otherId, otherName: 'Motpart', projectId: message.project_id, projectTitle: message.project?.title || 'Uppdrag',
      lastMessage: message.content, lastAt: message.created_at, lastFromMe: message.sender_id === userId, unread,
    })
  }
  return [...conversations.values()]
}

/** Name and title for a conversation that has no messages yet, or null when the two are not project parties. */
export async function loadChatParty(projectId: string, otherId: string): Promise<{ otherName: string; projectTitle: string } | null> {
  const { data, error } = await supabase.rpc('get_chat_party', { p_project_id: projectId, p_other_id: otherId })
  // Before the RPC is deployed the database still decides who may write; show generic labels meanwhile.
  if (error) return { otherName: 'Motpart', projectTitle: 'Uppdrag' }
  if (!data || typeof data !== 'object') return null
  const party = data as { other_name?: unknown; project_title?: unknown }
  return {
    otherName: typeof party.other_name === 'string' && party.other_name ? party.other_name : 'Motpart',
    projectTitle: typeof party.project_title === 'string' && party.project_title ? party.project_title : 'Uppdrag',
  }
}

export async function loadThread(projectId: string, me: string, other: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, project_id, sender_id, receiver_id, content, is_read, created_at')
    .eq('project_id', projectId)
    .or(`and(sender_id.eq.${me},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${me})`)
    .order('created_at', { ascending: true })
    .limit(1000)
  if (error) throw error
  return (data || []) as ChatMessage[]
}

/** Marks the thread and its bell notice as read. Best effort: a failure must not block reading. */
export async function markConversationRead(role: ChatRole, me: string, projectId: string, other: string) {
  await Promise.allSettled([
    supabase.from('messages').update({ is_read: true })
      .eq('receiver_id', me).eq('sender_id', other).eq('project_id', projectId).eq('is_read', false),
    supabase.from('notifications').update({ is_read: true })
      .eq('user_id', me).eq('type', 'new_message').eq('link', chatLink(role, projectId, other)).eq('is_read', false),
  ])
}

export async function sendChatMessage(projectId: string, me: string, other: string, content: string): Promise<ChatMessage> {
  const text = content.trim()
  if (!text) throw new Error('Skriv ett meddelande först.')
  if (text.length > MAX_MESSAGE_LENGTH) throw new Error('Meddelandet är för långt. Dela upp det i flera delar.')
  const { data, error } = await supabase
    .from('messages')
    .insert({ project_id: projectId, sender_id: me, receiver_id: other, content: text })
    .select('id, project_id, sender_id, receiver_id, content, is_read, created_at')
    .single()
  if (error) {
    if (/row-level security/i.test(error.message)) {
      throw new Error('Du kan bara skriva till beställare och byråer som är kopplade till samma uppdrag.')
    }
    throw new Error('Meddelandet kunde inte skickas. Försök igen.')
  }
  return data as ChatMessage
}
