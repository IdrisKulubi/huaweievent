"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Loader2, MapPin } from "lucide-react";
import { createInterviewSlot } from "@/app/api/employer/booths/actions";

interface Booth {
  id: string;
  boothNumber: string;
  location: string;
  event?: {
    name: string;
    venue: string;
  };
}

interface InterviewSlotModalProps {
  booths: Booth[];
  trigger?: React.ReactNode;
}

export function InterviewSlotModal({ booths, trigger }: InterviewSlotModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    boothId: "",
    date: "",
    startTime: "",
    duration: 30,
    interviewerName: "",
    notes: "",
  });

  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.boothId || !formData.date || !formData.startTime) {
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      
      const result = await createInterviewSlot({
        boothId: formData.boothId,
        startTime: startDateTime,
        duration: formData.duration,
        interviewerName: formData.interviewerName || undefined,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          boothId: "",
          date: "",
          startTime: "",
          duration: 30,
          interviewerName: "",
          notes: "",
        });
        router.refresh();
      } else {
        console.error("Error creating interview slot:", result.message);
      }
    } catch (error) {
      console.error("Error creating interview slot:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Interview Slot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Create Interview Slot
          </DialogTitle>
          <DialogDescription>
            Schedule a new interview slot for candidates
          </DialogDescription>
        </DialogHeader>

        {booths.length === 0 ? (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                No Booth Available
              </h3>
              <p className="text-yellow-800 mb-4">
                You need to set up a booth before creating interview slots
              </p>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                Setup Booth First
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booth Selection */}
            <div className="space-y-2">
              <Label htmlFor="booth">Select Booth</Label>
              <Select
                value={formData.boothId}
                onValueChange={(value) => setFormData({ ...formData, boothId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a booth" />
                </SelectTrigger>
                <SelectContent>
                  {booths.map((booth) => (
                    <SelectItem key={booth.id} value={booth.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Booth {booth.boothNumber} - {booth.location}
                        </span>
                        {booth.event && (
                          <span className="text-sm text-gray-500">
                            {booth.event.name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  min={today}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interviewer Name */}
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name (Optional)</Label>
              <Input
                id="interviewerName"
                value={formData.interviewerName}
                onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                placeholder="e.g., John Smith, HR Manager"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions or requirements..."
                rows={3}
              />
            </div>

            {/* Preview */}
            {formData.date && formData.startTime && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Interview Preview</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {formData.startTime} - 
                      {new Date(`2024-01-01T${formData.startTime}:00`).getTime() + formData.duration * 60000 ? 
                        new Date(new Date(`2024-01-01T${formData.startTime}:00`).getTime() + formData.duration * 60000).toTimeString().slice(0, 5) : ''
                      }
                    </p>
                    <p>
                      <strong>Duration:</strong> {formData.duration} minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Slot
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 