// src/components/AdminDashboardStats.tsx
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, CheckCircle, Clock, Ticket as IconTicket } from "lucide-react";
import { Ticket } from "@/types"; // Import the Ticket type for prop typing

interface DashboardStatsProps {
  tickets: Ticket[]; // Prop type for tickets
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export const DashboardStats: FC<DashboardStatsProps> = ({ tickets }) => {
  // Calculate statistics
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter((t) => t.status === "pending").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length;
  const completedTickets = tickets.filter((t) => t.status === "completed").length;

  // Data for status distribution
  const statusData: StatusData[] = [
    { name: "Pending", value: pendingTickets, color: "#f59e0b" },
    { name: "In Progress", value: inProgressTickets, color: "#3b82f6" },
    { name: "Completed", value: completedTickets, color: "#10b981" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <IconTicket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTickets}</div>
        </CardContent>
      </Card>

      {/* Pending Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingTickets}</div>
        </CardContent>
      </Card>

      {/* In Progress Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressTickets}</div>
        </CardContent>
      </Card>

      {/* Completed Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTickets}</div>
        </CardContent>
      </Card>

      {/* Ticket Status Distribution */}
      <Card className="col-span-2 p-2">
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
