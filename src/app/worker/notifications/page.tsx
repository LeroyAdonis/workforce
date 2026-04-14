import { BottomNav } from "@/components/worker/BottomNav";
import { Bell } from "lucide-react";

export default function WorkerNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      <header className="bg-white border-b h-16 flex items-center px-4">
        <h1 className="font-bold text-lg">Notifications</h1>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col items-center justify-center text-muted-foreground">
        <Bell className="h-12 w-12 mb-4 opacity-20" />
        <p>You're all caught up!</p>
      </main>
      <BottomNav />
    </div>
  );
}
