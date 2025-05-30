import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  booths, 
  interviewSlots, 
  interviewBookings, 
  jobSeekers,
  events 
} from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User, Settings, MapPin } from "lucide-react";
import { InterviewSlotModal } from "@/components/employer/interview-slot-modal";

export default async function EmployerInterviewsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user info to check role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const currentUser = user[0];
  
  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // For admin users without employer profile, create a mock employer
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get employer's booths
  const employerBooths = await db
    .select({
      booth: booths,
      event: events,
    })
    .from(booths)
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id));

  // Format booths for the modal
  const boothsForModal = employerBooths.map(item => ({
    id: item.booth.id,
    boothNumber: item.booth.boothNumber,
    location: item.booth.location,
    event: item.event ? {
      name: item.event.name,
      venue: item.event.venue
    } : undefined
  }));

  // Get interview slots
  const interviewSlotsData = employerBooths.length > 0 ? await db
    .select({
      slot: interviewSlots,
      booking: interviewBookings,
      jobSeeker: jobSeekers,
      user: users,
      booth: booths,
      event: events,
    })
    .from(interviewSlots)
    .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
    .leftJoin(jobSeekers, eq(jobSeekers.id, interviewBookings.jobSeekerId))
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id))
    .orderBy(desc(interviewSlots.startTime)) : [];

  // Separate upcoming and past interviews
  const upcomingInterviews = interviewSlotsData.filter(item => 
    item.slot.startTime >= today
  );
  const pastInterviews = interviewSlotsData.filter(item => 
    item.slot.startTime < today
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600 mt-2">
            Schedule and manage your interview slots and candidate meetings
          </p>
        </div>
        <InterviewSlotModal booths={boothsForModal} />
      </div>

      {/* Admin Notice */}
      {currentUser.role === "admin" && !employerProfile[0] && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Admin Mode</h3>
                <p className="text-orange-800 text-sm">
                  You're viewing interview management as an administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingInterviews.length}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingInterviews.filter(i => i.booking).length}
                </p>
                <p className="text-sm text-gray-600">Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingInterviews.filter(i => !i.booking).length}
                </p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{employerBooths.length}</p>
                <p className="text-sm text-gray-600">Booths</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Interviews
            </CardTitle>
            <InterviewSlotModal 
              booths={boothsForModal}
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No upcoming interviews
              </h3>
              <p className="text-gray-600 mb-6">
                Create interview slots to start scheduling meetings with candidates
              </p>
              <InterviewSlotModal 
                booths={boothsForModal}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interview Slot
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((item) => (
                <div
                  key={item.slot.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {new Date(item.slot.startTime).toLocaleDateString()} at{" "}
                            {new Date(item.slot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <Badge className={getStatusColor(item.booking?.status || 'available')}>
                          {item.booking?.status || 'Available'}
                        </Badge>
                        {item.slot.duration && (
                          <Badge variant="outline">
                            {item.slot.duration} min
                          </Badge>
                        )}
                      </div>

                      {item.user && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {item.user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{item.user.name}</span>
                            <p className="text-sm text-gray-600">{item.user.email}</p>
                          </div>
                        </div>
                      )}

                      {item.booth && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>Booth {item.booth.boothNumber} - {item.booth.location}</span>
                        </div>
                      )}

                      {item.slot.interviewerName && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Interviewer:</strong> {item.slot.interviewerName}
                        </div>
                      )}

                      {item.slot.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {item.slot.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {item.booking ? (
                        <Button size="sm">
                          Start Interview
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Configure
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

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastInterviews.slice(0, 5).map((item) => (
                <div
                  key={item.slot.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">
                            {new Date(item.slot.startTime).toLocaleDateString()} at{" "}
                            {new Date(item.slot.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <Badge className={getStatusColor(item.booking?.status || 'completed')}>
                          {item.booking?.status || 'Completed'}
                        </Badge>
                      </div>

                      {item.user && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900">{item.user.name}</span>
                        </div>
                      )}

                      {item.booking?.feedback && (
                        <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border">
                          <strong>Feedback:</strong> {item.booking.feedback}
                        </p>
                      )}
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Booth Notice */}
      {employerBooths.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              No Booth Configured
            </h3>
            <p className="text-yellow-800 mb-4">
              You need to set up a booth before creating interview slots
            </p>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Setup Booth First
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 