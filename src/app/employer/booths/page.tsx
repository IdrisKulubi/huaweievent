import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, employers, booths, events } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Settings, Plus, Users, Wrench } from "lucide-react";
import { BoothCreationModal } from "@/components/employer/booth-creation-modal";

export default async function EmployerBoothsPage() {
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

  // Get active events
  const activeEvents = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .orderBy(desc(events.startDate));

  // Get employer's booths
  const employerBooths = await db
    .select({
      booth: booths,
      event: events,
    })
    .from(booths)
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id))
    .orderBy(desc(booths.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booth Management</h1>
          <p className="text-gray-600 mt-2">
            Configure and manage your exhibition booth setup
          </p>
        </div>
        <BoothCreationModal events={activeEvents} />
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
                  You're viewing booth management as an administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Active Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.venue}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <BoothCreationModal 
                    events={[event]} 
                    trigger={
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Setup Booth for This Event
                      </Button>
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Booths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Your Booths
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employerBooths.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No booths configured yet
              </h3>
              <p className="text-gray-600 mb-6">
                Set up your booth to start connecting with job seekers at events
              </p>
              <BoothCreationModal 
                events={activeEvents}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Setup Your First Booth
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employerBooths.map((item) => (
                <div
                  key={item.booth.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Booth {item.booth.boothNumber}
                      </h3>
                      <p className="text-gray-600 mt-1">{item.booth.location}</p>
                      {item.event && (
                        <p className="text-sm text-blue-600 mt-1">
                          {item.event.name}
                        </p>
                      )}
                    </div>
                    <Badge variant={item.booth.isActive ? "default" : "secondary"}>
                      {item.booth.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Size: {item.booth.size}</span>
                    </div>
                    {item.booth.equipment && item.booth.equipment.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Wrench className="h-4 w-4 mt-0.5" />
                        <div>
                          <span>{item.booth.equipment.length} equipment items</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.booth.equipment.slice(0, 3).map((eq, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                            {item.booth.equipment.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.booth.equipment.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {item.booth.specialRequirements && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Special Requirements:</strong> {item.booth.specialRequirements}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Slots
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booth Setup Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <MapPin className="h-5 w-5" />
            Booth Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-blue-900">Choose Event</h3>
              <p className="text-blue-800 text-sm mt-1">
                Select which event you want to participate in
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-blue-900">Configure Booth</h3>
              <p className="text-blue-800 text-sm mt-1">
                Set up your booth details and requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-blue-900">Add Time Slots</h3>
              <p className="text-blue-800 text-sm mt-1">
                Create interview slots for candidates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 