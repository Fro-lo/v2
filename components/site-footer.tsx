import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#262626] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Logo + description + socials — full width */}
        <div className="mb-8 space-y-4">
          <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
            <Image
              src="/images/logo-cmyk-mark-8.png"
              alt="Vehicler"
              width={160}
              height={44}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            America's trusted vehicle transport company, delivering safe and reliable car shipping nationwide.
          </p>
          <div className="flex space-x-4">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label}>
                <Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Three columns — always side by side */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Services</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Open Car Transport</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Enclosed Car Transport</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Motorcycle Shipping</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Classic Car Transport</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/#reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/find-my-vehicle" className="text-gray-300 hover:text-white transition-colors">Track Shipment</Link></li>
              <li><Link href="/#quote" className="text-gray-300 hover:text-white transition-colors">Get Quote</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-600 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
          <div className="flex space-x-4 text-xs">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
