import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const ADMIN_USER = "moomoo"
const ADMIN_PASS = "katalisatorkatalisator2025"
const SECRET = process.env.ADMIN_TOKEN_SECRET || "demo-secret-only-for-dev"

function sign(value: string) {
  const h = crypto.createHmac("sha256", SECRET).update(value).digest("hex")
  return `${value}.${h}`
}
export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}))
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 })
  }
  const token = sign("admin")
  cookies().set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 6, // 6h
  })
  return NextResponse.json({ ok: true })
}
