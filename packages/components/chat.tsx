"use client"

import {useState, useRef, useEffect} from "react"
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Card, CardContent} from "./ui/card";
import {ScrollArea} from "./ui/scroll-area";
import {Loader2, Send, User} from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

export interface ChatPersonasDemoProps {
    /** Temperature for generation (0-1) */
    temperature?: number
    /** Max tokens for generation */
    maxTokens?: number
    /** Initial messages to display */
    initialMessages?: Message[]
}

export function Chat({
                         temperature = 0.8,
                         maxTokens = 200,
                         initialMessages = [],
                     }: ChatPersonasDemoProps = {}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        const userMessage: Message = {role: "user", content: userText};

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    orgId: null, // later pass active org id here
                }),
            });

            const data = await res.json();
            const assistantMessage: Message = {role: "assistant", content: String(data.text ?? "").trim()};
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`},
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-4 space-y-4 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
            <ScrollArea className="h-[calc(100vh-136px)] p-4" ref={scrollRef}>
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
                                {msg.role === "assistant" && (
                                    <span className="text-lg shrink-0">🤖</span>
                                )}
                                <div
                                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.role === "user" && (
                                    <User className="h-5 w-5 shrink-0 text-muted-foreground"/>
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
            </ScrollArea>

            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Talk to Comend Assistant`}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    disabled={isLoading}
                    className="w-[calc(100vw-336px)] h-full"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                </Button>
            </div>
        </div>
    )
}
