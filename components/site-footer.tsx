import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

interface FooterColumnProps {
  title: string
  links: Array<{ text: string; href: string; external?: boolean }>
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.text}>
            <a
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#262626] text-white py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo + description */}
          <div className="space-y-6">
            <Link href="/">
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
              { text: "How It Works", href: "/#how-it-works" },
              { text: "Reviews", href: "/#reviews" },
              { text: "Careers", href: "#" },
            ]}
          />

          {/* Support */}
          <FooterColumn
            title="Support"
            links={[
              { text: "Contact Us", href: "#" },
              { text: "FAQ", href: "/#faq" },
              { text: "For business", href: "https://business.vehicler.org/", external: true },
              { text: "Tracking", href: "#" },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Vehicler. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
