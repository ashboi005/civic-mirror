"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
            Civic Mirror
          </span>
        </Link>
        <nav className="ml-auto hidden gap-6 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-white">
            Home
          </Link>
          <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white">
            Features
          </Link>
          <Link href="#about" className="text-sm font-medium text-gray-400 hover:text-white">
            About
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-400 hover:text-white">
            Contact
          </Link>
        </nav>
        <div className="ml-auto md:ml-4 flex gap-2">
          {/* <Link href="/dashboard">
            <Button variant="outline" className="hidden md:flex">
              Dashboard
            </Button>
          </Link> */}
          <Link href="/dashboard">
            <Button className="hidden md:flex bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              Sign In
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-800 bg-black/90 backdrop-blur-sm"
          >
            <div className="container flex flex-col gap-4 py-4 px-4">
              <Link href="/" className="text-sm font-medium hover:text-white" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-gray-400 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-gray-400 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-gray-400 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
