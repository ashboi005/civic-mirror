"use client"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TicketFiltersProps } from "@/types"  



export function TicketFilters({
  searchQuery,
  setSearchQuery,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col w-full sm:flex-row gap-4 justify-between">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          className="pl-8 bg-white w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

    </div>
  )
}
