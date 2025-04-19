"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TicketSortProps } from "@/types"  // Import the type for props

export function TicketSort({ sortBy, setSortBy, toggleSortOrder }: TicketSortProps) {
  return (
    <div className="flex gap-2">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="upvotes">Sort by Upvotes</SelectItem>
          <SelectItem value="date">Sort by Date</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={toggleSortOrder}>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
