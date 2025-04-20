"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { ProfileSection } from "@/components/settings/ProfileSection"
import { PersonalDetailsSection } from "@/components/settings/PersonalDetailsSection"
import { NotificationsSection } from "@/components/settings/NotificationsSection"
import { PrivacySection } from "@/components/settings/PrivacySection"
import { AuthProvider, useAuth } from "@/lib/AuthContext"

// Create a protected settings component
function ProtectedSettings() {
  const [activeTab, setActiveTab] = useState("profile")
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <SettingsLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ProfileSection />
      <PersonalDetailsSection />
      <NotificationsSection />
      <PrivacySection />
    </SettingsLayout>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <ProtectedSettings />
    </AuthProvider>
  )
}
