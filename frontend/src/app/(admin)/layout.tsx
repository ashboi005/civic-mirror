import { CivicMirrorFooter } from "@/components/AdminDashboard/AdminFooter";
import AdminSidebar from "@/components/AdminDashboard/AdminSidebar";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminSidebar>{children}<CivicMirrorFooter/></AdminSidebar>
}
