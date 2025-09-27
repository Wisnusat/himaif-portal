import { dbConnect } from "@/lib/mongoose"
import { Member } from "@/models/member"
import NewEventClient from "./parts"

export default async function NewEventPage() {
  await dbConnect()
  const members = await Member.find().sort({ nama: 1 }).select("_id nim nama").lean()
  return <NewEventClient members={JSON.parse(JSON.stringify(members))} />
}
