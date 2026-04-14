"use client";

import { Task } from "@/db/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task & { assignedUser?: { name: string } };
  onStart?: (taskId: number) => void;
  onStop?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  activeTaskId?: number;
}

export function TaskCard({ task, onStart, onStop, onComplete, activeTaskId }: TaskCardProps) {
  const isStarted = activeTaskId === task.id;
  const isCompleted = task.status === "completed";
  
  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
    pending: "secondary",
    "in-progress": "info",
    completed: "success",
    failed: "destructive",
  };

  return (
    <Card className={`transition-all duration-300 ${isStarted ? "ring-2 ring-blue-500 shadow-lg scale-[1.02]" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={statusVariants[task.status] || "default"}>
            {task.status.toUpperCase()}
          </Badge>
          {task.scheduledDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(task.scheduledDate), "MMM d, yyyy")}
            </div>
          )}
        </div>
        <CardTitle className="mt-2 text-lg font-bold leading-tight">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between gap-2">
        {!isCompleted && (
          <>
            {isStarted ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStop?.(task.id);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <Clock className="mr-2 h-4 w-4 animate-pulse" />
                STOP TIMER
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart?.(task.id);
                }}
                disabled={!!activeTaskId}
                className={`flex-1 font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors ${
                  activeTaskId 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Clock className="mr-2 h-4 w-4" />
                START TASK
              </button>
            )}
            
            {isStarted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete?.(task.id);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                FINISH
              </button>
            )}
          </>
        )}
        
        {isCompleted && (
          <div className="w-full flex items-center justify-center text-sm font-medium text-green-600 bg-green-50 py-2 rounded-md">
            COMPLETED
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
