import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Event } from "@/models/event"
import { Member } from "@/models/member"

export async function GET() {
  await dbConnect()
  const events = await Event.find().sort({ startAt: -1 }).select("name startAt endedAt").lean()
  return NextResponse.json({ events })
}

export async function POST(req: Request) {
  await dbConnect()
  const body = await req.json().catch(() => ({}))
  const { name, startAt, lateAfterMinutes = 10, location, invitedMemberIds = [], selectAll = false } = body
  if (!name || !startAt || !location?.lat || !location?.lng) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
  }
  let invited = invitedMemberIds
  if (selectAll) {
    const ids = await Member.find().select("_id").lean()
    invited = ids.map((d: any) => d._id)
  }
  const event = await Event.create({
    name,
    startAt: new Date(startAt),
    lateAfterMinutes,
    location: {
      lat: Number(location.lat),
      lng: Number(location.lng),
      radiusMeters: Number(location.radiusMeters || 500),
    },
    invitedMembers: invited,
    attendance: [],
  })
  return NextResponse.json({ ok: true, event })
}
