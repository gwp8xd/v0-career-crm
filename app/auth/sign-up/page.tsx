"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

type PasswordStrength = "weak" | "fair" | "good" | "strong"

function getPasswordStrength(password: string): {
  strength: PasswordStrength
  score: number
  checks: { label: string; passed: boolean }[]
} {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Contains lowercase letter", passed: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "Contains number", passed: /[0-9]/.test(password) },
    { label: "Contains special character", passed: /[^A-Za-z0-9]/.test(password) },
  ]

  const score = checks.filter((c) => c.passed).length

  let strength: PasswordStrength = "weak"
  if (score >= 5) strength = "strong"
  else if (score >= 4) strength = "good"
  else if (score >= 3) strength = "fair"

  return { strength, score, checks }
}

const strengthConfig: Record<PasswordStrength, { color: string; bg: string; label: string }> = {
  weak: { color: "bg-red-500", bg: "bg-red-500/20", label: "Weak" },
  fair: { color: "bg-orange-500", bg: "bg-orange-500/20", label: "Fair" },
  good: { color: "bg-yellow-500", bg: "bg-yellow-500/20", label: "Good" },
  strong: { color: "bg-green-500", bg: "bg-green-500/20", label: "Strong" },
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const passwordAnalysis = useMemo(() => getPasswordStrength(password), [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Start managing your professional contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              {password.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < passwordAnalysis.score
                              ? strengthConfig[passwordAnalysis.strength].color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        strengthConfig[passwordAnalysis.strength].bg
                      }`}
                    >
                      {strengthConfig[passwordAnalysis.strength].label}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {passwordAnalysis.checks.map((check) => (
                      <li
                        key={check.label}
                        className={`flex items-center gap-2 text-xs ${
                          check.passed ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {check.passed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
