import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongoose"
import { Member } from "@/models/member"

function parseCSV(text: string) {
  // very simple CSV parser: split by lines, then commas; assumes no quoted commas
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = lines.shift()
  if (!header) return []
  const cols = header.split(",").map((c) => c.trim().toLowerCase())
  const required = ["nim", "nama", "divisi", "kelas", "jabatan"]
  const missing = required.filter((r) => !cols.includes(r))
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`)
  const rows = lines.map((ln) => {
    const vals = ln.split(",").map((v) => v.trim())
    const rec: any = {}
    cols.forEach((c, i) => (rec[c] = vals[i] || ""))
    return rec
  })
  return rows
}

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 })
  const text = await file.text()
  let rows: any[]
  try {
    rows = parseCSV(text)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Invalid CSV" }, { status: 400 })
  }
  await dbConnect()
  let created = 0
  for (const r of rows) {
    if (!r.nim) continue
    try {
      await Member.updateOne(
        { nim: r.nim },
        {
          $set: {
            nim: r.nim,
            nama: r.nama || "",
            divisi: r.divisi || "",
            kelas: r.kelas || "",
            jabatan: r.jabatan || "",
          },
        },
        { upsert: true },
      )
      created++
    } catch {
      // skip invalid row
    }
  }
  return NextResponse.json({ ok: true, created })
}
