"use client"

import { useState, useEffect } from "react"
import { Contact, Priority, Status, priorityLabels, statusLabels } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
  onSave: (contact: Omit<Contact, "id" | "activities">) => void
}

const emptyContact: Omit<Contact, "id" | "activities"> = {
  name: "",
  email: "",
  company: "",
  title: "",
  linkedinUrl: "",
  notes: "",
  priority: "medium",
  status: "to-reach-out",
  lastContact: null,
  nextFollowUp: null,
}

export function ContactModal({
  open,
  onOpenChange,
  contact,
  onSave,
}: ContactModalProps) {
  const [formData, setFormData] = useState<Omit<Contact, "id" | "activities">>(
    emptyContact
  )

  useEffect(() => {
    if (contact) {
      const { id, activities, ...rest } = contact
      setFormData(rest)
    } else {
      setFormData(emptyContact)
    }
  }, [contact, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Edit Contact" : "Add Contact"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Engineering Manager"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as Priority })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityLabels) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Status })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabels) as Status[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastContact">Last Contact</Label>
              <Input
                id="lastContact"
                type="date"
                value={formData.lastContact || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastContact: e.target.value || null,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUp">Next Follow-Up</Label>
              <Input
                id="nextFollowUp"
                type="date"
                value={formData.nextFollowUp || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextFollowUp: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add notes about this contact..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {contact ? "Save Changes" : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
