import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#262626] text-white py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-16">

        {/* Logo + description + socials — full width on mobile */}
        <div className="mb-6 space-y-4">
          <Link href="/" className="hover:opacity-80 transition-opacity block">
            <Image
              src="/images/logo-cmyk-mark-8.png"
              alt="Vehicler"
              width={200}
              height={200}
              className="w-full h-auto md:w-48"
              priority
            />
          </Link>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed md:max-w-xs">
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
        <div className="grid grid-cols-3 gap-2 md:gap-8 mb-6">

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-sm">Services</h3>
            <ul className="space-y-1 md:space-y-3">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Open Car Transport</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Enclosed Car Transport</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Motorcycle Shipping</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Classic Car Transport</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-sm">Company</h3>
            <ul className="space-y-1 md:space-y-3">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">About Us</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">How It Works</Link></li>
              <li><Link href="/#reviews" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Reviews</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-sm">Support</h3>
            <ul className="space-y-1 md:space-y-3">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Contact Us</Link></li>
              <li><Link href="/#faq" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">FAQ</Link></li>
              <li><Link href="/find-my-vehicle" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Track Shipment</Link></li>
              <li><Link href="/#quote" className="text-gray-300 hover:text-white transition-colors text-[10px] md:text-xs">Get Quote</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-600 pt-4 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-400 text-[10px] md:text-xs">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
          <div className="flex space-x-3 md:space-x-6 text-[10px] md:text-xs">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
