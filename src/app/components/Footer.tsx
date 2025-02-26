import { Github, Linkedin, Twitter, Instagram } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profession Predictor</h3>
            <p className="text-sm text-muted-foreground">
              Empowering your career decisions with AI-driven insights and personalized guidance.
            </p>
            <div className="flex space-x-4">
              <Link className="text-muted-foreground hover:text-primary" href="https://github.com/0xshariq">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="https://x.com/Sharique_Ch">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="https://www.linkedin.com/in/0xshariq">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="https://www.instagram.com/sharique1303/">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/about">
                About Us
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/contact">
                Contact Us
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="https://portfolio-sigma-rose-22.vercel.app/blog">
                Blog
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Profession Predictor. All rights reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/terms">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

