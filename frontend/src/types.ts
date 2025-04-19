
export interface Ticket {
    id: number;
    title: string;
    description: string;
    type: string;  
    location: string;
    user_id: number; 
    status: string;  
    image_url?: string; 
    created_at: string;  
    updated_at: string; 
    vote_count: number;  
    votes: string[]; 
  }
  

export interface TicketSortProps {
    sortBy: string;  
    setSortBy: (sortBy: string) => void; 
    toggleSortOrder: () => void;  
  }
  

  export interface TicketFiltersProps {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
  }
   export interface TicketDashboardProps {
    filteredTickets: Ticket[]; // Tickets to display
    handleUpvote: (ticketId: number) => void; // Function to handle upvote
    setSelectedTicket: (ticket: Ticket) => void; // Function to select a ticket
    setIsDetailOpen: (isOpen: boolean) => void; // Function to open/close the detail modal
  }
  

  export interface TicketStatusBadgeProps {
    status: "pending" | "in-progress" | "completed" | string; 
}


  export interface TicketCardProps {
    ticket: Ticket;
    onUpvote: (ticketId: number) => void;
    onViewDetails: () => void;
  }
  
  // Ticket Detail Modal Props
  export interface TicketDetailModalProps {
    ticket: Ticket;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (ticketId: number, newStatus: string) => void;
  }
  
  // TabsContainer Props
  export interface TabsContainerProps {
    filteredTickets: Ticket[];  // Corrected to use Ticket type
    handleUpvote: (ticketId: number) => void;
    setSelectedTicket: (ticket: Ticket) => void;  // Updated to expect Ticket type
    setIsDetailOpen: (isOpen: boolean) => void;
  }
  