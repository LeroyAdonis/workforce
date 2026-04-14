import { TaskList } from "@/components/worker/TaskList";
import { BottomNav } from "@/components/worker/BottomNav";
import { ListTodo } from "lucide-react";

export default function WorkerTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      <header className="bg-white border-b h-16 flex items-center px-4">
        <h1 className="font-bold text-lg">My Tasks</h1>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <TaskList />
      </main>
      <BottomNav />
    </div>
  );
}
