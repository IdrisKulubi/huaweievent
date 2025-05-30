import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Users, 
  UserCog, 
  Building, 
  UserCheck,
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Lock,
  Unlock,
  Crown,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleManagementModal } from "@/components/admin/role-management-modal";
import { Switch } from "@/components/ui/switch";

// Define role permissions
const rolePermissions = {
  admin: {
    name: "Administrator",
    description: "Full system access with all privileges",
    permissions: [
      "Manage Users", "Manage Events", "Manage Booths", "View Reports", 
      "System Settings", "Security Controls", "Data Export", "User Roles"
    ],
    color: "bg-purple-100 text-purple-800",
    icon: Crown,
    level: 4
  },
  security: {
    name: "Security Personnel",
    description: "Access to security features and crowd control",
    permissions: [
      "Check Attendees", "Generate PINs", "Access Control", "Security Reports", 
      "Crowd Monitoring", "Incident Management"
    ],
    color: "bg-orange-100 text-orange-800",
    icon: Shield,
    level: 3
  },
  employer: {
    name: "Employer",
    description: "Company representatives managing booths and jobs",
    permissions: [
      "Manage Company Profile", "Create Job Postings", "Manage Booths", 
      "Schedule Interviews", "View Candidates", "Company Reports"
    ],
    color: "bg-blue-100 text-blue-800",
    icon: Building,
    level: 2
  },
  job_seeker: {
    name: "Job Seeker",
    description: "Candidates looking for employment opportunities",
    permissions: [
      "View Jobs", "Apply to Positions", "Book Interviews", "Update Profile", 
      "View Event Schedule", "Access Career Resources"
    ],
    color: "bg-green-100 text-green-800",
    icon: UserCheck,
    level: 1
  }
};

async function getRoleData() {
  // Get user counts by role
  const roleStats = await db
    .select({
      role: users.role,
      count: count(),
      active: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
      recent: sql<number>`COUNT(CASE WHEN ${users.createdAt} >= NOW() - INTERVAL '30 days' THEN 1 END)`,
    })
    .from(users)
    .groupBy(users.role);

  // Get all users with role information
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.lastActive));

  // Get recent role changes (simulated - you might track this in a separate table)
  const recentRoleChanges = await db
    .select()
    .from(users)
    .where(sql`${users.updatedAt} >= NOW() - INTERVAL '7 days'`)
    .orderBy(desc(users.updatedAt))
    .limit(10);

  return { roleStats, allUsers, recentRoleChanges };
}

export default async function AdminRoleManagementPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser[0] || currentUser[0].role !== "admin") {
    redirect("/dashboard");
  }

  const { roleStats, allUsers, recentRoleChanges } = await getRoleData();

  const totalUsers = roleStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalActive = roleStats.reduce((sum, stat) => sum + stat.active, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user roles, permissions, and access controls across the platform
          </p>
        </div>
        <RoleManagementModal 
          trigger={
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserCog className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          }
        />
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(rolePermissions).map(([roleKey, roleInfo]) => {
          const stat = roleStats.find(s => s.role === roleKey);
          const count = stat?.count || 0;
          const active = stat?.active || 0;
          const Icon = roleInfo.icon;
          
          return (
            <Card key={roleKey} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-gray-500/20 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <Badge className={roleInfo.color}>
                      Level {roleInfo.level}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{roleInfo.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{count}</p>
                  <p className="text-xs text-gray-500 mb-3">{roleInfo.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">{active} active</span>
                    <span className="text-gray-400">{count - active} inactive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Role Permissions Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid gap-6">
              {Object.entries(rolePermissions).map(([roleKey, roleInfo]) => {
                const Icon = roleInfo.icon;
                return (
                  <div key={roleKey} className="border border-gray-200 rounded-lg p-6 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{roleInfo.name}</h3>
                          <p className="text-sm text-gray-500">{roleInfo.description}</p>
                        </div>
                      </div>
                      <Badge className={roleInfo.color}>
                        {roleStats.find(s => s.role === roleKey)?.count || 0} users
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {roleInfo.permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Role Changes */}
      {recentRoleChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Role Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRoleChanges.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={rolePermissions[user.role as keyof typeof rolePermissions]?.color}>
                      {rolePermissions[user.role as keyof typeof rolePermissions]?.name}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Filter & Search Users by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or role..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="security">Security Personnel</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table with Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            User Role Management ({allUsers.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.slice(0, 50).map((user) => {
                  const roleInfo = rolePermissions[user.role as keyof typeof rolePermissions];
                  const Icon = roleInfo?.icon || Users;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {user.image ? (
                              <img 
                                src={user.image} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <Badge className={roleInfo?.color}>
                            {roleInfo?.name || user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={user.isActive} 
                            size="sm"
                          />
                          <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {roleInfo?.permissions.slice(0, 2).map((permission, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {roleInfo && roleInfo.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{roleInfo.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {user.isActive ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {allUsers.length > 50 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                Load More Users ({allUsers.length - 50} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Role Management Security</h3>
              <p className="text-red-800 text-sm mb-3">
                Be careful when assigning admin roles. Only trusted personnel should have administrative access. 
                All role changes are logged and audited for security purposes.
              </p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" className="border-red-600 text-red-700 hover:bg-red-50">
                  <Shield className="h-4 w-4 mr-2" />
                  View Audit Log
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-700 hover:bg-red-50">
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 