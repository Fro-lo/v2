"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      {/* Mobile: two rows. Desktop: single row */}
      <div className="max-w-6xl mx-auto px-4 md:px-16">

        {/* Row 1: logo only on mobile, full nav on desktop */}
        <div className="h-14 md:h-20 flex items-center justify-between">
          <Link href="/" className="block">
            <img src="/vehicler-logo.png" alt="Vehicler Logo" className="h-7 md:h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/#how-it-works" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
              How It Works
            </Link>
            <Link href="/#faq" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
              FAQ
            </Link>
            <Link
              href="https://business.vehicler.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-vehicler-black hover:text-vehicler-blue transition-colors"
            >
              For business
            </Link>
          </nav>

          {/* Desktop Phone */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href="tel:+18554227872"
              className="flex items-center space-x-2 text-vehicler-blue hover:text-vehicler-dark-blue transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span className="font-semibold">(855) 422-7872</span>
            </a>
          </div>
        </div>

        {/* Row 2 — mobile only: call button + hamburger */}
        <div className="flex items-center justify-between pb-3 lg:hidden border-t border-gray-100 pt-2">
          <a
            href="tel:+18554227872"
            className="flex items-center space-x-2 text-vehicler-blue hover:text-vehicler-dark-blue transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-semibold text-sm">(855) 422-7872</span>
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-vehicler-black hover:text-vehicler-blue hover:bg-gray-50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/#how-it-works"
              className="block text-vehicler-black hover:text-vehicler-blue transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              className="block text-vehicler-black hover:text-vehicler-blue transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="https://business.vehicler.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-vehicler-black hover:text-vehicler-blue transition-colors py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For business
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <Link href="/">
                <Button
                  className="w-full bg-vehicler-blue hover:bg-vehicler-dark-blue text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Free Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
