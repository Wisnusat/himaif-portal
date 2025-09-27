import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/mongoose"
import { Member } from "@/models/member"

export async function POST(req: Request) {
  const { nim } = await req.json().catch(() => ({}))
  if (!nim) return NextResponse.json({ ok: false, error: "NIM required" }, { status: 400 })
  await dbConnect()
  const member = await Member.findOne({ nim })
  if (!member) return NextResponse.json({ ok: false, error: "NIM not found" }, { status: 404 })
  cookies().set("user_nim", nim, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 6, // 6h
  })
  return NextResponse.json({ ok: true })
}
