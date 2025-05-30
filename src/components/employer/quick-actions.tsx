"use client";

import Link from "next/link";
import { Plus, Calendar, Users, Star, MapPin, FileText, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickActionsProps {
  employerId: string;
}

export function QuickActions({ employerId }: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Create & Manage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/employer/booths" className="cursor-pointer">
            <MapPin className="h-4 w-4 mr-2" />
            Manage Booth Setup
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/employer/interviews" className="cursor-pointer">
            <Calendar className="h-4 w-4 mr-2" />
            Interview Scheduling
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem disabled>
          <FileText className="h-4 w-4 mr-2" />
          Post New Job
          <span className="ml-auto text-xs text-gray-400">Soon</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>View & Track</DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link href="/employer/candidates" className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" />
            Browse Candidates
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/employer/shortlists" className="cursor-pointer">
            <Star className="h-4 w-4 mr-2" />
            Manage Shortlists
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/employer/analytics" className="cursor-pointer">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics Dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 