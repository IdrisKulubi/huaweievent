import { Calendar, Users, Star, Briefcase, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployerStatsProps {
  totalBookings: number;
  todayInterviews: number;
  shortlistedCandidates: number;
  activeJobs: number;
}

export function EmployerStats({
  totalBookings,
  todayInterviews,
  shortlistedCandidates,
  activeJobs,
}: EmployerStatsProps) {
  const stats = [
    {
      title: "Today's Interviews",
      value: todayInterviews,
      icon: Calendar,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-blue-600",
      description: "Scheduled for today"
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Users,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      description: "All-time interviews"
    },
    {
      title: "Shortlisted",
      value: shortlistedCandidates,
      icon: Star,
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-600",
      description: "Candidates saved"
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
      description: "Open positions"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${stat.valueColor}`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {stat.description}
              </p>
              <div className={`mt-2 text-xs px-2 py-1 rounded-md inline-block ${stat.bgColor} ${stat.iconColor}`}>
                {stat.title === "Today's Interviews" && todayInterviews > 0 && "Busy day ahead"}
                {stat.title === "Today's Interviews" && todayInterviews === 0 && "Free day"}
                {stat.title === "Total Bookings" && totalBookings > 10 && "High engagement"}
                {stat.title === "Total Bookings" && totalBookings <= 10 && "Building momentum"}
                {stat.title === "Shortlisted" && shortlistedCandidates > 5 && "Strong pipeline"}
                {stat.title === "Shortlisted" && shortlistedCandidates <= 5 && "Growing list"}
                {stat.title === "Active Jobs" && activeJobs > 3 && "Multiple openings"}
                {stat.title === "Active Jobs" && activeJobs <= 3 && "Focused hiring"}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 