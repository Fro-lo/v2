"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Star,
  Shield,
  Award,
  Clock,
  Truck,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HeroSearchForm } from "@/components/hero-search-form"

export default function VehiclerLanding() {
  const [currentReview, setCurrentReview] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  /* NEW — track if viewport is mobile (< 768 px) */
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false)

  /* NEW — update the flag on resize */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const reviews = [
    {
      id: 1,
      text: "Exceptional service from start to finish. My car was picked up on time and delivered in perfect condition.",
      name: "Sarah Martinez",
      location: "Los Angeles, CA",
    },
    {
      id: 2,
      text: "Moving across the country was stressful enough, but Vehicler made shipping my car the easiest part.",
      name: "Michael Johnson",
      location: "Miami, FL",
    },
    {
      id: 3,
      text: "I was nervous about shipping my classic car, but Vehicler's enclosed transport gave me complete peace of mind.",
      name: "Robert Davis",
      location: "Chicago, IL",
    },
    {
      id: 4,
      text: "Great value for money! I got quotes from several companies and Vehicler offered the best price without compromising quality.",
      name: "Jennifer Chen",
      location: "Seattle, WA",
    },
    {
      id: 5,
      text: "As a military family, Vehicler stands out for their professionalism and understanding of our unique needs.",
      name: "Captain James Wilson",
      location: "San Antonio, TX",
    },
  ]

  const nextReview = () => {
    const maxIndex = isMobile ? reviews.length - 1 : reviews.length - 3
    setCurrentReview((prev) => (prev + 1) % (maxIndex + 1))
  }

  const prevReview = () => {
    const maxIndex = isMobile ? reviews.length - 1 : reviews.length - 3
    setCurrentReview((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-16">

          {/* Row 1 — mobile only: call + hamburger (above logo) */}
          <div className="flex items-center justify-between py-0.5 lg:hidden">
            <a href="tel:+18554227872" className="flex items-center space-x-1 text-vehicler-blue hover:text-vehicler-dark-blue transition-colors">
              <Phone className="w-3 h-3" />
              <span className="font-semibold text-xs">(855) 422-7872</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 rounded-md text-vehicler-black hover:text-vehicler-blue hover:bg-gray-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Row 2 (mobile) / single row (desktop): logo + nav */}
          <div className="h-9 md:h-20 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/vehicler-logo.png" alt="Vehicler Logo" className="h-7 md:h-8 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#how-it-works" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
                How It Works
              </Link>
              <Link href="#faq" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
                FAQ
              </Link>
              <Link href="https://business.vehicler.org/" target="_blank" rel="noopener noreferrer" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
                For business
              </Link>
            </nav>

            {/* Desktop Phone */}
            <div className="hidden lg:flex items-center space-x-4">
              <a href="tel:+18554227872" className="flex items-center space-x-2 text-vehicler-blue hover:text-vehicler-dark-blue transition-colors cursor-pointer">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">(855) 422-7872</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <Link
                href="#how-it-works"
                className="block text-vehicler-black hover:text-vehicler-blue transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>

              <Link
                href="#faq"
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

              {/* Mobile CTA Button */}
              <div className="pt-4 border-t border-gray-100">
                <Link href="#quote">
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

      {/* Hero Section */}
      <section id="quote" className="relative bg-vehicler-dark-blue text-white pb-10 pt-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/hero-background.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-vehicler-dark-blue/80 to-vehicler-blue/70" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url('/hero-pattern.png')`,
              backgroundSize: "400px 400px",
              backgroundRepeat: "repeat",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-16 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Heading + description */}
            <div className="text-center mb-6">
              <h1 className="font-bold text-white mb-4 text-4xl md:text-6xl lg:text-7xl leading-tight">
                Nationwide Car Shipping<br />You Can Trust
              </h1>
              <p className="text-sm md:text-base text-blue-100 mt-4">
                Safe, reliable, and affordable vehicle transport across all 50 states.
              </p>
            </div>

            {/* Full-width search form */}
            <HeroSearchForm />
          </div>
        </div>
      </section>

      {/* Customer Reviews Carousel - Three Cards */}
      <section id="reviews" className="py-16 bg-vehicler-light-gray">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-7xl mx-auto">
            {/* Left Arrow - Outside on desktop, hidden on mobile */}
            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-white hover:bg-vehicler-blue hover:text-white text-vehicler-blue transition-all duration-300 shadow-lg hidden md:block"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Reviews Container */}
            <div className="overflow-hidden mx-4 md:mx-16">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentReview * (isMobile ? 100 : 100 / 3)}%)`,
                }}
              >
                {reviews.map((review, index) => (
                  <div key={review.id} className="w-full md:w-1/3 flex-shrink-0 px-2 md:px-4">
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 h-full">
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-vehicler-gray text-sm md:text-base italic mb-4 leading-relaxed min-h-[3rem] md:min-h-[4rem]">
                          "{review.text}"
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-8 h-8 bg-vehicler-blue/10 rounded-full flex items-center justify-center">
                            <span className="text-vehicler-blue font-bold text-sm">
                              {review.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-vehicler-black text-sm">{review.name}</p>
                            <p className="text-xs text-vehicler-gray">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow - Outside on desktop, hidden on mobile */}
            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-white hover:bg-vehicler-blue hover:text-white text-vehicler-blue transition-all duration-300 shadow-lg hidden md:block"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Mobile Navigation Arrows - Below cards on mobile */}
            <div className="flex justify-center space-x-4 mt-6 md:hidden">
              <button
                onClick={prevReview}
                className="p-3 rounded-full bg-white hover:bg-vehicler-blue hover:text-white text-vehicler-blue transition-all duration-300 shadow-lg"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextReview}
                className="p-3 rounded-full bg-white hover:bg-vehicler-blue hover:text-white text-vehicler-blue transition-all duration-300 shadow-lg"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dots Indicator - Below the cards */}
          <div className="flex justify-center mt-8 space-x-2">
            {/* Show dots for mobile (single card view) and desktop (3-card view) */}
            {Array.from({ length: isMobile ? reviews.length : reviews.length - 2 }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentReview ? "bg-vehicler-blue scale-125" : "bg-vehicler-gray hover:bg-vehicler-blue/50"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-4 md:px-16">
            <div className="text-center mb-6 md:mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">How It Works</h2>
              <p className="text-sm md:text-xl text-vehicler-gray max-w-3xl mx-auto px-2 md:px-0">
                Simple, transparent process from quote to delivery in just 4 easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 md:gap-8">
              {[
                { num: 1, title: "Get Quote", desc: "Enter your pickup and delivery locations to get an instant, transparent quote." },
                { num: 2, title: "Book Service", desc: "Secure your shipment with a small deposit and choose your preferred dates." },
                { num: 3, title: "Vehicle Pickup", desc: "Our carrier picks up your vehicle and provides real-time tracking updates." },
                { num: 4, title: "Safe Delivery", desc: "Your vehicle arrives safely at the destination, inspected and ready to drive." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="md:text-center">
                  <div className="flex items-center gap-3 md:justify-center mb-3 md:mb-6 md:flex-col">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-vehicler-blue rounded-full flex items-center justify-center flex-shrink-0 text-white text-base md:text-xl font-bold">
                      {num}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-vehicler-black">{title}</h3>
                  </div>
                  <p className="text-vehicler-gray text-sm md:text-base">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Vehicler */}
      <section className="py-12 bg-vehicler-light-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-4 md:px-16">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">Why Choose Vehicler?</h2>
              <p className="text-sm md:text-xl text-vehicler-gray max-w-3xl mx-auto px-2 md:px-0">
                We've transported over 100,000 vehicles nationwide with industry-leading service and customer
                satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { Icon: Shield, title: "Fully Insured", desc: "Every shipment is covered by comprehensive insurance for your peace of mind." },
                { Icon: Award, title: "5-Star Rated", desc: "Thousands of satisfied customers rate us 5 stars for exceptional service." },
                { Icon: Clock, title: "Fast Pickup", desc: "Quick pickup times with flexible scheduling to fit your timeline." },
                { Icon: Truck, title: "Nationwide Coverage", desc: "We ship to all 50 states with our extensive carrier network." },
              ].map(({ Icon, title, desc }) => (
                <Card key={title} className="px-3 py-4 md:p-6 hover:shadow-lg transition-shadow border-0 bg-white">
                  {/* Mobile: icon + desc side by side; Desktop: centered stack */}
                  <div className="flex items-start gap-3 md:flex-col md:items-center md:gap-0">
                    <div className="w-10 h-10 md:w-10 md:h-10 bg-vehicler-blue/10 rounded-full flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-6">
                      <Icon className="w-5 h-5 md:w-5 md:h-5 text-vehicler-blue" />
                    </div>
                    <p className="text-vehicler-gray text-xs md:hidden leading-snug flex-1">{desc}</p>
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-vehicler-black mt-2 md:mt-0 md:mb-4 text-center">{title}</h3>
                  <p className="text-vehicler-gray text-xs hidden md:block md:text-center">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-4 md:px-16">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">Frequently Asked Questions</h2>
              <p className="text-sm md:text-xl text-vehicler-gray max-w-3xl mx-auto px-2 md:px-0">
                Get answers to the most common questions about our vehicle transport services.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    How much does it cost to ship a car?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    Car shipping costs vary based on distance, vehicle type, transport method, and seasonal demand. Our
                    instant quote tool provides transparent pricing with no hidden fees. Most shipments range from
                    $500-$1,500.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    How long does car shipping take?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    Transit times typically range from 1-10 days depending on the distance. Cross-country shipments
                    usually take 7-10 days, while shorter distances can be completed in 1-3 days. We provide estimated
                    delivery windows when you book.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    Is my vehicle insured during transport?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    Yes, all vehicles are covered by comprehensive insurance during transport. Our carriers maintain
                    cargo insurance with coverage up to $1 million. We also offer additional coverage options for
                    high-value vehicles.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    Can I track my vehicle during shipping?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    We provide real-time tracking updates via SMS and email. You'll receive notifications when your
                    vehicle is picked up, in transit, and ready for delivery. Our customer service team is also
                    available 24/7 for updates.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    What's the difference between open and enclosed transport?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    Open transport is more economical and suitable for most vehicles, while enclosed transport provides
                    additional protection from weather and road debris. We recommend enclosed transport for luxury,
                    classic, or high-value vehicles.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-vehicler-gray/20 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-vehicler-black hover:text-vehicler-blue">
                    Do I need to be present for pickup and delivery?
                  </AccordionTrigger>
                  <AccordionContent className="text-vehicler-gray">
                    Yes, someone 18 or older must be present to sign the inspection report and hand over/receive the
                    keys. This can be you or an authorized representative. We provide flexible scheduling to accommodate
                    your availability.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-gradient-to-r from-vehicler-blue to-vehicler-bright-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto px-4 md:px-16">
            <h2 className="text-4xl font-bold mb-6">Ready to Ship Your Vehicle?</h2>
            <p className="text-sm md:text-xl mb-8 max-w-3xl mx-auto px-2 md:px-0">
              Join thousands of satisfied customers who trust Vehicler for safe, reliable vehicle transport nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#quote">
                <Button size="lg" className="bg-white text-vehicler-blue hover:bg-gray-100 px-8 py-4 text-lg">
                  Get Your Free Quote
                </Button>
              </Link>
              <a href="tel:+18554227872">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white hover:bg-white hover:text-vehicler-blue px-8 py-4 text-lg text-slate-300 bg-transparent"
                >
                  Call (855) 422-7872
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#262626] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-16">

          {/* Logo + description + socials */}
          <div className="mb-6 space-y-3">
            <Link href="/">
              <Image
                src="/vehicler-footer-logo.png"
                alt="Vehicler logo mark"
                width={200}
                height={200}
                priority
                className="w-full h-auto md:w-48 hover:opacity-80 transition-opacity cursor-pointer mb-4"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed md:max-w-xs">
              America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
            </p>
            <div className="flex space-x-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={`${label} link`}>
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Three columns — always in one row */}
          <div className="grid grid-cols-3 gap-x-1 gap-y-0 md:gap-8 mb-6">
            {/* Services */}
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs leading-tight">Services</h3>
              <ul className="space-y-0.5">
                {[
                  { text: "Open Car Transport", href: "#" },
                  { text: "Enclosed Car Transport", href: "#" },
                  { text: "Motorcycle Shipping", href: "#" },
                  { text: "Classic Car Transport", href: "#" },
                ].map((link) => (
                  <li key={link.text}><a href={link.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{link.text}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs leading-tight">Company</h3>
              <ul className="space-y-0.5">
                {[
                  { text: "About Us", href: "#" },
                  { text: "How It Works", href: "#how-it-works" },
                  { text: "Reviews", href: "#reviews" },
                  { text: "Careers", href: "#" },
                ].map((link) => (
                  <li key={link.text}><a href={link.href} className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">{link.text}</a></li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-1 text-xs leading-tight">Support</h3>
              <ul className="space-y-0.5">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">Contact Us</a></li>
                <li><a href="#faq" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">FAQ</a></li>
                <li><a href="https://business.vehicler.org/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">For business</a></li>
                <li><a href="#quote" className="text-gray-300 hover:text-white transition-colors text-xs leading-tight block">Get Quote</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-600 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
            <div className="flex space-x-3 md:space-x-6 text-xs">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}
