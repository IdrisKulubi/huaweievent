import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, jobSeekers, employers } from "@/db/schema";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  Building, 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle
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
import { UserManagementModal } from "@/components/admin/user-management-modal";
import Image from "next/image";

async function getUsersData() {
  // Get user statistics
  const userStats = await db
    .select({
      role: users.role,
      count: count(),
      active: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
      inactive: sql<number>`COUNT(CASE WHEN ${users.isActive} = false THEN 1 END)`,
    })
    .from(users)
    .groupBy(users.role);

  // Get recent users
  const recentUsers = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
      employer: employers,
    })
    .from(users)
    .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
    .leftJoin(employers, eq(employers.userId, users.id))
    .orderBy(desc(users.createdAt))
    .limit(20);

  // Get all users with detailed info
  const allUsers = await db
    .select({
      user: users,
      jobSeeker: jobSeekers,
      employer: employers,
    })
    .from(users)
    .leftJoin(jobSeekers, eq(jobSeekers.userId, users.id))
    .leftJoin(employers, eq(employers.userId, users.id))
    .orderBy(desc(users.lastActive));

  return { userStats, recentUsers, allUsers };
}

export default async function AdminUsersPage() {
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

  const { userStats, recentUsers, allUsers } = await getUsersData();

  // Calculate totals
  const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalActive = userStats.reduce((sum, stat) => sum + stat.active, 0);
  const totalInactive = userStats.reduce((sum, stat) => sum + stat.inactive, 0);

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    employer: "bg-blue-100 text-blue-800", 
    job_seeker: "bg-green-100 text-green-800",
    security: "bg-orange-100 text-orange-800"
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Shield;
      case "employer": return Building;
      case "job_seeker": return UserCheck;
      case "security": return Shield;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users, roles, and permissions across the platform
          </p>
        </div>
        <UserManagementModal 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          }
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      All registered users
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-green-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalActive.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {totalUsers > 0 ? Math.round((totalActive / totalUsers) * 100) : 0}% of total
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-white to-amber-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Inactive Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalInactive.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs attention
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">New This Month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {recentUsers.filter(u => 
                      new Date(u.user.createdAt).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Recent registrations
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Distribution by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {userStats.map((stat) => {
              const Icon = getRoleIcon(stat.role || '');
              return (
                <div key={stat.role} className="text-center p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 capitalize mb-1">
                    {stat.role?.replace('_', ' ')}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{stat.count}</p>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="text-green-600">{stat.active} active</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-orange-600">{stat.inactive} inactive</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Filter & Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            All Users ({allUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.slice(0, 50).map(({ user, jobSeeker, employer }) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {user.image ? (
                            <Image 
                              src={user.image} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full object-cover"
                              width={100}
                              height={100}
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
                          {employer && (
                            <p className="text-xs text-blue-600">{employer.companyName}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        {user.role?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </span>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
    </div>
  );
} 