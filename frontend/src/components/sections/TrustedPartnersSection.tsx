"use client"

import { motion } from "framer-motion"

export function TrustedPartnersSection() {
  return (
    <section className="py-16 bg-black/20 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center justify-center text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-8">Trusted by forward-thinking communities and organizations</p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {Array(6).fill(0).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <img
                src={`/placeholder.svg?height=40&width=120&text=Partner ${index + 1}`}
                alt={`Partner ${index + 1}`}
                className="h-8 md:h-10 opacity-50 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}