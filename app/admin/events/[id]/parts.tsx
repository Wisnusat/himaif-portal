"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EventClient({
  initialEvent,
  invitedMembers,
  allMembers,
}: {
  initialEvent: any
  invitedMembers: any[]
  allMembers: any[]
}) {
  const id = initialEvent?._id
  const { data, mutate } = useSWR(`/api/events/${id}`, fetcher, {
    refreshInterval: 5000,
    fallbackData: { ok: true, event: initialEvent },
  })
  const ev = data?.event
  const [qrUrl, setQrUrl] = useState<string>("")

  const now = new Date()
  const start = new Date(ev?.startAt ?? now)
  const activeWindow = useMemo(() => {
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
    return now >= start && now <= end
  }, [start, now])

  useEffect(() => {
    // QR contains a minimal JSON payload with eventId
    const payload = JSON.stringify({ eventId: id })
    QRCode.toDataURL(payload, { margin: 1, width: 256 })
      .then(setQrUrl)
      .catch(() => setQrUrl(""))
  }, [id])

  const invited = invitedMembers || []
  const attendance = ev?.attendance || []
  const attendedIds = new Set(attendance.map((a: any) => a.member?._id || a.member))
  const lateAfter = new Date(new Date(ev?.startAt).getTime() + (ev?.lateAfterMinutes || 0) * 60 * 1000)

  const rows = invited.map((m: any) => {
    const rec = attendance.find((a: any) => (a.member?._id || a.member) === m._id)
    const status = rec ? (new Date(rec.checkinAt) > lateAfter ? "Late" : "Present") : "Absent"
    return { ...m, status, checkinAt: rec?.checkinAt }
  })

  return (
    <main className="min-h-dvh mx-auto max-w-5xl p-6 grid gap-6">
      <h1 className="text-2xl font-semibold text-balance">{ev?.name}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event QR</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm">Event ID: {id}</p>
            {activeWindow ? (
              qrUrl ? (
                <img src={qrUrl || "/placeholder.svg"} alt="Event QR" className="w-64 h-64" />
              ) : (
                <p>Generating QR...</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">QR is available during the event time only.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid gap-1">
            <p>
              Start: {new Date(ev?.startAt).toLocaleString()} | Late after: {ev?.lateAfterMinutes} min
            </p>
            <p>
              Location: {ev?.location?.lat}, {ev?.location?.lng} | Radius: {ev?.location?.radiusMeters} m
            </p>
            <p>
              Invited: {invited.length} | Attended: {attendance.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="py-2">NIM</th>
                  <th>Nama</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r._id} className="border-b last:border-0">
                    <td className="py-2">{r.nim}</td>
                    <td>{r.nama}</td>
                    <td>
                      <Badge
                        variant={r.status === "Present" ? "default" : r.status === "Late" ? "destructive" : "secondary"}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td>{r.checkinAt ? new Date(r.checkinAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
