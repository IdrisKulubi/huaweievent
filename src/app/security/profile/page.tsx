import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, securityPersonnel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Mail, 
  Activity, 
  Settings,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Key,
  WifiOff
} from "lucide-react";
import Link from "next/link";

export default async function SecurityProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get security user details
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "security") {
    redirect("/dashboard");
  }

  // Get security personnel profile
  const securityProfile = await db
    .select()
    .from(securityPersonnel)
    .where(eq(securityPersonnel.userId, session.user.id))
    .limit(1);

  if (!securityProfile[0]) {
    redirect("/security/setup");
  }

  const securityUser = user[0];
  const security = securityProfile[0];

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "entry_control": return "bg-blue-100 text-blue-800";
      case "patrol": return "bg-green-100 text-green-800";
      case "incident_response": return "bg-red-100 text-red-800";
      case "general_security": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case "advanced": return "bg-purple-100 text-purple-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "basic": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Security Personnel Profile
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Security officer with access control and monitoring privileges
            </p>
          </div>

          {/* Security Information */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  Security Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Badge Number:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{security.badgeNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Department:</span>
                    <Badge className={getDepartmentColor(security.department || "")}>
                      {security.department?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Clearance Level:</span>
                    <Badge className={getClearanceColor(security.clearanceLevel || "basic")}>
                      {security.clearanceLevel?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Duty Status:</span>
                    <Badge className={security.isOnDuty ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {security.isOnDuty ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Duty
                        </>
                      ) : (
                        "Off Duty"
                      )}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Name:</span>
                    <span className="text-slate-800 dark:text-slate-200">{securityUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Email:</span>
                    <span className="text-slate-800 dark:text-slate-200">{securityUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Role:</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Security Personnel
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                    <Badge className={securityUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {securityUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shift Information */}
          {(security.shiftStart || security.shiftEnd) && (
            <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  Shift Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {security.shiftStart && (
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                      <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Shift Start</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(security.shiftStart).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  {security.shiftEnd && (
                    <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                      <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Shift End</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(security.shiftEnd).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Checkpoints */}
          {security.assignedCheckpoints && security.assignedCheckpoints.length > 0 && (
            <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  Assigned Checkpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {security.assignedCheckpoints.map((checkpointId, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Checkpoint {checkpointId}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Activity */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-600" />
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
                    {new Date(securityUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Active</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(securityUser.lastActive).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Profile Created</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(security.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Privileges */}
          <Card className="mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-red-50/30 dark:from-slate-800 dark:to-red-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                Security Privileges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Check Attendees",
                  "Generate PINs", 
                  "Access Control",
                  "Security Reports",
                  "Crowd Monitoring",
                  "Incident Management"
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
                  <Link href="/security">
                    <Shield className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Security Dashboard</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/security/offline">
                    <WifiOff className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Offline Mode</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/security">
                    <Key className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">PIN Verification</span>
                  </Link>
                </Button>
                
                <Button asChild className="h-auto p-4 flex-col bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <Link href="/security">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Report Incident</span>
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