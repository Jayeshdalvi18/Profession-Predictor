"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { Menu, Home, Info, Mail, LogIn, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface NavbarUser {
  username?: string
  email?: string
  isGuest?: boolean
}

const Navbar = () => {
  const { data: session, status } = useSession()
  const user: NavbarUser = session?.user as NavbarUser
  const [isOpen, setIsOpen] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const router = useRouter()

  // Check for guest cookie if not authenticated via NextAuth
  useEffect(() => {
    const checkGuestStatus = async () => {
      if (status === "unauthenticated") {
        try {
          const response = await fetch("/api/guest-check")
          if (response.ok) {
            const data = await response.json()
            setIsGuest(data.isGuest)
          }
        } catch (error) {
          console.error("Error checking guest status:", error)
        }
      }
    }

    checkGuestStatus()
  }, [status])

  const handleSignOut = async () => {
    if (isGuest) {
      // Clear guest cookie
      await fetch("/api/guest-logout", { method: "POST" })
      setIsGuest(false)
    } else {
      // Sign out from NextAuth
      await signOut({ redirect: false })
    }

    setIsOpen(false)
    router.push("/signIn")
  }

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link className="flex items-center space-x-2" href="/">
          <span className="text-xl font-bold">Profession Predictor</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          {session || isGuest ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {isGuest ? "Guest User" : `Welcome, ${user?.username || user?.email}`}
              </span>
              <Button onClick={handleSignOut}>Log Out</Button>
            </div>
          ) : (
            <Link href="/signIn">
              <Button>Log In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {session || isGuest ? (
                <>
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <User className="h-5 w-5" />
                    <span>{isGuest ? "Guest User" : user?.username || user?.email}</span>
                  </div>
                  <Button className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </>
              ) : (
                <Link href="/signIn" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

export default Navbar

