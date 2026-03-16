"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ParsedContact {
  name: string
  email: string
  company: string
  title: string
  connectedOn: string
}

export default function ImportPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [importSuccess, setImportSuccess] = useState(false)
  const [fileName, setFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUserId(user.id)
    }
    checkAuth()
  }, [])

  const parseCSV = (text: string): ParsedContact[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const nameIdx = headers.findIndex(
      (h) => h.includes("first") || h.includes("name")
    )
    const lastNameIdx = headers.findIndex((h) => h.includes("last"))
    const emailIdx = headers.findIndex((h) => h.includes("email"))
    const companyIdx = headers.findIndex((h) => h.includes("company"))
    const titleIdx = headers.findIndex(
      (h) => h.includes("title") || h.includes("position")
    )
    const connectedIdx = headers.findIndex((h) => h.includes("connected"))

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const firstName = nameIdx >= 0 ? values[nameIdx] || "" : ""
      const lastName = lastNameIdx >= 0 ? values[lastNameIdx] || "" : ""
      const name = lastName ? `${firstName} ${lastName}` : firstName

      return {
        name,
        email: emailIdx >= 0 ? values[emailIdx] || "" : "",
        company: companyIdx >= 0 ? values[companyIdx] || "" : "",
        title: titleIdx >= 0 ? values[titleIdx] || "" : "",
        connectedOn: connectedIdx >= 0 ? values[connectedIdx] || "" : "",
      }
    })
  }

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Invalid file type", description: "Please upload a CSV file.", variant: "destructive" })
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const contacts = parseCSV(text)
      setParsedContacts(contacts)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (!userId) return
    setImporting(true)

    const contactsToImport = parsedContacts.map((pc) => ({
      user_id: userId,
      name: pc.name,
      email: pc.email || null,
      company: pc.company || null,
      title: pc.title || null,
      linkedin_url: null,
      notes: `Imported from LinkedIn. Connected on: ${pc.connectedOn || "Unknown"}`,
      priority: "medium",
      status: "to-reach-out",
      last_contacted: null,
      next_follow_up: null,
    }))

    const { error } = await supabase.from("contacts").insert(contactsToImport)

    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" })
      setImporting(false)
      return
    }

    setImportSuccess(true)
    setImporting(false)
  }

  if (importSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Import Successful
            </h1>
            <p className="text-muted-foreground mb-8">
              {parsedContacts.length} contacts have been imported to your CRM.
            </p>
            <Button asChild>
              <Link href="/">View Contacts</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-3">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Link>
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Import LinkedIn Contacts
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a CSV file exported from LinkedIn to import your connections.
          </p>
        </header>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }
              `}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Select CSV File
                </label>
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>How to export from LinkedIn:</strong> Go to LinkedIn
                Settings → Data Privacy → Get a copy of your data → Select
                "Connections" → Download
              </p>
            </div>
          </CardContent>
        </Card>

        {parsedContacts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Preview Import
                </h2>
                <p className="text-sm text-muted-foreground">
                  {fileName} • {parsedContacts.length} contacts found
                </p>
              </div>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? "Importing..." : `Import ${parsedContacts.length} Contacts`}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Connected On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedContacts.slice(0, 10).map((contact, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {contact.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.email || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.company || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.title || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.connectedOn || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedContacts.length > 10 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing first 10 of {parsedContacts.length} contacts
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
