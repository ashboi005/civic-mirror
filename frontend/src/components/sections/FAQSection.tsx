"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronsDown } from "lucide-react"

export function FAQSection() {
  const faqs = [
    {
      q: "How does Civic Mirror protect user privacy?",
      a: "We take privacy seriously. Personal information is never shared without consent, and location data is only used for reporting purposes. We comply with all relevant data protection regulations."
    },
    {
      q: "Can I use Civic Mirror in any city?",
      a: "Yes! While we have official partnerships with some municipalities, the platform works anywhere. If your local government isn't integrated yet, reports are still valuable for community awareness and coordination."
    },
    {
      q: "Is there a cost to using the platform?",
      a: "Civic Mirror is free for individual citizens. We offer premium features for municipalities and organizations who want deeper data analytics and management tools."
    },
    {
      q: "How are issues prioritized for resolution?",
      a: "Issues gain visibility through community upvotes and comments. Local governments using our platform can see which issues affect the most residents, helping them prioritize resources effectively."
    },
    {
      q: "Can I volunteer to help resolve community issues?",
      a: "Absolutely! Many issues can be addressed through community action. You can create or join volunteer groups within the platform to coordinate cleanup events and other community initiatives."
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-purple-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-900/10 rounded-full blur-3xl"></div>
      
      <div className="container px-4 md:px-6 relative">
        <motion.div 
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 backdrop-blur-sm">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[700px] text-gray-400 md:text-xl/relaxed">
            Everything you need to know about Civic Mirror
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="border-gray-800 bg-black/40 backdrop-blur-sm overflow-hidden group-hover:border-purple-900/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{faq.q}</span>
                    <ChevronsDown className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{faq.a}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}