"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Eye, Heart, Calendar, MessageCircle, User } from "lucide-react";

interface InteractionData {
  interaction: {
    id: string;
    interactionType: "booth_visit" | "cv_viewed" | "contact_info_accessed" | "interview_scheduled" | "note_added" | "shortlisted";
    duration: number | null;
    notes: string | null;
    rating: number | null;
    createdAt: Date;
  };
  jobSeeker: {
    id: string;
    bio: string | null;
    experience: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface CandidateActivityProps {
  interactions: InteractionData[];
  employerId: string;
}

export function CandidateActivity({ interactions, employerId }: CandidateActivityProps) {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "booth_visit":
        return <User className="h-4 w-4 text-blue-600" />;
      case "cv_viewed":
        return <Eye className="h-4 w-4 text-green-600" />;
      case "contact_info_accessed":
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case "note_added":
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
      case "shortlisted":
        return <Heart className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInteractionLabel = (type: string) => {
    switch (type) {
      case "booth_visit":
        return "Booth Visit";
      case "cv_viewed":
        return "CV Viewed";
      case "contact_info_accessed":
        return "Contact Accessed";
      case "interview_scheduled":
        return "Interview Scheduled";
      case "note_added":
        return "Note Added";
      case "shortlisted":
        return "Shortlisted";
      default:
        return "Activity";
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "booth_visit":
        return "bg-blue-100 text-blue-800";
      case "cv_viewed":
        return "bg-green-100 text-green-800";
      case "contact_info_accessed":
        return "bg-purple-100 text-purple-800";
      case "interview_scheduled":
        return "bg-orange-100 text-orange-800";
      case "note_added":
        return "bg-gray-100 text-gray-800";
      case "shortlisted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Candidate Activity
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time candidate interactions
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {interactions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recent activity
            </h3>
            <p className="text-gray-600">
              Candidate interactions will appear here as they happen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.map((interactionData) => (
              <div
                key={interactionData.interaction.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInteractionIcon(interactionData.interaction.interactionType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={getInteractionColor(interactionData.interaction.interactionType)}
                      >
                        {getInteractionLabel(interactionData.interaction.interactionType)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(interactionData.interaction.createdAt)}
                      </span>
                    </div>

                    {interactionData.user && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-900">
                          {interactionData.user.name}
                        </span>
                      </div>
                    )}

                    {interactionData.interaction.duration && (
                      <div className="text-sm text-gray-600 mb-2">
                        Duration: {interactionData.interaction.duration} minutes
                      </div>
                    )}

                    {interactionData.interaction.notes && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                        {interactionData.interaction.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 