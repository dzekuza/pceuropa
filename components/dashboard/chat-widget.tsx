'use client'
// components/dashboard/chat-widget.tsx
// Floating admin chat widget — Gemini 2.5 Flash with live DB context

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CHAT_WIDGET_STRINGS as S } from '@/lib/strings'
import { MessageCircle, X, Send, Bot, Minimize2, ChevronDown, Sparkles, AlertCircle } from 'lucide-react'

function formatTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map(p => p.text)
    .join('')
}

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'init',
    role: 'assistant',
    parts: [{ type: 'text', text: S.greeting }],
    metadata: undefined,
  },
]

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
    </div>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unread, setUnread] = useState(1)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: INITIAL_MESSAGES,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setUnread(0)
  }, [isOpen])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showTyping = isLoading && messages[messages.length - 1]?.role === 'user'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            'pointer-events-auto w-[380px] flex flex-col overflow-hidden',
            'rounded-2xl border bg-background/95 backdrop-blur-xl',
            'shadow-[0_24px_48px_-8px_hsl(var(--foreground)/0.12),0_0_0_1px_hsl(var(--border))]',
            'animate-in slide-in-from-bottom-3 fade-in duration-250',
            'transition-[height] duration-300 ease-in-out',
            isMinimized ? 'h-[62px]' : 'h-[520px]',
          )}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-muted/20 border-b">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{S.assistantName}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {isLoading ? 'Rašo...' : S.assistantStatus}
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setIsMinimized(v => !v)}
                aria-label={isMinimized ? S.expandLabel : S.minimizeLabel}
              >
                {isMinimized
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <Minimize2 className="h-3.5 w-3.5" />
                }
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setIsOpen(false)}
                aria-label={S.closeLabel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
                {messages.map((msg) => {
                  const text = getMessageText(msg)
                  if (!text && msg.role !== 'user') return null
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="bg-primary/10 rounded-lg">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-[76%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted/70 rounded-tl-sm'
                        )}
                      >
                        {text}
                        <p className={cn(
                          'text-[10px] mt-1.5 opacity-50 leading-none',
                          msg.role === 'user' ? 'text-right' : 'text-left'
                        )}>
                          {formatTime()}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {showTyping && (
                  <div className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/10 rounded-lg">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/70 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                      <TypingDots />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-[12px] text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Klaida. Bandykite dar kartą.</span>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              <Separator />

              {/* Input */}
              <div className="shrink-0 p-3 bg-muted/10">
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={S.inputPlaceholder}
                    className="min-h-[40px] max-h-[110px] resize-none text-sm rounded-xl py-2.5 px-3 leading-snug"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="h-[40px] w-[40px] shrink-0 rounded-xl"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    aria-label={S.sendLabel}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center mt-2 leading-none">
                  {S.inputHint}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating trigger */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={cn(
          'pointer-events-auto relative h-14 w-14 rounded-2xl',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'shadow-lg hover:shadow-xl',
          'hover:scale-105 active:scale-95 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-label={isOpen ? S.closeLabel : S.triggerLabel}
        aria-expanded={isOpen}
      >
        <span className={cn(
          'transition-all duration-300',
          isOpen ? 'rotate-90 opacity-70' : 'rotate-0 opacity-100'
        )}>
          {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </span>

        {!isOpen && unread > 0 && (
          <>
            <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 text-[10px] font-bold bg-destructive text-destructive-foreground hover:bg-destructive border-2 border-background">
              {unread}
            </Badge>
            <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/30 pointer-events-none" />
          </>
        )}
      </button>
    </div>
  )
}
