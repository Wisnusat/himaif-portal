"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function UserLoginPage() {
  const [nim, setNim] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/user-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim }),
    })
    setLoading(false)
    if (res.ok) {
      router.push("/user/scan")
    } else {
      const j = await res.json().catch(() => ({}))
      toast({ title: "Login failed", description: j?.error || "NIM not found" })
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-balance">User Login (NIM)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <Input placeholder="Enter your NIM" value={nim} onChange={(e) => setNim(e.target.value)} required />
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Admin?{" "}
              <a href="/admin/login" className="underline">
                Go to Admin Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
