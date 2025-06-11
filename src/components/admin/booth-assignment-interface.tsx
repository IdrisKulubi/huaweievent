"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users, 
  Building, 
  Search, 
  Filter, 
  UserPlus,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Download,
  RefreshCw,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

// Types
interface JobSeeker {
  jobSeeker: {
    id: string;
    bio: string;
    skills: string[];
    experience: string;
    education: string;
    assignmentStatus: string;
    priorityLevel: string;
    createdAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  assignmentCount: number;
}

interface Booth {
  booth: {
    id: string;
    boothNumber: string;
    location: string;
    isActive: boolean;
  };
  employer: {
    id: string;
    companyName: string;
    industry?: string;
  };
  event: {
    id: string;
    name: string;
    venue: string;
  };
  assignmentCount: number;
  slotCount: number;
}

interface Assignment {
  jobSeekerId: string;
  boothId: string;
  interviewDate?: Date;
  interviewTime?: string;
  notes?: string;
  priority?: "high" | "medium" | "low";
}

interface BoothAssignmentInterfaceProps {
  initialJobSeekers: JobSeeker[];
  initialBooths: Booth[];
}

export function BoothAssignmentInterface({ 
  initialJobSeekers, 
  initialBooths 
}: BoothAssignmentInterfaceProps) {
  const router = useRouter();
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(initialJobSeekers);
  const [booths, setBooths] = useState<Booth[]>(initialBooths);
  const [selectedJobSeekers, setSelectedJobSeekers] = useState<string[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [bulkAssignmentData, setBulkAssignmentData] = useState<Assignment[]>([]);

  // Filters
  const filteredJobSeekers = jobSeekers.filter(item => {
    const matchesSearch = !searchTerm || 
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobSeeker.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = !skillFilter || 
      item.jobSeeker.skills?.some(skill => 
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      );

    const matchesExperience = !experienceFilter || 
      item.jobSeeker.experience === experienceFilter;

    return matchesSearch && matchesSkill && matchesExperience;
  });

  // Get unique skills and experience levels for filters
  const allSkills = Array.from(new Set(
    jobSeekers.flatMap(item => item.jobSeeker.skills || [])
  )).sort();

  const allExperienceLevels = Array.from(new Set(
    jobSeekers.map(item => item.jobSeeker.experience).filter(Boolean)
  )).sort();

  const handleJobSeekerSelect = (jobSeekerId: string) => {
    setSelectedJobSeekers(prev => 
      prev.includes(jobSeekerId)
        ? prev.filter(id => id !== jobSeekerId)
        : [...prev, jobSeekerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobSeekers.length === filteredJobSeekers.length) {
      setSelectedJobSeekers([]);
    } else {
      setSelectedJobSeekers(filteredJobSeekers.map(item => item.jobSeeker.id));
    }
  };

  const handleSingleAssignment = async (jobSeekerId: string, boothId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/booth-assignments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobSeekerId,
          boothId,
          priority: 'medium'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Job seeker assigned successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Assignment failed");
      }
    } catch (error) {
      toast.error("Failed to assign job seeker");
      console.error("Assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedJobSeekers.length === 0 || !selectedBooth) {
      toast.error("Please select job seekers and a booth");
      return;
    }

    setLoading(true);
    try {
      const assignments = selectedJobSeekers.map(jobSeekerId => ({
        jobSeekerId,
        boothId: selectedBooth,
        priority: 'medium' as const
      }));

      const response = await fetch('/api/admin/booth-assignments/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Bulk assignment completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
        setSelectedJobSeekers([]);
        setSelectedBooth("");
        router.refresh();
      } else {
        toast.error(result.error || "Bulk assignment failed");
      }
    } catch (error) {
      toast.error("Failed to perform bulk assignment");
      console.error("Bulk assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async () => {
    if (selectedJobSeekers.length === 0) {
      toast.error("Please select job seekers to notify");
      return;
    }

    setLoading(true);
    try {
      // Get assignment IDs for selected job seekers
      const response = await fetch('/api/admin/notifications/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobSeekerIds: selectedJobSeekers,
          templateType: 'booth_assignment'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Notifications sent: ${result.summary.successful} successful, ${result.summary.failed} failed`);
      } else {
        toast.error(result.error || "Failed to send notifications");
      }
    } catch (error) {
      toast.error("Failed to send notifications");
      console.error("Notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-100 text-blue-800 border-blue-300";
      case "confirmed": return "bg-green-100 text-green-800 border-green-300";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-300";
      case "unassigned": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booth Assignment Interface</h1>
          <p className="text-gray-600 mt-2">
            Manually assign job seekers to interview booths based on skills and requirements
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.refresh()}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setAssignmentModalOpen(true)}
            disabled={selectedJobSeekers.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Bulk Assign ({selectedJobSeekers.length})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Job Seekers</p>
                <p className="text-2xl font-bold text-gray-900">{jobSeekers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobSeekers.filter(js => js.jobSeeker.assignmentStatus !== 'unassigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobSeekers.filter(js => js.jobSeeker.assignmentStatus === 'unassigned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available Booths</p>
                <p className="text-2xl font-bold text-gray-900">{booths.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Job Seekers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Skill</Label>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All skills</SelectItem>
                  {allSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Experience</Label>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All experience levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All experience levels</SelectItem>
                  {allExperienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSkillFilter("");
                    setExperienceFilter("");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedJobSeekers.length === filteredJobSeekers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Seekers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Job Seekers ({filteredJobSeekers.length})
            </CardTitle>
            {selectedJobSeekers.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendNotifications}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notifications
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedJobSeekers.length} selected
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedJobSeekers.length === filteredJobSeekers.length && filteredJobSeekers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Job Seeker</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobSeekers.map((item) => (
                  <TableRow key={item.jobSeeker.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedJobSeekers.includes(item.jobSeeker.id)}
                        onChange={() => handleJobSeekerSelect(item.jobSeeker.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{item.user.name}</p>
                        <p className="text-sm text-gray-500">{item.user.email}</p>
                        {item.user.phoneNumber && (
                          <p className="text-sm text-gray-500">{item.user.phoneNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.jobSeeker.skills?.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {item.jobSeeker.skills && item.jobSeeker.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.jobSeeker.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.jobSeeker.experience}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.jobSeeker.assignmentStatus)}>
                        {item.jobSeeker.assignmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(item.jobSeeker.priorityLevel)}>
                        {item.jobSeeker.priorityLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {booths.slice(0, 5).map((booth) => (
                            <DropdownMenuItem
                              key={booth.booth.id}
                              onClick={() => handleSingleAssignment(item.jobSeeker.id, booth.booth.id)}
                              disabled={loading}
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Assign to Booth {booth.booth.boothNumber}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Booth Assignment</DialogTitle>
            <DialogDescription>
              Assign {selectedJobSeekers.length} selected job seekers to a booth
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Booth</Label>
              <Select value={selectedBooth} onValueChange={setSelectedBooth}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a booth for assignment" />
                </SelectTrigger>
                <SelectContent>
                  {booths.map((booth) => (
                    <SelectItem key={booth.booth.id} value={booth.booth.id}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Booth {booth.booth.boothNumber}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {booth.employer.companyName} • {booth.assignmentCount}/{booth.slotCount} assigned
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Selected Job Seekers:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedJobSeekers.map(id => {
                  const jobSeeker = jobSeekers.find(js => js.jobSeeker.id === id);
                  return jobSeeker ? (
                    <div key={id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="font-medium">{jobSeeker.user.name}</span>
                      <Badge variant="outline">{jobSeeker.jobSeeker.experience}</Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBulkAssignment}
                disabled={!selectedBooth || loading}
                className="flex-1"
              >
                {loading ? "Assigning..." : "Assign to Booth"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAssignmentModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 