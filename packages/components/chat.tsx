"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {Button} from "./ui/button"
import {Input} from "./ui/input"
import {ScrollArea} from "./ui/scroll-area"
import {Loader2, Send, User} from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export interface ChatPersonasDemoProps {
    temperature?: number
    maxTokens?: number
    initialMessages?: Message[]
    // optional: lets you scope storage per org/user/etc
    storageKey?: string
}

function safeParseMessages(raw: string | null): Message[] {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
            .map((m) => ({role: m.role, content: m.content}))
    } catch {
        return []
    }
}

export function Chat({
                         temperature = 0.8,
                         maxTokens = 200,
                         initialMessages = [],
                         storageKey = "comend:chat:session",
                     }: ChatPersonasDemoProps = {}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // IMPORTANT: shadcn ScrollArea scrolls via an inner viewport div.
    const viewportRef = useRef<HTMLDivElement | null>(null)

    // Hydrate from sessionStorage on first mount (client only)
    useEffect(() => {
        const saved = safeParseMessages(sessionStorage.getItem(storageKey))
        if (saved.length) setMessages(saved)
    }, [storageKey])

    // Persist on every change
    useEffect(() => {
        sessionStorage.setItem(storageKey, JSON.stringify(messages))
    }, [messages, storageKey])

    // Auto-scroll after messages render
    useEffect(() => {
        const el = viewportRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, isLoading])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userText = input.trim()
        const userMessage: Message = {role: "user", content: userText}

        // compute nextMessages synchronously so fetch uses the latest
        const nextMessages = [...messages, userMessage]

        setMessages(nextMessages)
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    messages: nextMessages,
                    orgId: null,
                    // you currently require personaSystem in your ChatBody type;
                    // either send it here or make it optional server-side.
                    // personaSystem: "You are a helpful assistant.",
                }),
            })

            const data = await res.json()
            const assistantMessage: Message = {role: "assistant", content: String(data.text ?? "").trim()}
            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`},
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="py-4 space-y-4 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
            <ScrollArea className="h-[calc(100vh-136px)] p-4">
                {/* this is the scrollable viewport */}
                <div ref={viewportRef}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <span className="text-4xl mb-2">🤖</span>
                            <p className="text-sm">Start chatting</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && <span className="text-lg shrink-0">🤖</span>}
                                    <div
                                        className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    {msg.role === "user" && <User className="h-5 w-5 shrink-0 text-muted-foreground" />}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2 items-center">
                                    <span className="text-lg">🤖</span>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Talk to Comend Assistant"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    disabled={isLoading}
                    className="w-[calc(100vw-336px)] h-full"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
