"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Contact } from "@/lib/data"
import { ContactModal } from "@/components/contact-modal"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Building2,
  Mail,
  Linkedin,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Pencil,
} from "lucide-react"

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    async function fetchContact() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("*, activities(*)")
        .eq("id", id)
        .single()

      if (error || !data) {
        setContact(null)
      } else {
        setContact({
          id: data.id,
          name: data.name,
          email: data.email || "",
          company: data.company || "",
          title: data.title || "",
          linkedinUrl: data.linkedin_url || "",
          notes: data.notes || "",
          priority: data.priority as Contact["priority"],
          status: data.status as Contact["status"],
          lastContacted: data.last_contacted,
          nextFollowUp: data.next_follow_up,
          activities: (data.activities || []).map((a: { id: string; note: string; created_at: string }) => ({
            id: a.id,
            date: a.created_at.split("T")[0],
            note: a.note,
          })),
        })
      }
      setLoading(false)
    }
    fetchContact()
  }, [id])

  const formatDate = (date: string | null) => {
    if (!date) return "Not set"
    const [year, month, day] = date.split("-").map(Number)
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${months[month - 1]} ${day}, ${year}`
  }

  const handleMarkReachedOut = async () => {
    if (!contact) return
    const today = new Date().toISOString().split("T")[0]
    
    await supabase
      .from("contacts")
      .update({
        status: "reached_out",
        last_contacted: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id)

    await supabase.from("activities").insert({
      contact_id: contact.id,
      note: "Marked as reached out",
    })

    setContact({
      ...contact,
      status: "reached_out",
      lastContacted: today,
      activities: [
        { id: crypto.randomUUID(), date: today, note: "Marked as reached out" },
        ...contact.activities,
      ],
    })
  }

  const handleAddNote = async () => {
    if (!contact || !newNote.trim()) return
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("activities")
      .insert({
        contact_id: contact.id,
        note: newNote.trim(),
      })
      .select()
      .single()

    if (data) {
      setContact({
        ...contact,
        activities: [
          { id: data.id, date: today, note: newNote.trim() },
          ...contact.activities,
        ],
      })
    }
    setNewNote("")
  }

  const handleSaveContact = async (updated: Contact) => {
    await supabase
      .from("contacts")
      .update({
        name: updated.name,
        email: updated.email || null,
        company: updated.company || null,
        title: updated.title || null,
        linkedin_url: updated.linkedinUrl || null,
        notes: updated.notes || null,
        priority: updated.priority,
        status: updated.status,
        last_contacted: updated.lastContacted || null,
        next_follow_up: updated.nextFollowUp || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updated.id)

    setContact(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Contact not found
            </h1>
            <p className="mt-2 text-muted-foreground">
              The contact you're looking for doesn't exist.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Back to Contacts</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-3">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {contact.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <PriorityBadge priority={contact.priority} />
              <StatusBadge status={contact.status} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Contact
            </Button>
            {contact.status !== "reached_out" && contact.status !== "done" && (
              <Button onClick={handleMarkReachedOut}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Reached Out
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{contact.company || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{contact.title || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">LinkedIn:</span>
                  {contact.linkedinUrl ? (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {contact.notes || "No notes added yet."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this contact..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="self-end"
                  >
                    Add Note
                  </Button>
                </div>

                {contact.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No activity recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3 pt-2">
                    {contact.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 border-l-2 border-border pl-4 py-1"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            {activity.note}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Follow-up Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Last Contact</p>
                    <p className="font-medium">
                      {formatDate(contact.lastContacted)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Next Follow-Up</p>
                    <p className="font-medium">
                      {formatDate(contact.nextFollowUp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ContactModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          contact={contact}
          onSave={handleSaveContact}
        />
      </div>
    </div>
  )
}
