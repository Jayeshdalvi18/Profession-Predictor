import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
              Empowering your career decisions with AI-driven insights and
              personalized guidance.
            </p>
            <div className="flex space-x-4">
              <Link
                className="text-muted-foreground hover:text-primary"
                href="https://github.com/0xshariq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                className="text-muted-foreground hover:text-primary"
                href="https://x.com/Sharique_Ch"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                className="text-muted-foreground hover:text-primary"
                href="https://www.linkedin.com/in/0xshariq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                className="text-muted-foreground hover:text-primary"
                href="https://www.instagram.com/sharique1303/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/"
              >
                Home
              </Link>
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/about"
              >
                About Us
              </Link>
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/contact"
              >
                Contact Us
              </Link>
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="https://portfolio-sigma-rose-22.vercel.app/blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>khanshariq2213@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+91 72081 79779</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Mumbai, India - 400612</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for career insights and updates.
            </p>
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="max-w-[200px]"
              />
              <Button type="submit" size="sm">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Profession Predictor. All rights
              reserved.
            </p>
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/terms"
              >
                Terms of Service
              </Link>
              <Link
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
                href="/cookies"
              >
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
