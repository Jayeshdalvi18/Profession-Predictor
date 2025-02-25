import { Mail, Github, Linkedin, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link className="text-muted-foreground hover:text-primary" href="#">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
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
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/careers">
                Careers
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/blog">
                Blog
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/testimonials">
                Testimonials
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/help">
                Help Center
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/guides">
                Career Guides
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/research">
                Research Papers
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/api">
                API Documentation
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for career insights and updates.
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Input type="email" placeholder="Enter your email" className="max-w-[220px]" />
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Subscribe to newsletter</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
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
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/cookies">
                Cookie Policy
              </Link>
              <Link className="text-sm text-muted-foreground hover:text-primary hover:underline" href="/sitemap">
                Sitemap
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

