"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Contact } from "@/lib/data"
import { ContactsTable } from "@/components/contacts-table"
import { ContactModal } from "@/components/contact-modal"
import { Button } from "@/components/ui/button"
import { Plus, Upload, LogOut } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      await fetchContacts()
      setLoading(false)
    }
    init()
  }, [])

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*, activities(*)")
      .order("created_at", { ascending: false })

    if (error) {
      toast({ title: "Failed to load contacts", description: error.message, variant: "destructive" })
      return
    }
    if (data) {
      const mappedContacts: Contact[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email || "",
        company: c.company || "",
        title: c.title || "",
        linkedinUrl: c.linkedin_url || "",
        notes: c.notes || "",
        priority: c.priority as Contact["priority"],
        status: c.status as Contact["status"],
        lastContact: c.last_contacted,
        nextFollowUp: c.next_follow_up,
        activities: (c.activities || []).map((a: { id: string; note: string; created_at: string }) => ({
          id: a.id,
          date: a.created_at.split("T")[0],
          note: a.note,
        })),
      }))
      setContacts(mappedContacts)
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setModalOpen(true)
  }

  const handleSaveContact = async (contact: Contact) => {
    if (editingContact) {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: contact.name,
          email: contact.email || null,
          company: contact.company || null,
          title: contact.title || null,
          linkedin_url: contact.linkedinUrl || null,
          notes: contact.notes || null,
          priority: contact.priority,
          status: contact.status,
          last_contacted: contact.lastContact || null,
          next_follow_up: contact.nextFollowUp || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.id)
      if (error) {
        toast({ title: "Failed to update contact", description: error.message, variant: "destructive" })
        return
      }
    } else {
      const { error } = await supabase.from("contacts").insert({
        user_id: user?.id,
        name: contact.name,
        email: contact.email || null,
        company: contact.company || null,
        title: contact.title || null,
        linkedin_url: contact.linkedinUrl || null,
        notes: contact.notes || null,
        priority: contact.priority,
        status: contact.status,
        last_contacted: contact.lastContact || null,
        next_follow_up: contact.nextFollowUp || null,
      })
      if (error) {
        toast({ title: "Failed to add contact", description: error.message, variant: "destructive" })
        return
      }
    }
    setEditingContact(null)
    await fetchContacts()
  }

  const handleDeleteContact = async (contactId: string) => {
    await supabase.from("contacts").delete().eq("id", contactId)
    setContacts((prev) => prev.filter((c) => c.id !== contactId))
  }

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setEditingContact(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Career CRM
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track your network and prioritize outreach
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" asChild>
                <Link href="/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Link>
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </header>

        <ContactsTable contacts={contacts} onEditContact={handleEditContact} onDeleteContact={handleDeleteContact} />

        <ContactModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          onSave={handleSaveContact}
          contact={editingContact}
        />
      </div>
    </div>
  )
}
