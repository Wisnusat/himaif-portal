"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MembersClient({ initialMembers }: { initialMembers: any[] }) {
  const { data, mutate } = useSWR("/api/members", fetcher, { fallbackData: { members: initialMembers } })
  const { toast } = useToast()
  const [form, setForm] = useState({ nim: "", nama: "", divisi: "", kelas: "", jabatan: "" })
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast({ title: "Member saved" })
      setForm({ nim: "", nama: "", divisi: "", kelas: "", jabatan: "" })
      mutate()
    } else {
      const j = await res.json().catch(() => ({}))
      toast({ title: "Failed", description: j?.error || "Error" })
    }
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      return
    }
    setFile(f)
  }

  async function onBulkSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/members/upload", { method: "POST", body: fd })
    setUploading(false)
    setFile(null)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      toast({ title: "Upload complete", description: `${j.created} records processed` })
      mutate()
    } else {
      toast({ title: "Upload failed", description: j?.error || "Invalid file" })
    }
  }

  return (
    <main className="min-h-dvh mx-auto max-w-5xl p-6 grid gap-6">
      <h1 className="text-2xl font-semibold">Members</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addMember} className="grid gap-3 md:grid-cols-5">
            <Input
              placeholder="NIM"
              value={form.nim}
              onChange={(e) => setForm({ ...form, nim: e.target.value })}
              required
            />
            <Input
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
            <Input
              placeholder="Divisi"
              value={form.divisi}
              onChange={(e) => setForm({ ...form, divisi: e.target.value })}
              required
            />
            <Input
              placeholder="Kelas"
              value={form.kelas}
              onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              required
            />
            <Input
              placeholder="Jabatan"
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              required
            />
            <div className="md:col-span-5">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload (CSV)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onBulkSubmit} className="grid gap-3">
            <Input type="file" accept=".csv" onChange={onUpload} disabled={uploading} />
            <p className="text-sm text-muted-foreground">Required columns: nim,nama,divisi,kelas,jabatan</p>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="py-2">NIM</th>
                  <th>Nama</th>
                  <th>Divisi</th>
                  <th>Kelas</th>
                  <th>Jabatan</th>
                </tr>
              </thead>
              <tbody>
                {data?.members?.map((m: any) => (
                  <tr key={m._id} className="border-b last:border-0">
                    <td className="py-2">{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.divisi}</td>
                    <td>{m.kelas}</td>
                    <td>{m.jabatan}</td>
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
