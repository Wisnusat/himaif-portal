import { Schema, model, models, type Document } from "mongoose"

export interface IMember extends Document {
  nim: string
  nama: string
  divisi: string
  kelas: string
  jabatan: string
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    nim: { type: String, required: true, unique: true, index: true },
    nama: { type: String, required: true },
    divisi: { type: String, required: true },
    kelas: { type: String, required: true },
    jabatan: { type: String, required: true },
  },
  { timestamps: true },
)

export const Member = models.Member || model<IMember>("Member", MemberSchema)
