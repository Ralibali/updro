import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/dateUtils'
import { numWord } from '@/lib/numberWords'
import {
  MAX_MESSAGE_LENGTH, belongsToConversation, conversationKey, loadChatParty, loadConversations, loadThread,
  markConversationRead, mergeMessages, sendChatMessage, type ChatMessage, type ChatRole, type Conversation,
} from '@/lib/chat'

const ChatPage = () => {
  const { user, profile } = useAuth()
  const role: ChatRole = profile?.role === 'supplier' ? 'supplier' : 'buyer'
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [draftConversation, setDraftConversation] = useState<Conversation | null>(null)
  const [openError, setOpenError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threadState, setThreadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const userId = user?.id

  const activeConvo = useMemo(() => {
    if (!activeKey) return null
    return conversations.find(c => conversationKey(c.projectId, c.otherId) === activeKey)
      || (draftConversation && conversationKey(draftConversation.projectId, draftConversation.otherId) === activeKey ? draftConversation : null)
  }, [activeKey, conversations, draftConversation])

  const refreshConversations = useCallback(async () => {
    if (!userId) return
    try {
      setConversations(await loadConversations(userId))
      setListState('ready')
    } catch {
      setListState('error')
    }
  }, [userId])

  useEffect(() => { void refreshConversations() }, [refreshConversations])

  // Open a conversation from ?project=X&user=Y (offer cards and notices), also
  // when a notice is clicked while the chat is already open.
  const paramProject = searchParams.get('project')
  const paramUser = searchParams.get('user')
  useEffect(() => {
    if (!userId || !paramProject || !paramUser || listState === 'loading') return
    let cancelled = false
    const key = conversationKey(paramProject, paramUser)
    void (async () => {
      setOpenError('')
      if (paramUser !== userId && !conversations.some(c => conversationKey(c.projectId, c.otherId) === key)) {
        try {
          const party = await loadChatParty(paramProject, paramUser)
          if (cancelled) return
          if (!party) {
            setOpenError('Du kan bara chatta med beställare och byråer som är kopplade till samma uppdrag.')
            setSearchParams({}, { replace: true })
            return
          }
          setDraftConversation({
            otherId: paramUser, otherName: party.otherName, projectId: paramProject, projectTitle: party.projectTitle,
            lastMessage: '', lastAt: new Date().toISOString(), lastFromMe: false, unread: 0,
          })
        } catch {
          if (!cancelled) setOpenError('Konversationen kunde inte öppnas. Försök igen.')
          return
        }
      }
      if (cancelled) return
      if (paramUser !== userId) setActiveKey(key)
      // Clean the URL so a reload does not keep forcing this conversation open.
      setSearchParams({}, { replace: true })
    })()
    return () => { cancelled = true }
    // Conversations are read for the lookup only; the URL drives this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, paramProject, paramUser, listState])

  // Load the open thread, mark it read and follow new messages in this thread only.
  // Messages count as read only while the page is visible, so a thread left
  // open in a background tab still triggers the e-mail.
  useEffect(() => {
    if (!activeConvo || !userId) return
    let cancelled = false
    let unseen = false
    const { projectId, otherId } = activeConvo
    const isVisible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden'
    const markRead = async () => {
      if (!isVisible()) { unseen = true; return }
      unseen = false
      await markConversationRead(role, userId, projectId, otherId)
      if (!cancelled) setConversations(prev => prev.map(c => c.projectId === projectId && c.otherId === otherId ? { ...c, unread: 0 } : c))
    }
    setThreadState('loading')
    setMessages([])
    void (async () => {
      try {
        const thread = await loadThread(projectId, userId, otherId)
        if (cancelled) return
        setMessages(thread)
        setThreadState('ready')
        await markRead()
      } catch {
        if (!cancelled) setThreadState('error')
      }
    })()

    const onVisibility = () => { if (unseen && isVisible()) void markRead() }
    document.addEventListener('visibilitychange', onVisibility)

    const channel = supabase
      .channel(`chat-${projectId}-${otherId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` }, payload => {
        const message = payload.new as ChatMessage
        if (!belongsToConversation(message, userId, otherId, projectId)) return
        setMessages(prev => mergeMessages(prev, [message]))
        if (message.receiver_id === userId) void markRead()
      })
      .subscribe()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      supabase.removeChannel(channel)
    }
  }, [activeConvo?.projectId, activeConvo?.otherId, userId, role]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!activeConvo || !userId || sending) return
    const text = newMsg.trim()
    if (!text) return
    setSending(true)
    try {
      const saved = await sendChatMessage(activeConvo.projectId, userId, activeConvo.otherId, text)
      setMessages(prev => mergeMessages(prev, [saved]))
      setNewMsg('')
      // The draft stays until the refreshed list contains the conversation, so the thread never flickers closed.
      void refreshConversations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Meddelandet kunde inte skickas. Försök igen.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage() }
  }

  const listed = draftConversation && !conversations.some(c => conversationKey(c.projectId, c.otherId) === conversationKey(draftConversation.projectId, draftConversation.otherId))
    ? [draftConversation, ...conversations]
    : conversations
  const remaining = MAX_MESSAGE_LENGTH - newMsg.length
  const findProjectsLink = role === 'supplier' ? '/dashboard/supplier/offerter' : '/dashboard/buyer/uppdrag'

  return (
    <div className="flex min-h-[28rem] h-[calc(100dvh-12rem)] bg-card rounded-xl border overflow-hidden">
      {/* Conversation list - hidden on mobile when a conversation is open */}
      <div className={cn('w-full md:w-80 border-r flex flex-col bg-surface-alt', activeConvo ? 'hidden md:flex' : 'flex')}>
        <div className="p-5 border-b font-display font-semibold text-base">Meddelanden</div>
        <div className="flex-1 overflow-y-auto">
          {openError && <p role="alert" className="m-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{openError}</p>}
          {listState === 'loading' ? (
            <p role="status" className="p-4 text-sm text-muted-foreground text-center">Hämtar konversationer…</p>
          ) : listState === 'error' ? (
            <div role="alert" className="p-4 text-sm text-center">
              <p>Konversationerna kunde inte hämtas.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => { setListState('loading'); void refreshConversations() }}>Försök igen</Button>
            </div>
          ) : listed.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              <p>Inga meddelanden ännu.</p>
              <p className="mt-1">Starta en konversation från {role === 'supplier' ? 'ett upplåst uppdrag eller en offert' : 'en offert på ditt uppdrag'}.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link to={findProjectsLink}>{role === 'supplier' ? 'Mina offerter' : 'Mina uppdrag'}</Link></Button>
            </div>
          ) : listed.map(c => {
            const key = conversationKey(c.projectId, c.otherId)
            return (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                aria-current={activeKey === key ? 'true' : undefined}
                className={cn('w-full text-left p-3 border-b hover:bg-muted/50 transition-colors', activeKey === key ? 'bg-primary/5' : '')}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm truncate', c.unread ? 'font-semibold' : 'font-medium')}>{c.otherName}</p>
                  {c.unread > 0 && <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{numWord(c.unread)} {c.unread === 1 ? 'ny' : 'nya'}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.projectTitle}</p>
                {c.lastMessage && <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastFromMe ? 'Du: ' : ''}{c.lastMessage}</p>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thread - full width on mobile when open */}
      <div className={cn('flex-1 flex flex-col min-w-0', activeConvo ? 'flex' : 'hidden md:flex')}>
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Välj en konversation</div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center gap-2">
              <button aria-label="Tillbaka till konversationer" onClick={() => setActiveKey(null)} className="md:hidden p-1 rounded-lg hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{activeConvo.otherName}</p>
                <p className="text-xs text-muted-foreground truncate">{activeConvo.projectTitle}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
              {threadState === 'loading' && <p role="status" className="text-sm text-muted-foreground">Hämtar meddelanden…</p>}
              {threadState === 'error' && <p role="alert" className="text-sm text-destructive">Meddelandena kunde inte hämtas. Ladda om sidan.</p>}
              {threadState === 'ready' && messages.length === 0 && (
                <p className="text-sm text-muted-foreground">Inga meddelanden ännu. Skriv det första – {activeConvo.otherName} får en notis.</p>
              )}
              {messages.map(m => (
                <div key={m.id} className={cn('max-w-[80%]', m.sender_id === userId ? 'ml-auto' : '')}>
                  <div className={cn('rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words', m.sender_id === userId ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    {m.content}
                  </div>
                  <p className={cn('text-xs text-muted-foreground mt-1', m.sender_id === userId ? 'text-right' : '')}>{timeAgo(m.created_at)}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  onKeyDown={handleKeyDown}
                  aria-label="Ditt meddelande"
                  placeholder="Skriv ett meddelande… (Skift + Enter för ny rad)"
                  rows={1}
                  className="rounded-xl min-h-[44px] max-h-40 resize-none"
                  disabled={sending}
                />
                <Button aria-label="Skicka meddelande" size="icon" onClick={() => void sendMessage()} disabled={sending || !newMsg.trim()} className="bg-primary hover:bg-primary/90 rounded-xl h-11 w-11 shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {remaining < 500 && <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">{numWord(remaining)} tecken kvar</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatPage
