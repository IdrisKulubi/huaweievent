import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, employers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Activity, 
  Settings,
  MapPin,
  Users as UsersIcon,
  Calendar,
  Briefcase,
  Star,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default async function EmployerProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get employer user details
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "employer") {
    redirect("/dashboard");
  }

  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  if (!employerProfile[0]) {
    redirect("/employer/setup");
  }

  const employerUser = user[0];
  const employer = employerProfile[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Employer Profile
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Company representative with recruitment privileges
            </p>
          </div>

          {/* Company Information */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Company:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{employer.companyName}</span>
                  </div>
                  {employer.industry && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Industry:</span>
                      <span className="text-slate-800 dark:text-slate-200">{employer.industry}</span>
                    </div>
                  )}
                  {employer.companySize && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Company Size:</span>
                      <span className="text-slate-800 dark:text-slate-200 capitalize">{employer.companySize}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Verification:</span>
                    <Badge className={employer.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {employer.isVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        "Pending Verification"
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Name:</span>
                    <span className="text-slate-800 dark:text-slate-200">{employerUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200">{employerUser.email}</span>
                  </div>
                  {employer.contactPhone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Phone:</span>
                      <span className="text-slate-800 dark:text-slate-200">{employer.contactPhone}</span>
                    </div>
                  )}
                  {employer.website && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Website:</span>
                      <a 
                        href={employer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {employer.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Description */}
          {employer.description && (
            <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  Company Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {employer.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Account Activity */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-orange-600" />
                </div>
                Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Joined</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(employerUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Active</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(employerUser.lastActive).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  <Badge className={employerUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {employerUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employer Privileges */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-indigo-600" />
                </div>
                Employer Privileges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Manage Company Profile",
                  "Create Job Postings", 
                  "Manage Booths",
                  "Schedule Interviews",
                  "View Candidates",
                  "Company Reports",
                  "Shortlist Candidates",
                  "Interview Management"
                ].map((privilege, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{privilege}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-green-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/employer/booths">
                    <Building className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Manage Booths</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/employer/candidates">
                    <UsersIcon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">View Candidates</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/employer/interviews">
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Interviews</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/employer/analytics">
                    <Activity className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Analytics</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 