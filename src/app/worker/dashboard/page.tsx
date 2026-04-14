import { TaskList } from "@/components/worker/TaskList";
import { KPIOverview } from "@/components/worker/KPIOverview";
import { TaskCreationForm } from "@/components/worker/TaskCreationForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BottomNav } from "@/components/worker/BottomNav";
import { LayoutDashboard, ListTodo } from "lucide-react";

export default function WorkerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Stitch<span className="text-blue-600">Work</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Worker Dashboard</h2>
            <p className="text-muted-foreground mt-1">Manage your site visits and track performance.</p>
          </div>
          <TaskCreationForm />
        </div>

        {/* KPI Section */}
        <section className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-500">Your Performance</h3>
          </div>
          <KPIOverview />
        </section>

        {/* Tasks Section */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <ListTodo className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold">Assigned Tasks</h3>
          </div>
          <TaskList />
        </section>
      </main>

      {/* Footer / Bottom Nav (for mobile) */}
      <footer className="bg-white border-t py-6 mt-12 md:hidden">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Stitch Field Worker KPI Dashboard
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
