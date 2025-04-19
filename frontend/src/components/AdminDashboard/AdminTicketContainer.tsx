"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketCard } from "./AdminTicketCard"  
import { TabsContainerProps } from "@/types"  

export function TabsContainer({
  filteredTickets,
  handleUpvote,
  setSelectedTicket,
  setIsDetailOpen,
}: TabsContainerProps) {

  const renderTickets = (status: string) => {
    // For the "All Tickets" tab, render all tickets without filtering by status
    if (status === "all") {
      return filteredTickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onUpvote={handleUpvote}
          onViewDetails={() => {
            setSelectedTicket(ticket)
            setIsDetailOpen(true)
          }}
        />
      ));
    }

    // For other tabs (pending, in-progress, completed), filter tickets by status
    return filteredTickets
      .filter((ticket) => ticket.status === status)
      .map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onUpvote={handleUpvote}
          onViewDetails={() => {
            setSelectedTicket(ticket)
            setIsDetailOpen(true)
          }}
        />
      ));
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Tickets</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      {/* All Tickets Tab */}
      <TabsContent value="all" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderTickets("all")}
        </div>
      </TabsContent>

      {/* Pending Tickets Tab */}
      <TabsContent value="pending" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderTickets("pending")}
        </div>
      </TabsContent>

      {/* In-Progress Tickets Tab */}
      <TabsContent value="in-progress" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderTickets("in-progress")}
        </div>
      </TabsContent>

      {/* Completed Tickets Tab */}
      <TabsContent value="completed" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderTickets("completed")}
        </div>
      </TabsContent>
    </Tabs>
  )
}
