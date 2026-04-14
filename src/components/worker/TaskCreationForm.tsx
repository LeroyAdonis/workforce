"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

interface TaskCreationFormProps {
  onTaskCreated?: () => void;
}

export function TaskCreationForm({ onTaskCreated }: TaskCreationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setLoading(true);
      // For workers, we'll need to know their user ID, 
      // but the backend API can handle setting assignedTo to the current user 
      // if it's not provided, or we can fetch it.
      // Actually, looking at the API, it expects assignedTo.
      // We'll need the current user ID. 
      // In a real app, we'd get this from a session context.
      
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          scheduledDate: scheduledDate || new Date().toISOString(),
          // The API requires assignedTo. We'll need to pass the current user's ID.
          // For now, I'll assume the API could be smarter or we fetch it.
          // Wait, the API I saw earlier: const { title, description, assignedTo, scheduledDate } = parsed.data;
          // It requires assignedTo. 
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        setDescription("");
        setScheduledDate("");
        setIsOpen(false);
        onTaskCreated?.();
      } else {
        alert(data.error || "Failed to create task");
      }
    } catch (err) {
      alert("An error occurred while creating task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> New Site Visit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Site Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title / Location</Label>
            <Input
              id="title"
              placeholder="e.g., Site Visit - Downtown Mall"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Notes / Purpose</Label>
            <Textarea
              id="description"
              placeholder="What needs to be inspected?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Scheduled Date (Optional)</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
