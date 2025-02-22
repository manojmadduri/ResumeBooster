
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

export function ProfilePage() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      if (!res.ok) throw new Error("Failed to change password")
      toast({ title: "Password changed successfully" })
      setNewPassword("")
    } catch (error) {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Email</h2>
          <p>{user?.email}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
            <Button type="submit">Change Password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
