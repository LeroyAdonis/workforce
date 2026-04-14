import { BottomNav } from "@/components/worker/BottomNav";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function WorkerProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      <header className="bg-white border-b h-16 flex items-center px-4">
        <h1 className="font-bold text-lg">My Profile</h1>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <User className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold">Stitch Worker</h2>
          <p className="text-muted-foreground mb-6">worker@stitch.com</p>
          
          <div className="w-full space-y-3">
             <div className="p-3 border rounded-lg flex justify-between">
                <span className="text-sm font-medium">Role</span>
                <span className="text-sm text-muted-foreground uppercase">Worker</span>
             </div>
             <div className="p-3 border rounded-lg flex justify-between">
                <span className="text-sm font-medium">Company</span>
                <span className="text-sm text-muted-foreground">Stitch Field Services</span>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t w-full flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
