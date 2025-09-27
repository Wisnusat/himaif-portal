import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  // It's okay to throw here; server routes will show friendly errors.
  throw new Error("Missing MONGODB_URI environment variable")
}

type GlobalWithMongoose = typeof globalThis & {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

let cached = (global as GlobalWithMongoose).mongooseConn

if (!cached) {
  cached = (global as GlobalWithMongoose).mongooseConn = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached!.conn) return cached!.conn
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI)
  }
  cached!.conn = await cached!.promise
  return cached!.conn
}
