"use client"

import {useEffect, useRef, useState} from "react"
import {useSession} from "next-auth/react"
import Image from "next/image"
import {Button} from "./ui/button"
import {Input} from "./ui/input"
import {ScrollArea} from "./ui/scroll-area"
import {Loader2, Send, Plus} from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export interface ChatPersonasDemoProps {
    temperature?: number
    maxTokens?: number
    initialMessages?: Message[]
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

function initials(name?: string | null) {
    const n = (name ?? "").trim()
    if (!n) return "U"
    const parts = n.split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] ?? "U"
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
    return (a + b).toUpperCase()
}

function Avatar({
                    src,
                    name,
                    size = 20,
                }: {
    src?: string | null
    name?: string | null
    size?: number
}) {
    const [errored, setErrored] = useState(false)
    const px = size

    if (src && !errored) {
        return (
            <Image
                src={src}
                alt={name ? `${name} avatar` : "User avatar"}
                width={px}
                height={px}
                className="rounded-full shrink-0"
                onError={() => setErrored(true)}
            />
        )
    }

    return (
        <div
            className="rounded-full shrink-0 bg-muted text-muted-foreground flex items-center justify-center font-medium"
            style={{width: px, height: px, fontSize: Math.max(10, Math.floor(px * 0.5))}}
            aria-label={name ? `${name} avatar` : "User avatar"}
        >
            {initials(name)}
        </div>
    )
}

export function Chat({
                         temperature = 0.8,
                         maxTokens = 200,
                         initialMessages = [],
                         storageKey = "comend:chat:session",
                     }: ChatPersonasDemoProps = {}) {
    const {data: session} = useSession()
    const userImage = (session?.user as any)?.image as string | undefined
    const userName = (session?.user as any)?.name as string | undefined

    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const viewportRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const exampleCards = [
        {
            title: "How many research plans",
            subtitle: "does AGSAA have?",
            query: "How many research plans does AGSAA have?"
        },
        {
            title: "How many patient groups",
            subtitle: "are on Comend?",
            query: "How many patient groups are on Comend?"
        },
    ] as const

    useEffect(() => {
        const saved = safeParseMessages(sessionStorage.getItem(storageKey))
        if (saved.length) setMessages(saved)
    }, [storageKey])

    useEffect(() => {
        sessionStorage.setItem(storageKey, JSON.stringify(messages))
    }, [messages, storageKey])

    useEffect(() => {
        const el = viewportRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, isLoading])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userText = input.trim()
        const userMessage: Message = {role: "user", content: userText}
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

    const applyExample = (q: string) => {
        setInput(q)
        requestAnimationFrame(() => inputRef.current?.focus())
    }

    const isEmpty = messages.length === 0

    return (
        <div className="w-full h-[calc(100vh-100px)] max-w-7xl mx-auto flex flex-col px-8">
            <ScrollArea className="flex-1">
                <div ref={viewportRef} className="py-10">
                    {isEmpty ? (
                        <div className="flex flex-col">
                            <div className="pt-24">
                                <h1 className="text-5xl font-semibold tracking-tight text-foreground">
                                    Welcome to Comend Assistant
                                </h1>
                                <p className="mt-3 text-3xl text-muted-foreground">
                                    How can I help you today?
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-6">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && <span className="text-lg shrink-0">🤖</span>}

                                    <div
                                        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {msg.role === "user" && (
                                        <Avatar src={userImage} name={userName} size={40}/>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2 items-center">
                                    <span className="text-lg">🤖</span>
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="pb-6">
                <div className="mt-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                        {exampleCards.map((c) => (
                            <button
                                key={c.query}
                                type="button"
                                onClick={() => applyExample(c.query)}
                                className="text-left rounded-2xl border bg-background hover:bg-muted/40 transition px-6 py-5"
                            >
                                <div className="text-xl font-semibold text-foreground">{c.title}</div>
                                <div className="text-xl text-muted-foreground">{c.subtitle}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full rounded-3xl border bg-background px-4 py-3 flex items-center justify-between gap-3">
                    <Input
                        ref={(el) => {
                            inputRef.current = el
                        }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Send a message..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        disabled={isLoading}
                        className="w-[calc(100vw-404px)] border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        maxLength={maxTokens * 2}
                    />

                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="rounded-full h-10 w-10 shrink-0"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </div>
            </div>
        </div>
    )
}
