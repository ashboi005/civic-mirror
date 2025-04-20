import { Hexagon, Github, Twitter } from "lucide-react"
import { Footer } from "@/components/ui/footer"

function CivicMirrorFooter() {
  return (
    <div className="w-full bg-gray-100 text-gray-900 py-10">
      <Footer
        logo={<Hexagon className="h-10 w-10 text-blue-500" />}
        brandName="Civic Mirror"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5 text-blue-500 hover:text-blue-600 hover:bg-white  transition-colors" />,
            href: "https://twitter.com/CivicMirror",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5 text-gray-800 hover:text-gray-900 hover:bg-white transition-colors" />,
            href: "https://github.com/CivicMirror",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "/features", label: "Features" },
          { href: "/about", label: "About Us" },
          { href: "/blog", label: "Blog" },
          { href: "/contact", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
        ]}
        copyright={{
          text: "© 2025 Civic Mirror",
          license: "All rights reserved",
        }}
      />
    </div>
  )
}

export { CivicMirrorFooter }
