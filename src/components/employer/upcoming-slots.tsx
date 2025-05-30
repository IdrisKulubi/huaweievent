"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import { format } from "date-fns";

interface SlotData {
  slot: {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    isBooked: boolean;
    interviewerName: string | null;
    notes: string | null;
  };
  booking: {
    id: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
    notes: string | null;
  } | null;
  jobSeeker: {
    id: string;
    bio: string | null;
    experience: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
  } | null;
}

interface UpcomingSlotsProps {
  slots: SlotData[];
  employerId: string;
}

export function UpcomingSlots({ slots, employerId }: UpcomingSlotsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Today's Interview Schedule
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'} scheduled
              </p>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
            <span className="text-sm font-medium text-blue-700">
              {format(new Date(), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {slots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interviews scheduled for today
            </h3>
            <p className="text-gray-600 mb-4">
              Your schedule is clear. Great time to review candidates or plan for tomorrow!
            </p>
            <Button variant="outline" size="sm">
              View All Slots
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slotData) => (
              <div
                key={slotData.slot.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Clock className="h-4 w-4 text-blue-600" />
                        {format(slotData.slot.startTime, 'HH:mm')} - {format(slotData.slot.endTime, 'HH:mm')}
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(slotData.booking?.status)}
                      >
                        {slotData.booking?.status || 'Available'}
                      </Badge>
                    </div>

                    {slotData.user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {slotData.user.name}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {slotData.user.email}
                            </div>
                            {slotData.user.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {slotData.user.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          {slotData.jobSeeker?.experience && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Experience:</span>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {slotData.jobSeeker.experience}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {slotData.slot.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {slotData.slot.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {slotData.booking ? (
                      <>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="default" size="sm">
                          Start Interview
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">
                        Configure Slot
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 