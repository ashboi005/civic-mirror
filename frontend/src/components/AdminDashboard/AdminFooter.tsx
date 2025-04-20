"use client";
import { useState, useEffect } from "react";
import { Hexagon, Github, Twitter, Sun, Moon } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { Switch } from "@/components/ui/switch"; // Ensure you have the correct Switch and Label components
import { Label } from "@/components/ui/label"; // Ensure you have the correct Label component

function CivicMirrorFooter() {
  // Initialize state based on the current theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check the current theme when the component mounts
  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark");
    setIsDarkMode(currentTheme); // Set the initial state based on the current theme

    // Optional: If you want to apply the theme immediately on mount without toggling first
    if (currentTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode when the switch is changed
  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="w-full py-10 bg-gray-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <Footer
        logo={<Hexagon className="h-10 w-10 text-blue-500" />}
        brandName="Civic Mirror"
        socialLinks={[
          {
            icon: (
              <Twitter className="h-5 w-5 text-blue-500 hover:text-blue-600 hover:bg-white dark:text-blue-400 dark:hover:text-blue-300 transition-colors" />
            ),
            href: "https://twitter.com/CivicMirror",
            label: "Twitter",
          },
          {
            icon: (
              <Github className="h-5 w-5 text-gray-800 hover:text-neutral-900 dark:text-gray-200 dark:hover:text-gray-300 transition-colors" />
            ),
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

      {/* Dark mode toggle with Sun/Moon icons */}
      <div className="flex items-center space-x-2 mt-4">
        <Sun className="h-4 w-4" />
        <Switch
          id="dark-mode"
          checked={isDarkMode}
          onCheckedChange={toggleDarkMode}
        />
        <Moon className="h-4 w-4" />
        <Label htmlFor="dark-mode" className="sr-only">
          Toggle dark mode
        </Label>
      </div>
    </div>
  );
}

export { CivicMirrorFooter };
