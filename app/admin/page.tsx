import Link from "next/link"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import crypto from "crypto"

const SECRET = process.env.ADMIN_TOKEN_SECRET || "demo-secret-only-for-dev"
function verify(token?: string | null) {
  if (!token) return false
  const [value, sig] = token.split(".")
  if (!value || !sig) return false
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex")
  return value === "admin" && sig === expected
}

export default async function AdminHome() {
  const token = cookies().get("admin_token")?.value || null
  const ok = verify(token)
  if (!ok) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Please login as admin.</p>
            <p className="mt-2">
              <Link href="/admin/login" className="underline">
                Go to Admin Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-dvh mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-6 text-balance">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/members">
          <Card className="hover:bg-muted transition-colors">
            <CardHeader>
              <CardTitle>Manage Members</CardTitle>
            </CardHeader>
            <CardContent>Add or upload members (CSV)</CardContent>
          </Card>
        </Link>
        <Link href="/admin/events/new">
          <Card className="hover:bg-muted transition-colors">
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
            </CardHeader>
            <CardContent>Set name, time, location and invited members</CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
