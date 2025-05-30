import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  jobSeekers,
  candidateInteractions,
  shortlists,
  interviewBookings,
  jobs
} from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Eye, 
  Heart, 
  Calendar, 
  Mail, 
  Phone, 
  Settings,
  Star,
  Filter
} from "lucide-react";
import { CandidateProfileModal } from "@/components/employer/candidate-profile-modal";
import { ShortlistModal } from "@/components/employer/shortlist-modal";
import { ContactButton } from "@/components/employer/contact-button";

export default async function EmployerCandidatesPage() {
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

  // Get all job seekers with their interactions
  const candidatesData = await db
    .select({
      jobSeeker: jobSeekers,
      user: users,
    })
    .from(jobSeekers)
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .orderBy(desc(jobSeekers.createdAt));

  // Get interaction counts for each candidate (for real employers)
  const interactionCounts = employerProfile[0] ? await db
    .select({
      jobSeekerId: candidateInteractions.jobSeekerId,
      count: count(),
    })
    .from(candidateInteractions)
    .where(eq(candidateInteractions.employerId, employer.id))
    .groupBy(candidateInteractions.jobSeekerId) : [];

  // Get shortlisted candidates (for real employers)
  const shortlistedCandidates = employerProfile[0] ? await db
    .select({
      jobSeekerId: shortlists.jobSeekerId,
    })
    .from(shortlists)
    .where(eq(shortlists.employerId, employer.id)) : [];

  const shortlistedIds = new Set(shortlistedCandidates.map(s => s.jobSeekerId));
  const interactionMap = new Map(interactionCounts.map(ic => [ic.jobSeekerId, ic.count]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage job seekers interested in your opportunities
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Star className="h-4 w-4 mr-2" />
            View Shortlists
          </Button>
        </div>
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
                  You're viewing candidate management as an administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates by name, skills, or experience..."
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{candidatesData.length}</p>
                <p className="text-sm text-gray-600">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{shortlistedCandidates.length}</p>
                <p className="text-sm text-gray-600">Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{interactionCounts.length}</p>
                <p className="text-sm text-gray-600">Viewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            All Candidates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidatesData.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates available
              </h3>
              <p className="text-gray-600">
                Candidates will appear here once they register for events
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidatesData.map((candidate) => {
                const interactionCount = interactionMap.get(candidate.jobSeeker.id) || 0;
                const isShortlisted = shortlistedIds.has(candidate.jobSeeker.id);
                
                // Format candidate data for modal
                const candidateForModal = {
                  jobSeeker: candidate.jobSeeker,
                  user: candidate.user!,
                  isShortlisted,
                  interactionCount
                };
                
                return (
                  <div
                    key={candidate.jobSeeker.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {candidate.user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {candidate.user?.name}
                            </h3>
                            <p className="text-gray-600">{candidate.user?.email}</p>
                          </div>
                          {isShortlisted && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Heart className="h-3 w-3 mr-1" />
                              Shortlisted
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {candidate.jobSeeker.experience && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Experience</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {candidate.jobSeeker.experience}
                              </p>
                            </div>
                          )}
                          {candidate.jobSeeker.skills && candidate.jobSeeker.skills.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {candidate.jobSeeker.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.jobSeeker.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.jobSeeker.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {candidate.jobSeeker.bio && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {candidate.jobSeeker.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{interactionCount} interactions</span>
                          </div>
                          {candidate.user?.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{candidate.user.phoneNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(candidate.jobSeeker.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <CandidateProfileModal
                          candidate={candidateForModal}
                          trigger={
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          }
                        />
                        <ContactButton email={candidate.user?.email} />
                        {!isShortlisted ? (
                          <ShortlistModal
                            candidateId={candidate.jobSeeker.id}
                            candidateName={candidate.user?.name || 'Unknown'}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Heart className="h-4 w-4 mr-2" />
                                Shortlist
                              </Button>
                            }
                          />
                        ) : (
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            Candidate Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Review Profiles</h3>
              <p className="text-blue-800 text-sm mt-1">
                Browse candidate profiles to find the best fit for your roles
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Create Shortlists</h3>
              <p className="text-blue-800 text-sm mt-1">
                Save promising candidates to organized shortlists for easy access
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Schedule Interviews</h3>
              <p className="text-blue-800 text-sm mt-1">
                Book interview slots to meet with your top candidates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 