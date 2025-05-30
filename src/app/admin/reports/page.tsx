import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  jobSeekers, 
  attendanceRecords,
  candidateInteractions,
  shortlists,
  interviewBookings,
  interviewSlots,
  booths,
  employers,
  events
} from "@/db/schema";
import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Users, 
  TrendingUp, 
  Calendar, 
  Building2,
  BarChart3,
  Target,
  Activity,
  FileText
} from "lucide-react";

export default async function ImpactReportsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check admin access
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    redirect("/dashboard");
  }

  // Get current active event
  const activeEvent = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .limit(1);

  if (!activeEvent[0]) {
    return (
      <div className="p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              No Active Event
            </h3>
            <p className="text-yellow-800">
              Please create an active event to generate impact reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventId = activeEvent[0].id;
  const eventStartDate = new Date(activeEvent[0].startDate);
  const eventEndDate = new Date(activeEvent[0].endDate);

  // Core Impact Metrics
  const [
    totalRegistrations,
    totalAttendees,
    totalEmployers,
    totalInteractions,
    totalInterviews,
    totalShortlisted,
    progressionData,
    employerEngagement,
    attendanceByDay,
    topEmployers
  ] = await Promise.all([
    // Total registrations
    db.select({ count: count() })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "approved")),
    
    // Total check-ins/attendees
    db.select({ count: count() })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.eventId, eventId),
          gte(attendanceRecords.checkInTime, eventStartDate),
          lte(attendanceRecords.checkInTime, eventEndDate)
        )
      ),
    
    // Total participating employers
    db.select({ count: count() })
      .from(booths)
      .where(eq(booths.eventId, eventId)),
    
    // Total candidate interactions
    db.select({ count: count() })
      .from(candidateInteractions)
      .where(
        and(
          eq(candidateInteractions.eventId, eventId),
          gte(candidateInteractions.createdAt, eventStartDate)
        )
      ),
    
    // Total interviews conducted
    db.select({ count: count() })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .where(
        and(
          eq(booths.eventId, eventId),
          eq(interviewBookings.status, "completed")
        )
      ),
    
    // Total shortlisted candidates
    db.select({ count: count() })
      .from(shortlists)
      .where(
        and(
          eq(shortlists.eventId, eventId),
          gte(shortlists.createdAt, eventStartDate)
        )
      ),
    
    // Progression funnel data
    db.select({
      status: interviewBookings.status,
      count: count()
    })
      .from(interviewBookings)
      .leftJoin(interviewSlots, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(booths, eq(interviewSlots.boothId, booths.id))
      .where(eq(booths.eventId, eventId))
      .groupBy(interviewBookings.status),
    
    // Employer engagement
    db.select({
      companyName: employers.companyName,
      interactions: count(candidateInteractions.id),
      interviews: sql<number>`COUNT(CASE WHEN ${interviewBookings.status} = 'completed' THEN 1 END)`,
      shortlisted: sql<number>`COUNT(CASE WHEN ${shortlists.id} IS NOT NULL THEN 1 END)`
    })
      .from(employers)
      .leftJoin(booths, eq(booths.employerId, employers.id))
      .leftJoin(candidateInteractions, eq(candidateInteractions.employerId, employers.id))
      .leftJoin(interviewSlots, eq(interviewSlots.boothId, booths.id))
      .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .leftJoin(shortlists, eq(shortlists.employerId, employers.id))
      .where(eq(booths.eventId, eventId))
      .groupBy(employers.id, employers.companyName)
      .orderBy(desc(count(candidateInteractions.id))),
    
    // Attendance by day
    db.select({
      date: sql<string>`DATE(${attendanceRecords.checkInTime})`,
      count: count()
    })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.eventId, eventId),
          gte(attendanceRecords.checkInTime, eventStartDate),
          lte(attendanceRecords.checkInTime, eventEndDate)
        )
      )
      .groupBy(sql`DATE(${attendanceRecords.checkInTime})`)
      .orderBy(sql`DATE(${attendanceRecords.checkInTime})`),
    
    // Top performing employers
    db.select({
      companyName: employers.companyName,
      industry: employers.industry,
      totalCandidates: count(candidateInteractions.jobSeekerId),
      completedInterviews: sql<number>`COUNT(CASE WHEN ${interviewBookings.status} = 'completed' THEN 1 END)`
    })
      .from(employers)
      .leftJoin(booths, eq(booths.employerId, employers.id))
      .leftJoin(candidateInteractions, eq(candidateInteractions.employerId, employers.id))
      .leftJoin(interviewSlots, eq(interviewSlots.boothId, booths.id))
      .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
      .where(eq(booths.eventId, eventId))
      .groupBy(employers.id, employers.companyName, employers.industry)
      .orderBy(desc(count(candidateInteractions.jobSeekerId)))
      .limit(10)
  ]);

  // Calculate key conversion rates
  const attendanceRate = totalRegistrations[0]?.count > 0 
    ? Math.round((totalAttendees[0]?.count || 0) / totalRegistrations[0].count * 100) 
    : 0;

  const interviewConversionRate = totalAttendees[0]?.count > 0
    ? Math.round((totalInterviews[0]?.count || 0) / totalAttendees[0].count * 100)
    : 0;

  const shortlistConversionRate = totalInterviews[0]?.count > 0
    ? Math.round((totalShortlisted[0]?.count || 0) / totalInterviews[0].count * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Reports</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics for {activeEvent[0].name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {totalRegistrations[0]?.count || 0}
              </p>
              <p className="text-blue-800 font-medium">Total Registrations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {totalAttendees[0]?.count || 0}
              </p>
              <p className="text-green-800 font-medium">Event Attendees</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {totalEmployers[0]?.count || 0}
              </p>
              <p className="text-purple-800 font-medium">Participating Employers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {attendanceRate}%
              </p>
              <p className="text-orange-800 font-medium">Attendance Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Interactions</span>
              <span className="font-bold text-2xl">{totalInteractions[0]?.count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Interviews</span>
              <span className="font-bold text-2xl">{totalInterviews[0]?.count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Candidates Shortlisted</span>
              <span className="font-bold text-2xl">{totalShortlisted[0]?.count || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Registration → Attendance</span>
                <span className="font-semibold">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Attendance → Interview</span>
                <span className="font-semibold">{interviewConversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${interviewConversionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Interview → Shortlist</span>
                <span className="font-semibold">{shortlistConversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${shortlistConversionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Daily Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceByDay.map((day) => (
                <div key={day.date} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <Badge variant="outline" className="font-semibold">
                    {day.count} attendees
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Candidate Progression Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {progressionData.map((status) => (
              <div key={status.status} className="text-center p-4 border border-gray-200 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {status.status?.replace('_', ' ') || 'Pending'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Employers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Top Performing Employers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEmployers.slice(0, 8).map((employer, index) => (
              <div key={employer.companyName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employer.companyName}</h3>
                    <p className="text-sm text-gray-600">{employer.industry || 'Technology'}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{employer.totalCandidates}</p>
                    <p className="text-xs text-gray-500">Candidates</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{employer.completedInterviews}</p>
                    <p className="text-xs text-gray-500">Interviews</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items for Huawei */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Key Insights for Huawei Partnership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-red-900 mb-3">Success Metrics</h3>
              <ul className="space-y-2 text-red-800">
                <li>• {totalAttendees[0]?.count || 0} job seekers actively engaged</li>
                <li>• {totalEmployers[0]?.count || 0} employers participated successfully</li>
                <li>• {totalInterviews[0]?.count || 0} meaningful interview connections made</li>
                <li>• {shortlistConversionRate}% progression rate from interview to shortlist</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-3">Growth Opportunities</h3>
              <ul className="space-y-2 text-red-800">
                <li>• Potential to expand to {Math.round((totalAttendees[0]?.count || 0) * 1.5)} attendees</li>
                <li>• Opportunity for {Math.round((totalEmployers[0]?.count || 0) * 1.2)} employer slots</li>
                <li>• Enhanced digital experience drove engagement</li>
                <li>• Strong foundation for annual partnership</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 