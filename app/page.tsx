"use client"

import { useState } from "react"
import Link from "next/link"
import { useContactStore } from "@/lib/store"
import { Contact } from "@/lib/data"
import { ContactsTable } from "@/components/contacts-table"
import { ContactModal } from "@/components/contact-modal"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function HomePage() {
  const { contacts, addContact, updateContact } = useContactStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setModalOpen(true)
  }

  const handleSaveContact = (contact: Contact) => {
    if (editingContact) {
      updateContact(contact.id, contact)
    } else {
      addContact(contact)
    }
    setEditingContact(null)
  }

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setEditingContact(null)
    }
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
              <Button variant="outline" asChild>
                <Link href="/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import LinkedIn CSV
                </Link>
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </header>

        <ContactsTable contacts={contacts} onEditContact={handleEditContact} />

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
