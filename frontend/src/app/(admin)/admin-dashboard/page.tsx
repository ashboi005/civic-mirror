"use client";

import React, { useState } from "react";
import { TicketDashboard } from "@/components/AdminDashboard/AdminTicketDashboard";
import { Ticket } from "@/types"; // import your Ticket type

// Dummy/mock data
const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "A large pothole is making the road dangerous for commuters.",
    type: "Infrastructure",
    location: "Main Street, Downtown",
    user_id: 101,
    status: "pending",
    image_url: "https://example.com/path-to-image.jpg",
    created_at: "2023-04-15T10:30:00Z",
    updated_at: "2023-04-15T14:45:00Z",
    vote_count: 42,
    votes: [],
  },
  {
    id: 2,
    title: "Broken sidewalk at City Square",
    description: "The sidewalk has cracked, creating a tripping hazard for pedestrians.",
    type: "Infrastructure",
    location: "City Square, Central District",
    user_id: 102,
    status: "completed",
    image_url: "https://example.com/path-to-image2.jpg",
    created_at: "2023-04-11T14:10:00Z",
    updated_at: "2023-04-13T10:25:00Z",
    vote_count: 30,
    votes: [],
  },
  // add more if you want
];

function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // handle upvote
  const handleUpvote = (ticketId: number) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, vote_count: ticket.vote_count + 1 }
          : ticket
      )
    );
  };

  return (
    <>
      <TicketDashboard
        filteredTickets={tickets}
        handleUpvote={handleUpvote}
        setSelectedTicket={setSelectedTicket}
        setIsDetailOpen={setIsDetailOpen}
      />
    </>
  );
}

export default Dashboard;
