import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbConnect } from "@/lib/mongoose"
import { Event } from "@/models/event"
import { Member } from "@/models/member"
import { Types } from "mongoose"

function toRad(x: number) {
  return (x * Math.PI) / 180
}
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const aa = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
  return R * c
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const nim = cookies().get("user_nim")?.value
  if (!nim) return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 })
  const { lat, lng } = await req.json().catch(() => ({}))
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ ok: false, error: "Missing geolocation" }, { status: 400 })
  }
  await dbConnect()
  const member = await Member.findOne({ nim })
  if (!member) return NextResponse.json({ ok: false, error: "Member not found" }, { status: 404 })

  const id = params.id
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 })
  const event = await Event.findById(id)
  if (!event) return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 })

  // Check if event manually finished
  if (event.endedAt) {
    return NextResponse.json({ ok: false, error: "Event has been finished" }, { status: 400 })
  }

  // Check invited
  const isInvited = event.invitedMembers.some((m) => m.toString() === member._id.toString())
  if (!isInvited) return NextResponse.json({ ok: false, error: "Not invited to this event" }, { status: 403 })

  const now = new Date()
  const start = new Date(event.startAt)
  // allow check-in window: from start to +4 hours
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
  if (now < start || now > end) {
    return NextResponse.json({ ok: false, error: "Event is not active for check-in" }, { status: 400 })
  }

  const d = distanceMeters({ lat: event.location.lat, lng: event.location.lng }, { lat, lng })
  if (d > (event.location.radiusMeters || 500)) {
    return NextResponse.json({ ok: false, error: "Outside event radius", distance: Math.round(d) }, { status: 403 })
  }

  const already = event.attendance.find((a) => a.member.toString() === member._id.toString())
  if (already) {
    return NextResponse.json({ ok: true, message: "Already checked in", repeat: true })
  }

  event.attendance.push({
    member: member._id,
    checkinAt: now,
    locationLat: lat,
    locationLng: lng,
  })
  await event.save()

  const lateThreshold = new Date(start.getTime() + (event.lateAfterMinutes || 0) * 60 * 1000)
  const isLate = now > lateThreshold

  return NextResponse.json({ ok: true, late: isLate })
}
