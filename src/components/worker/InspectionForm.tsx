"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Save } from "lucide-react";

interface InspectionFormProps {
  taskId: number;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export function InspectionForm({ taskId, onSubmitted, onCancel }: InspectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update task log with inspection data
      // First, we need to find the active log for this task
      const logRes = await fetch(`/api/task-logs?taskId=${taskId}&status=active`);
      const logData = await logRes.json();
      
      if (!logData.success || logData.data.length === 0) {
        alert("No active timer found for this task.");
        return;
      }

      const logId = logData.data[0].id;

      const res = await fetch(`/api/task-logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          inspectionData: {
            findings,
            notes,
            photoUrl,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Also update task status to completed
        await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });
        
        onSubmitted?.();
      } else {
        alert(data.error || "Failed to submit inspection");
      }
    } catch (err) {
      alert("An error occurred while submitting inspection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="findings">Key Findings</Label>
        <Textarea
          id="findings"
          placeholder="What did you observe?"
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="photo">Photo URL (Optional)</Label>
        <div className="flex space-x-2">
          <Input
            id="photo"
            placeholder="https://example.com/photo.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <Button type="button" variant="outline" size="icon">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any other details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !findings} className="bg-green-600 hover:bg-green-700">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Submit Inspection & Finish
        </Button>
      </div>
    </form>
  );
}
