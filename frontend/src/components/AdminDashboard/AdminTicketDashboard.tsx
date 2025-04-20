"use client"
import { getAdminReports, updateReportStatus } from "@/lib/api"
import { useState, useEffect } from "react"
import { DashboardStats } from "./AdminDashboardStats"
import { TicketSort } from "./AdminTicketSort"
import { TicketFilters } from "./AdminTicketFilters"
import { TabsContainer } from "./AdminTicketContainer"
import { TicketDetailModal } from "./AdminTicketDetail"
import { Ticket, TicketDashboardProps } from "@/types"  // Import the Ticket type and props
import axios from "axios"

export function TicketDashboard({}: TicketDashboardProps) {
  // Initialize tickets as an empty array to prevent null assignments
  const [tickets, setTickets] = useState<Ticket[]>([])  // Ensure it's never null
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [sortBy, setSortBy] = useState("upvotes")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Fetch tickets from the backend
   // Fetch tickets from the backend using getAdminReports
   useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log("Fetching tickets from backend...")
        const response = await getAdminReports(0, 10)  // Fetch with default skip and limit
        console.log("Response received:", response)

        if (Array.isArray(response)) {
          setTickets(response)  // Store the reports data
        } else {
          setError("Invalid data format received from backend.")
          console.error("Invalid data format:", response)
        }
      } catch (error) {
        setError('Failed to fetch reports.')
        console.error('Error fetching reports:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])
  // Handle ticket filtering and sorting
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesCategory = filterCategory === "all" || ticket.type === filterCategory
      const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
      const matchesLocation = filterLocation === "all" || ticket.location === filterLocation
      const matchesSearch =
        searchQuery === "" ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesStatus && matchesLocation && matchesSearch
    })
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1
      if (sortBy === "upvotes") {
        return (a.vote_count - b.vote_count) * factor
      } else if (sortBy === "date") {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor
      }
      return 0
    })

  // Handle ticket status update
  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      const updatedReport = await updateReportStatus(ticketId, newStatus);
      setTickets(tickets.map((ticket) => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      setIsDetailOpen(false);  // Close the detail modal after update
    } catch (error) {
      setError('Failed to update status.')
      console.error('Error updating status:', error)
    }
  }



  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Loading and error handling
  if (isLoading) return <div>Loading tickets...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="space-y-8">
      <DashboardStats tickets={tickets} />
      <div className="flex flex-col gap-6">
        <div className="flex w-full justify-items-end gap-3">
          <TicketFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}/>

          <TicketSort
            sortBy={sortBy}
            setSortBy={setSortBy}
            toggleSortOrder={toggleSortOrder}
          />
        </div>
        <TabsContainer
          filteredTickets={filteredTickets}
        
          setSelectedTicket={setSelectedTicket}
          setIsDetailOpen={setIsDetailOpen}
        />
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
