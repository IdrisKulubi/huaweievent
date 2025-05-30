import { auth } from "@/auth";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  booths, 
  interviewSlots, 
  interviewBookings, 
  shortlists,
  candidateInteractions,
  events,
  jobSeekers,
  jobs
} from "@/db/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { EmployerStats } from "@/components/employer/employer-stats";
import { RecentInterviews } from "@/components/employer/recent-interviews";
import { CandidateActivity } from "@/components/employer/candidate-activity";
import { QuickActions } from "@/components/employer/quick-actions";
import { UpcomingSlots } from "@/components/employer/upcoming-slots";

export default async function EmployerDashboard() {
  const session = await auth();
  
  // Get user info to check role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session!.user!.id))
    .limit(1);

  const currentUser = user[0];
  
  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session!.user!.id))
    .limit(1);

  // For admin users without employer profile, create a mock employer
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session!.user!.id,
    companyName: "Admin Portal Access",
    companyDescription: "Administrative access to employer features",
    industry: "administration",
    companySize: "enterprise" as const,
    website: null,
    logoUrl: null,
    address: null,
    contactPerson: currentUser.name,
    contactEmail: currentUser.email,
    contactPhone: null,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Get current active event (most recent active event)
  const activeEvent = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .orderBy(desc(events.startDate))
    .limit(1);

  const eventId = activeEvent[0]?.id;

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get employer's booths (will be empty for admin users without real employer profile)
  const employerBooths = await db
    .select()
    .from(booths)
    .where(
      and(
        eq(booths.employerId, employer.id),
        eventId ? eq(booths.eventId, eventId) : undefined
      )
    );

  // Get interview slots for today
  const todaySlotsRaw = employerBooths.length > 0 ? await db
    .select({
      slot: interviewSlots,
      booking: interviewBookings,
      jobSeeker: jobSeekers,
      user: users
    })
    .from(interviewSlots)
    .leftJoin(interviewBookings, eq(interviewBookings.interviewSlotId, interviewSlots.id))
    .leftJoin(jobSeekers, eq(jobSeekers.id, interviewBookings.jobSeekerId))
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .where(
      and(
        eq(interviewSlots.boothId, employerBooths[0]?.id || ''),
        gte(interviewSlots.startTime, today),
        lte(interviewSlots.startTime, tomorrow)
      )
    )
    .orderBy(interviewSlots.startTime) : [];

  // Transform the data to match component interfaces
  const todaySlots = todaySlotsRaw.map(item => ({
    slot: {
      id: item.slot.id,
      startTime: item.slot.startTime,
      endTime: item.slot.endTime,
      duration: item.slot.duration ?? 30, // Default to 30 minutes if null
      isBooked: item.slot.isBooked ?? false,
      interviewerName: item.slot.interviewerName,
      notes: item.slot.notes,
    },
    booking: item.booking ? {
      id: item.booking.id,
      status: (item.booking.status ?? "scheduled") as "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show",
      notes: item.booking.notes,
      feedback: item.booking.feedback,
      rating: item.booking.rating,
    } : null,
    jobSeeker: item.jobSeeker,
    user: item.user
  }));

  // Get recent candidate interactions (will be empty for admin users without real employer profile)
  const recentInteractions = employerProfile[0] ? await db
    .select({
      interaction: candidateInteractions,
      jobSeeker: jobSeekers,
      user: users
    })
    .from(candidateInteractions)
    .leftJoin(jobSeekers, eq(jobSeekers.id, candidateInteractions.jobSeekerId))
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .where(eq(candidateInteractions.employerId, employer.id))
    .orderBy(desc(candidateInteractions.createdAt))
    .limit(5) : [];

  // Get shortlists count (will be 0 for admin users without real employer profile)
  const shortlistsCount = employerProfile[0] ? await db
    .select({ count: count() })
    .from(shortlists)
    .where(eq(shortlists.employerId, employer.id)) : [{ count: 0 }];

  // Get total interview bookings (will be 0 for admin users without real employer profile)
  const totalBookings = employerProfile[0] ? await db
    .select({ count: count() })
    .from(interviewBookings)
    .leftJoin(interviewSlots, eq(interviewSlots.id, interviewBookings.interviewSlotId))
    .leftJoin(booths, eq(booths.id, interviewSlots.boothId))
    .where(eq(booths.employerId, employer.id)) : [{ count: 0 }];

  // Get jobs count (will be 0 for admin users without real employer profile)
  const jobsCount = employerProfile[0] ? await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.employerId, employer.id)) : [{ count: 0 }];

  return (
    <div className="space-y-6">
      {/* Admin Notice (only shown for admin users) */}
      {currentUser.role === "admin" && !employerProfile[0] && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                👑 Admin Access Mode
              </h3>
              <p className="text-orange-800 mb-3">
                You're viewing the employer portal as an administrator. This gives you access to all employer features for oversight and support purposes.
              </p>
              <div className="flex gap-3">
                <a 
                  href="/admin" 
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                >
                  Return to Admin Panel
                </a>
                <span className="inline-flex items-center px-3 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-md">
                  All employer features available
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {employer.companyName}!
            </h1>
            <p className="text-gray-600 mb-4">
              {activeEvent[0] ? `Managing booth activities for ${activeEvent[0].name}` : 'No active events at the moment'}
            </p>
            {employerBooths.length > 0 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                📍 Booth {employerBooths[0].boothNumber} - {employerBooths[0].location}
              </div>
            )}
            {currentUser.role === "admin" && employerBooths.length === 0 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                🔧 Admin Mode - No booth configured
              </div>
            )}
          </div>
          <QuickActions employerId={employer.id} />
        </div>
      </div>

      {/* Stats Overview */}
      <EmployerStats 
        totalBookings={totalBookings[0]?.count || 0}
        todayInterviews={todaySlots.length}
        shortlistedCandidates={shortlistsCount[0]?.count || 0}
        activeJobs={jobsCount[0]?.count || 0}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="xl:col-span-2 space-y-6">
          <UpcomingSlots 
            slots={todaySlots}
            employerId={employer.id}
          />
          
          <RecentInterviews 
            interviews={todaySlots.slice(0, 5)}
            employerId={employer.id}
          />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <CandidateActivity 
            interactions={recentInteractions}
            employerId={employer.id}
          />
        </div>
      </div>
    </div>
  );
} 