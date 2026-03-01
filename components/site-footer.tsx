import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#262626] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-x-16 md:gap-y-8">

          {/* Logo + description */}
          <div className="space-y-6">
            <Link href="/" className="hover:opacity-80 transition-opacity block">
              <Image
                src="/vehicler-footer-logo.png"
                alt="Vehicler logo mark"
                width={160}
                height={40}
                priority
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
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
                  <Icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Three columns: compact grid on mobile, normal on desktop */}
          <div className="grid grid-cols-3 md:grid-cols-1 col-span-1 md:col-span-3 gap-4 md:gap-0 md:contents">

            {/* Services */}
            <div>
              <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">Services</h3>
              <ul className="space-y-1 md:space-y-3 text-xs md:text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Open Car Transport</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Enclosed Car Transport</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Motorcycle Shipping</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Classic Car Transport</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">Company</h3>
              <ul className="space-y-1 md:space-y-3 text-xs md:text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/#reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-2 md:mb-4 text-xs md:text-base">Support</h3>
              <ul className="space-y-1 md:space-y-3 text-xs md:text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="https://business.vehicler.org/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">For business</a></li>
                <li><Link href="/find-my-vehicle" className="text-gray-300 hover:text-white transition-colors">Track Shipment</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs md:text-sm">© {new Date().getFullYear()} Vehicler. All rights reserved.</p>
          <div className="flex space-x-3 md:space-x-6 mt-4 md:mt-0 text-xs md:text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
