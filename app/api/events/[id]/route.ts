import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Event } from "@/models/event"
import { Types } from "mongoose"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  const id = params.id
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 })
  const event = await Event.findById(id).populate("invitedMembers").populate("attendance.member").lean()
  if (!event) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, event })
}
