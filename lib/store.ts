"use client"

import { create } from "zustand"
import { Contact, sampleContacts } from "./data"

interface ContactStore {
  contacts: Contact[]
  addContact: (contact: Omit<Contact, "id" | "activities">) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  addActivity: (contactId: string, note: string) => void
  importContacts: (contacts: Omit<Contact, "id" | "activities">[]) => void
}

export const useContactStore = create<ContactStore>((set) => ({
  contacts: sampleContacts,
  addContact: (contact) =>
    set((state) => ({
      contacts: [
        ...state.contacts,
        {
          ...contact,
          id: Math.random().toString(36).substring(7),
          activities: [],
        },
      ],
    })),
  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),
  addActivity: (contactId, note) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              activities: [
                {
                  id: Math.random().toString(36).substring(7),
                  date: new Date().toISOString().split("T")[0],
                  note,
                },
                ...c.activities,
              ],
              lastContact: new Date().toISOString().split("T")[0],
            }
          : c
      ),
    })),
  importContacts: (contacts) =>
    set((state) => ({
      contacts: [
        ...state.contacts,
        ...contacts.map((c) => ({
          ...c,
          id: Math.random().toString(36).substring(7),
          activities: [],
        })),
      ],
    })),
}))
