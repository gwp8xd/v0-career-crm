"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Contact, Priority, Status, priorityLabels, statusLabels } from "@/lib/data"
import { PriorityBadge } from "./priority-badge"
import { StatusBadge } from "./status-badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Trash2 } from "lucide-react"

interface ContactsTableProps {
  contacts: Contact[]
  onDeleteContact?: (contactId: string) => void
}

export function ContactsTable({ contacts, onDeleteContact }: ContactsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.company.toLowerCase().includes(search.toLowerCase()) ||
        contact.title.toLowerCase().includes(search.toLowerCase())

      const matchesPriority =
        priorityFilter === "all" || contact.priority === priorityFilter

      const matchesStatus =
        statusFilter === "all" || contact.status === statusFilter

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [contacts, search, priorityFilter, statusFilter])

  const formatDate = (date: string | null) => {
    if (!date) return "—"
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = date.split("-").map(Number)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[month - 1]} ${day}, ${year}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as Priority | "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(Object.keys(priorityLabels) as Priority[]).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priorityLabels[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as Status | "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(statusLabels) as Status[]).map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Contact</TableHead>
              <TableHead className="font-semibold">Next Follow-Up</TableHead>
              {onDeleteContact && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={onDeleteContact ? 8 : 7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <TableCell className="font-medium text-foreground">
                    {contact.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.company}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.title}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={contact.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={contact.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contact.lastContact)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contact.nextFollowUp)}
                  </TableCell>
                  {onDeleteContact && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTargetId(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact and all their activity history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTargetId) {
                  onDeleteContact?.(deleteTargetId)
                  setDeleteTargetId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
