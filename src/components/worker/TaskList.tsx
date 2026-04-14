"use client";

import { useState, useEffect } from "react";
import { Task } from "@/db/schema";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { InspectionForm } from "./InspectionForm";
import { Loader2 } from "lucide-react";
import { TaskLog } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TaskList() {
  const [tasks, setTasks] = useState<(Task & { assignedUser?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<(Task & { assignedUser?: { name: string } }) | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inspection state
  const [inspectingTaskId, setInspectingTaskId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchActiveLog();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.error || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("An error occurred while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLog = async () => {
    try {
      const res = await fetch("/api/task-logs?status=active");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setActiveTaskId(data.data[0].taskId);
      }
    } catch (err) {
      console.error("Failed to fetch active log", err);
    }
  };

  const handleStart = async (taskId: number) => {
    try {
      const res = await fetch("/api/task-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, startTime: new Date().toISOString() }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTaskId(taskId);
        // Refresh tasks to show updated status if API handles it
        fetchTasks();
      } else {
        alert(data.error || "Failed to start task");
      }
    } catch (err) {
      alert("An error occurred while starting task");
    }
  };

  const handleStop = async (taskId: number) => {
    // In a real app, we'd need the log ID. Assuming the API can find it by taskId and active status.
    try {
      const res = await fetch(`/api/task-logs/active?taskId=${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime: new Date().toISOString() }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTaskId(undefined);
        fetchTasks();
      } else {
        alert(data.error || "Failed to stop task");
      }
    } catch (err) {
      alert("An error occurred while stopping task");
    }
  };

  const handleComplete = (taskId: number) => {
    setInspectingTaskId(taskId);
  };

  const handleInspectionSubmitted = () => {
    setInspectingTaskId(null);
    setActiveTaskId(undefined);
    fetchTasks();
  };

  const handleOpenDetail = async (task: Task & { assignedUser?: { name: string } }) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    // Fetch logs for this task
    try {
      const res = await fetch(`/api/task-logs?taskId=${task.id}`);
      const data = await res.json();
      if (data.success) {
        setTaskLogs(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch task logs", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No tasks assigned to you.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} onClick={() => handleOpenDetail(task)} className="cursor-pointer">
            <TaskCard
              task={task}
              activeTaskId={activeTaskId}
              onStart={(id) => {
                handleStart(id);
              }}
              onStop={(id) => {
                handleStop(id);
              }}
              onComplete={(id) => {
                handleComplete(id);
              }}
            />
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          logs={taskLogs}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <Dialog open={!!inspectingTaskId} onOpenChange={(open) => !open && setInspectingTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Inspection</DialogTitle>
          </DialogHeader>
          {inspectingTaskId && (
            <InspectionForm
              taskId={inspectingTaskId}
              onSubmitted={handleInspectionSubmitted}
              onCancel={() => setInspectingTaskId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
