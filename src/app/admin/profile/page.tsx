import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Activity, 
  Settings,
  Crown,
  Users as UsersIcon,
  Building,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get admin user details
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    redirect("/dashboard");
  }

  const adminUser = user[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Administrator Profile
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300">
              System administrator with full access privileges
            </p>
          </div>

          {/* Profile Information */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Name:</span>
                    <span className="text-slate-800 dark:text-slate-200">{adminUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200">{adminUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Role:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Administrator
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                    <Badge className={adminUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {adminUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Created:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {new Date(adminUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Last Active:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {new Date(adminUser.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Last Updated:</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {new Date(adminUser.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Administrative Privileges */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-indigo-600" />
                </div>
                Administrative Privileges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Manage Users",
                  "System Settings", 
                  "View All Reports",
                  "Security Controls",
                  "Data Export",
                  "User Roles",
                  "Event Management",
                  "Booth Management"
                ].map((privilege, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                    <Shield className="w-4 h-4 text-green-600" />
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
                  <Link href="/admin/users">
                    <UsersIcon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/admin/booths">
                    <Building className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Booth Management</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/admin/reports">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">View Reports</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/security">
                    <Shield className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Security Dashboard</span>
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