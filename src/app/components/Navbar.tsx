"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import type { User } from "next-auth"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const Navbar = () => {
  const { data: session } = useSession()
  const user: User = session?.user as User
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-8">
          <Link className="flex items-center space-x-2" href="/">
            <span className="text-xl font-bold">Profession Predictor</span>
          </Link>
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
            <div className="mt-4 flex flex-col gap-4">
              {session ? (
                <>
                  <span className="text-sm text-muted-foreground">Welcome, {user?.username || user?.email}</span>
                  <Button
                    className="w-full"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <Link href="/signIn" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Log In</Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">Welcome, {user?.username || user?.email}</span>
              <Button
                onClick={() => {
                  signOut()
                }}
              >
                Log Out
              </Button>
            </>
          ) : (
            <Link href="/signIn">
              <Button>Log In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

