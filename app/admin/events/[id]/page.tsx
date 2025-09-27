import { dbConnect } from "@/lib/mongoose"
import { Event } from "@/models/event"
import { Member } from "@/models/member"
import EventClient from "./parts"
import { Types } from "mongoose"

export default async function EventDetail({ params }: { params: { id: string } }) {
  await dbConnect()
  if (!Types.ObjectId.isValid(params.id)) {
    return <main className="p-6">Invalid event id</main>
  }
  const event = await Event.findById(params.id).populate("attendance.member").lean()
  const invited = await Event.findById(params.id).populate("invitedMembers").lean()
  const allMembers = await Member.find().select("_id nim nama").lean()

  return (
    <EventClient
      initialEvent={JSON.parse(JSON.stringify(event))}
      invitedMembers={JSON.parse(JSON.stringify(invited?.invitedMembers || []))}
      allMembers={JSON.parse(JSON.stringify(allMembers))}
    />
  )
}
