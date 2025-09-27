"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function NewEventClient({ members }: { members: any[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = useState("")
  const [startAt, setStartAt] = useState("")
  const [lateAfterMinutes, setLateAfterMinutes] = useState<number>(10)
  const [location, setLocation] = useState({ lat: "", lng: "", radiusMeters: "500" })
  const [selected, setSelected] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function onUseCurrentLocation() {
    if (!navigator.geolocation) return toast({ title: "Location unavailable" })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((l) => ({ ...l, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }))
      },
      () => toast({ title: "Location permission denied" }),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body: any = {
      name,
      startAt: new Date(startAt).toISOString(),
      lateAfterMinutes: Number(lateAfterMinutes),
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
        radiusMeters: Number(location.radiusMeters || 500),
      },
      invitedMemberIds: selected,
      selectAll,
    }
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      toast({ title: "Event created" })
      router.push(`/admin/events/${j.event._id}`)
    } else {
      toast({ title: "Failed", description: j?.error || "Error" })
    }
  }

  return (
    <main className="min-h-dvh mx-auto max-w-5xl p-6 grid gap-6">
      <h1 className="text-2xl font-semibold">Create Event</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label className="mb-1">Date & Time</Label>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1">Latitude</Label>
                <Input
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Longitude</Label>
                <Input
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Radius (m)</Label>
                <Input
                  value={location.radiusMeters}
                  onChange={(e) => setLocation({ ...location, radiusMeters: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <Button type="button" variant="secondary" onClick={onUseCurrentLocation}>
                  Use Current Location
                </Button>
              </div>
            </div>
            <div>
              <Label className="mb-1">Late After (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={lateAfterMinutes}
                onChange={(e) => setLateAfterMinutes(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="selall"
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                />
                <Label htmlFor="selall">Invite all members</Label>
              </div>
              {!selectAll && (
                <div className="max-h-64 overflow-auto border rounded-md p-3">
                  <div className="grid md:grid-cols-2 gap-2">
                    {members.map((m: any) => (
                      <label key={m._id} className="flex items-center gap-2">
                        <input type="checkbox" checked={selected.includes(m._id)} onChange={() => toggle(m._id)} />
                        <span className="text-sm">
                          {m.nama} ({m.nim})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
