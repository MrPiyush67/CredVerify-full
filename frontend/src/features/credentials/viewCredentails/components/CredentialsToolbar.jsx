import {
  ArrowDownUp,
  CalendarRange,
  RotateCcw,
  Search,
  ShieldCheck,
  Tags,
  Building2,
  BadgeCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CredentialsToolbar() {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input placeholder="Search credentials..." className="pl-10" />
      </div>

      {/* Filters */}

      <div className="flex flex-wrap items-center gap-2">
        {/* Sort */}

        <Select defaultValue="latest">
          <SelectTrigger className="w-[170px]">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="az">Name (A-Z)</SelectItem>
            <SelectItem value="za">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}

        <Select defaultValue="all-status">
          <SelectTrigger className="w-[170px]">
            <BadgeCheck className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="review">Review Required</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Type */}

        <Select defaultValue="all-type">
          <SelectTrigger className="w-[180px]">
            <Tags className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all-type">All Types</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="micro">Micro Credential</SelectItem>
            <SelectItem value="competition">Competition</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="hackathon">Hackathon</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Issuer */}

        <Select defaultValue="all-issuer">
          <SelectTrigger className="w-[170px]">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Issuer" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all-issuer">All Issuers</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="aws">Amazon</SelectItem>
            <SelectItem value="microsoft">Microsoft</SelectItem>
          </SelectContent>
        </Select>

        {/* Date */}

        <Select defaultValue="all-date">
          <SelectTrigger className="w-[165px]">
            <CalendarRange className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all-date">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        {/* Organization Verified */}

        <Select defaultValue="all-org">
          <SelectTrigger className="w-[175px]">
            <ShieldCheck className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Organization" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all-org">All Organizations</SelectItem>
            <SelectItem value="verified-org">Organization Verified</SelectItem>
            <SelectItem value="unverified-org">
              Not Organization Verified
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}

        <Button size="icon" variant="ghost">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
