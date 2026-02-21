"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react"

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "badtrade"
const SESSION_KEY = "bt_auth"
const REMEMBER_KEY = "bt_remember"

interface LoginGateProps {
    children: React.ReactNode
}

export function LoginGate({ children }: LoginGateProps) {
    const [authenticated, setAuthenticated] = React.useState(false)
    const [checking, setChecking] = React.useState(true)
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [rememberMe, setRememberMe] = React.useState(false)
    const [shaking, setShaking] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Check session on mount
    React.useEffect(() => {
        const remembered = localStorage.getItem(REMEMBER_KEY)
        const session = sessionStorage.getItem(SESSION_KEY)
        if (remembered === "1" || session === "1") setAuthenticated(true)
        setChecking(false)
    }, [])

    // Listen for logout event from external buttons
    React.useEffect(() => {
        const handleLogout = () => {
            sessionStorage.removeItem(SESSION_KEY)
            localStorage.removeItem(REMEMBER_KEY)
            setAuthenticated(false)
            setPassword("")
        }
        window.addEventListener("bt-logout", handleLogout)
        return () => window.removeEventListener("bt-logout", handleLogout)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === APP_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, "1")
            if (rememberMe) localStorage.setItem(REMEMBER_KEY, "1")
            setAuthenticated(true)
        } else {
            setError(true)
            setShaking(true)
            setTimeout(() => setShaking(false), 500)
            setTimeout(() => setError(false), 2000)
        }
    }

    // Loading check
    if (checking) {
        return (
            <div className="min-h-screen bg-brand-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-700 border-t-brand-gold rounded-full animate-spin" />
            </div>
        )
    }

    // Already authenticated
    if (authenticated) return <>{children}</>

    // Login screen
    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 selection:bg-brand-gold/30">
            {/* Background pattern */}
            <div className="fixed inset-0 opacity-[0.03]" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 51px),
                                  repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 51px)`
            }} />

            <div className={cn(
                "relative w-full max-w-sm",
                shaking && "animate-[shake_0.5s_ease-in-out]"
            )}>
                {/* Card */}
                <div className="bg-brand-gray border border-sidebar-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold to-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(240,185,11,0.3)]">
                            <span className="text-2xl font-black text-black">B</span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold tracking-wider text-white">
                                BAD<span className="text-brand-gold">TRADE</span>
                            </h1>
                            <p className="text-[11px] font-mono text-gray-600 mt-1 uppercase tracking-widest">
                                Protocol Access Required
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                                placeholder="Enter access code"
                                autoFocus
                                className={cn(
                                    "w-full bg-brand-black border rounded-lg px-4 py-3 pr-10 font-mono text-sm text-white placeholder:text-gray-700 focus:outline-none transition-all duration-200",
                                    error
                                        ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                        : "border-sidebar-border focus:border-gray-600 focus:ring-1 focus:ring-gray-600/30"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-xs font-mono animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertTriangle className="w-3 h-3" />
                                Access denied. Invalid code.
                            </div>
                        )}

                        {/* Remember me */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-gray-700 bg-brand-black text-brand-gold focus:ring-brand-gold/30 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[11px] font-mono text-gray-600 group-hover:text-gray-400 transition-colors">Keep me logged in</span>
                        </label>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-gold/90 to-brand-gold font-mono text-sm font-bold text-black uppercase tracking-widest hover:from-brand-gold hover:to-yellow-400 transition-all duration-200 shadow-[0_0_15px_rgba(240,185,11,0.2)] hover:shadow-[0_0_25px_rgba(240,185,11,0.4)] active:scale-[0.98]"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Authenticate
                            </div>
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] font-mono text-gray-700 mt-4 tracking-wider">
                    v0.1.0-alpha · TESTNET
                </p>
            </div>

            {/* Shake animation */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    )
}
