import { dbConnect } from "@/lib/mongoose"
import { Member } from "@/models/member"
import MembersClient from "./parts"

export const dynamic = "force-dynamic"

export default async function MembersPage() {
  await dbConnect()
  const members = await Member.find().sort({ nama: 1 }).lean()
  return <MembersClient initialMembers={JSON.parse(JSON.stringify(members))} />
}
