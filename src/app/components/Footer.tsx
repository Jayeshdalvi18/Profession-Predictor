import { Github, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between md:py-6">
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Profession Predictor</span>
          </Link>
          <nav className="flex gap-4 md:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="/about">
              About
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="/privacy">
              Privacy
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="/terms">
              Terms
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-center gap-4 md:justify-end">
          <Link className="rounded-lg p-2 hover:bg-accent" href="#">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link className="rounded-lg p-2 hover:bg-accent" href="#">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link className="rounded-lg p-2 hover:bg-accent" href="#">
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

