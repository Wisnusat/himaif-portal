import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Member } from "@/models/member"

export async function GET() {
  await dbConnect()
  const members = await Member.find().sort({ nama: 1 }).lean()
  return NextResponse.json({ members })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { nim, nama, divisi, kelas, jabatan } = body
  if (!nim || !nama || !divisi || !kelas || !jabatan) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
  }
  await dbConnect()
  try {
    const created = await Member.create({ nim, nama, divisi, kelas, jabatan })
    return NextResponse.json({ ok: true, member: created })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Create failed" }, { status: 400 })
  }
}
