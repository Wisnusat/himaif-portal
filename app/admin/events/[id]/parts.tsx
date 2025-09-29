"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
  const isFinished = Boolean(ev?.endedAt)
  const activeWindow = useMemo(() => {
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
    return !isFinished && now >= start && now <= end
  }, [start, now, isFinished])

  const invited = invitedMembers || []
  const attendance = ev?.attendance || []
  const attendedIds = new Set(attendance.map((a: any) => a.member?._id || a.member))
  const lateAfter = new Date(new Date(ev?.startAt).getTime() + (ev?.lateAfterMinutes || 0) * 60 * 1000)

  const rows = invited.map((m: any) => {
    const rec = attendance.find((a: any) => (a.member?._id || a.member) === m._id)
    const status = rec ? (new Date(rec.checkinAt) > lateAfter ? "Late" : "Present") : "Absent"
    return { ...m, status, checkinAt: rec?.checkinAt }
  })

  const totalInvited = invited.length
  const totalPresent = rows.filter((r: any) => r.status === "Present").length
  const totalLate = rows.filter((r: any) => r.status === "Late").length
  const totalAbsent = rows.filter((r: any) => r.status === "Absent").length

  async function finishEvent() {
    try {
      const res = await fetch(`/api/events/${id}/finish`, { method: "POST" })
      const j = await res.json()
      if (j?.ok) {
        mutate()
      }
    } catch (e) {
      // no-op
    }
  }

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
              <p className="text-sm text-muted-foreground">
                {isFinished ? "Event has been finished." : "QR is available during the event time only."}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid gap-2">
            <p>
              Start: {new Date(ev?.startAt).toLocaleString()} | Late after: {ev?.lateAfterMinutes} min
            </p>
            <p>
              Location: {ev?.location?.lat}, {ev?.location?.lng} | Radius: {ev?.location?.radiusMeters} m
            </p>
            <p>
              Invited: {invited.length} | Attended: {attendance.length}
            </p>
            {!isFinished && (
              <Button onClick={finishEvent} variant="destructive" className="w-fit mt-2">
                Finish Event
              </Button>
            )}
            {isFinished && <Badge variant="secondary">Finished at {new Date(ev?.endedAt).toLocaleString()}</Badge>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="secondary">Total Invited: {totalInvited}</Badge>
            <Badge>Present: {totalPresent}</Badge>
            <Badge variant="destructive">Late: {totalLate}</Badge>
            <Badge variant="outline">Absent: {totalAbsent}</Badge>
          </div>
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
