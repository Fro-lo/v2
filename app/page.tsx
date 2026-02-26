"use client"

import { useState, useEffect } from "react"
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
import { FitText } from "@/components/fit-text"

export default function VehiclerLanding() {
  const [currentReview, setCurrentReview] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)

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
        <div className="max-w-6xl mx-auto px-4 md:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/vehicler-logo.png" alt="Vehicler Logo" className="h-6 md:h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-vehicler-black hover:text-vehicler-blue transition-colors flex items-center space-x-1">
                <span>Services</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <a href="#" className="w-full text-vehicler-black hover:text-vehicler-blue">
                    Open Car Transport
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#" className="w-full text-vehicler-black hover:text-vehicler-blue">
                    Enclosed Car Transport
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#" className="w-full text-vehicler-black hover:text-vehicler-blue">
                    Motorcycle Shipping
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#" className="w-full text-vehicler-black hover:text-vehicler-blue">
                    Classic Car Transport
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#how-it-works" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
              How It Works
            </Link>
            <Link href="#faq" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
              FAQ
            </Link>
            <Link href="#" className="text-vehicler-black hover:text-vehicler-blue transition-colors">
              For business
            </Link>
            {/* Temporarily hidden - Check My Order link */}
            {/* <Link
              href="/find-my-vehicle"
              className="hover:text-vehicler-blue transition-colors text-[rgba(8,28,139,1)]"
            >
              Check My Order
            </Link> */}
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

          {/* Mobile Phone & Menu */}
          <div className="flex items-center space-x-3 lg:hidden">
            <a
              href="tel:+18554227872"
              className="flex items-center space-x-1 text-vehicler-blue hover:text-vehicler-dark-blue transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span className="font-semibold text-sm">Call</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-vehicler-black hover:text-vehicler-blue hover:bg-gray-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 12h12" />
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
              {/* Services Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className="flex items-center justify-between w-full text-left text-vehicler-black hover:text-vehicler-blue transition-colors py-2"
                >
                  <span className="font-medium">Services</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileServicesOpen && (
                  <div className="pl-4 mt-2 space-y-2">
                    <a href="#" className="block text-vehicler-gray hover:text-vehicler-blue transition-colors py-1">
                      Open Car Transport
                    </a>
                    <a href="#" className="block text-vehicler-gray hover:text-vehicler-blue transition-colors py-1">
                      Enclosed Car Transport
                    </a>
                    <a href="#" className="block text-vehicler-gray hover:text-vehicler-blue transition-colors py-1">
                      Motorcycle Shipping
                    </a>
                    <a href="#" className="block text-vehicler-gray hover:text-vehicler-blue transition-colors py-1">
                      Classic Car Transport
                    </a>
                  </div>
                )}
              </div>

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
                href="#"
                className="block text-vehicler-black hover:text-vehicler-blue transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For business
              </Link>

              {/* Temporarily hidden - Check My Order link */}
              {/* <Link
                href="/find-my-vehicle"
                className="block text-vehicler-dark-blue hover:text-vehicler-blue transition-colors py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Check My Order
              </Link> */}

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
              <FitText
                as="h1"
                className="font-bold text-white mb-4"
                minFontSize={20}
                maxFontSize={120}
              >
                Nationwide Car Shipping You Can Trust
              </FitText>
              <p className="text-sm md:text-base text-blue-100 mt-4">
                Safe, reliable, and affordable vehicle transport across all 50 states.
              </p>
            </div>

            {/* Call to action tied to the form */}
            <p className="text-sm md:text-base text-blue-200 text-center mb-4">
              Fill in the details below and get instant quotes from verified carriers.
            </p>

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
          <div className="max-w-6xl mx-auto px-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">How It Works</h2>
              <p className="text-xl text-vehicler-gray max-w-3xl mx-auto">
                Simple, transparent process from quote to delivery in just 4 easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-vehicler-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Get Quote</h3>
                <p className="text-vehicler-gray">
                  Enter your pickup and delivery locations to get an instant, transparent quote.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-vehicler-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Book Service</h3>
                <p className="text-vehicler-gray">
                  Secure your shipment with a small deposit and choose your preferred dates.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-vehicler-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Vehicle Pickup</h3>
                <p className="text-vehicler-gray">
                  Our carrier picks up your vehicle and provides real-time tracking updates.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-vehicler-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Safe Delivery</h3>
                <p className="text-vehicler-gray">
                  Your vehicle arrives safely at the destination, inspected and ready to drive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Vehicler */}
      <section className="py-12 bg-vehicler-light-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">Why Choose Vehicler?</h2>
              <p className="text-xl text-vehicler-gray max-w-3xl mx-auto">
                We've transported over 100,000 vehicles nationwide with industry-leading service and customer
                satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-white">
                <div className="w-16 h-16 bg-vehicler-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-vehicler-blue" />
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Fully Insured</h3>
                <p className="text-vehicler-gray">
                  Every shipment is covered by comprehensive insurance for your peace of mind.
                </p>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-white">
                <div className="w-16 h-16 bg-vehicler-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-vehicler-blue" />
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">5-Star Rated</h3>
                <p className="text-vehicler-gray">
                  Thousands of satisfied customers rate us 5 stars for exceptional service.
                </p>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-white">
                <div className="w-16 h-16 bg-vehicler-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-vehicler-blue" />
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Fast Pickup</h3>
                <p className="text-vehicler-gray">Quick pickup times with flexible scheduling to fit your timeline.</p>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-white">
                <div className="w-16 h-16 bg-vehicler-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-vehicler-blue" />
                </div>
                <h3 className="text-xl font-bold text-vehicler-black mb-4">Nationwide Coverage</h3>
                <p className="text-vehicler-gray">We ship to all 50 states with our extensive carrier network.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-vehicler-black mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-vehicler-gray max-w-3xl mx-auto">
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
          <div className="max-w-6xl mx-auto px-16">
            <h2 className="text-4xl font-bold mb-6">Ready to Ship Your Vehicle?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
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

      {/* ─────────────────── Footer ─────────────────── */}
      <footer className="bg-[#262626] text-white py-12">
        <div className="max-w-6xl mx-auto px-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo + description */}
            <div className="space-y-6">
              <Link href="#quote">
                <Image
                  src="/vehicler-footer-logo.png"
                  alt="Vehicler logo mark"
                  width={160}
                  height={40}
                  priority
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <p className="text-gray-300 text-sm leading-relaxed">
                America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon) => (
                  <a key={Icon.displayName} href="#" aria-label={`${Icon.displayName} link`}>
                    <Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
            {/* Services */}
            <FooterColumn
              title="Services"
              links={[
                { text: "Open Car Transport", href: "#" },
                { text: "Enclosed Car Transport", href: "#" },
                { text: "Motorcycle Shipping", href: "#" },
                { text: "Classic Car Transport", href: "#" },
              ]}
            />
            {/* Company */}
            <FooterColumn
              title="Company"
              links={[
                { text: "About Us", href: "#" },
                { text: "How It Works", href: "#how-it-works" },
                { text: "Reviews", href: "#reviews" },
                { text: "Careers", href: "#" },
              ]}
            />
            {/* Support */}
            <FooterColumn
              title="Support"
              links={[
                { text: "Contact Us", href: "#" },
                { text: "FAQ", href: "#faq" },
                { text: "For business", href: "#" },
                // { text: "Track Shipment", href: "/find-my-vehicle" }, // Temporarily hidden
                { text: "Get Quote", href: "#quote" },
              ]}
            />
          </div>
          {/* bottom row */}
          <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Vehicler. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────── Reusable footer column component ─────────────────── */
interface FooterColumnProps {
  title: string
  links: Array<{ text: string; href: string }>
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.text}>
            <a href={link.href} className="text-gray-300 hover:text-white transition-colors">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
