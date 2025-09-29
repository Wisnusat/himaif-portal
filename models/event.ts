import { Schema, model, models, type Document, type Types } from "mongoose"

export interface IAttendance {
  member: Types.ObjectId
  checkinAt: Date
  locationLat?: number
  locationLng?: number
}

export interface IEvent extends Document {
  name: string
  startAt: Date
  lateAfterMinutes: number
  location: {
    lat: number
    lng: number
    radiusMeters: number
  }
  invitedMembers: Types.ObjectId[]
  attendance: IAttendance[]
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    checkinAt: { type: Date, required: true },
    locationLat: Number,
    locationLng: Number,
  },
  { _id: false },
)

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    startAt: { type: Date, required: true },
    lateAfterMinutes: { type: Number, default: 10 },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      radiusMeters: { type: Number, default: 500 },
    },
    invitedMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    attendance: [AttendanceSchema],
    endedAt: { type: Date },
  },
  { timestamps: true },
)

export const Event = models.Event || model<IEvent>("Event", EventSchema)
