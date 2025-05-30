"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Star } from "lucide-react";

interface InterviewData {
  slot: {
    id: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
  };
  booking: {
    id: string;
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
    feedback: string | null;
    rating: number | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface RecentInterviewsProps {
  interviews: InterviewData[];
  employerId: string;
}

export function RecentInterviews({ interviews, employerId }: RecentInterviewsProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Recent Interviews
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Latest interview activities
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recent interviews
            </h3>
            <p className="text-gray-600">
              Interview history will appear here once you start conducting interviews.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.slot.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(interview.slot.startTime)} - {formatTime(interview.slot.endTime)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(interview.booking?.status)}
                      >
                        {interview.booking?.status || 'Available'}
                      </Badge>
                    </div>

                    {interview.user && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {interview.user.name}
                        </span>
                      </div>
                    )}

                    {interview.booking?.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          Rating: {interview.booking.rating}/5
                        </span>
                      </div>
                    )}

                    {interview.booking?.feedback && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Feedback:</strong> {interview.booking.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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