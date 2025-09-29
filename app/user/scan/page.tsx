"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

// dynamic import to avoid SSR issues
const QrReader = dynamic(() => import("react-qr-reader").then((m: any) => (m?.QrReader ? m.QrReader : m?.default)), {
  ssr: false,
})

export default function ScanPage() {
  const { toast } = useToast()
  const [scannedText, setScannedText] = useState<string>("")
  const [processing, setProcessing] = useState(false)
  const [manualEventId, setManualEventId] = useState("")

  const eventId = useMemo(() => {
    try {
      const p = JSON.parse(scannedText)
      return p?.eventId || ""
    } catch {
      // also allow raw eventId
      return scannedText && scannedText.length > 10 ? scannedText : ""
    }
  }, [scannedText])

  async function doCheckin(id: string) {
    if (!id) return
    setProcessing(true)
    if (!navigator.geolocation) {
      toast({ title: "Geolocation unavailable", description: "Cannot verify your location" })
      setProcessing(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const res = await fetch(`/api/events/${id}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        })
        setProcessing(false)
        const j = await res.json().catch(() => ({}))
        if (res.ok) {
          toast({
            title: j.repeat ? "Already checked in" : "Attendance recorded",
            description: j.late ? "Status: Late" : "Status: On time",
          })
        } else {
          toast({ title: "Check-in failed", description: j?.error || "Unknown error" })
          if (j?.distance) {
            toast({ title: "Distance", description: `${j.distance} meters from event` })
          }
        }
      },
      () => {
        setProcessing(false)
        toast({ title: "Location denied", description: "Please allow location to check-in" })
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    )
  }

  useEffect(() => {
    if (eventId) {
      doCheckin(eventId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-balance">Scan Event QR</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg overflow-hidden border">
            <QrReader
              constraints={{ facingMode: "environment" }}
              onResult={(result: any, error: any) => {
                if (result) {
                  const txt = result?.getText ? result.getText() : result?.text
                  if (txt) setScannedText(txt)
                }
                // Optionally, you can handle error if needed
                // if (error) { /* silently ignore or toast */ }
              }}
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Or enter Event ID manually</label>
            <div className="flex gap-2">
              <Input value={manualEventId} onChange={(e) => setManualEventId(e.target.value)} placeholder="Event ID" />
              <Button disabled={processing || !manualEventId} onClick={() => doCheckin(manualEventId)}>
                {processing ? "Checking..." : "Check-in"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
