"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/40 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <p className="text-center text-sm text-gray-400 md:text-left">
            © {new Date().getFullYear()} Civic Mirror. All rights reserved.
          </p>
          <div className="h-4 border-l border-gray-800 hidden md:block"></div>
          <p className="text-center text-xs text-gray-500 md:text-left">
            Making communities better, together
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="#" className="text-sm text-gray-400 hover:text-white">
            Terms
          </Link>
          <Link href="#" className="text-sm text-gray-400 hover:text-white">
            Privacy
          </Link>
          <Link href="#" className="text-sm text-gray-400 hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}