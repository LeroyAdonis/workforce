"use client";

import { Task, TaskLog } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Calendar, User, FileText } from "lucide-react";

interface TaskDetailModalProps {
  task: Task & { assignedUser?: { name: string } };
  logs: TaskLog[];
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, logs, isOpen, onClose }: TaskDetailModalProps) {
  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    pending: "secondary",
    "in-progress": "info",
    completed: "success",
    failed: "destructive",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant={statusVariants[task.status] || "default"}>
              {task.status.toUpperCase()}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
          <DialogDescription>
            Created on {format(new Date(task.createdAt), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {task.scheduledDate ? format(new Date(task.scheduledDate), "PPP") : "No date set"}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Assigned To</p>
                <p className="text-sm text-muted-foreground">{task.assignedUser?.name || "Unassigned"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Description</p>
            </div>
            <p className="text-sm bg-muted p-3 rounded-md">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Time Logs</p>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No time logs recorded for this task yet.</p>
            ) : (
              <div className="border rounded-md divide-y">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{format(new Date(log.startTime), "PPp")}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.endTime ? `Duration: ${calculateDuration(log.startTime, log.endTime)}` : "Still in progress"}
                      </p>
                    </div>
                    {log.endTime && (
                      <Badge variant="outline">
                        {format(new Date(log.endTime), "p")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calculateDuration(start: Date | string, end: Date | string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
