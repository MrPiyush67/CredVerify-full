import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@common';
<<<<<<< HEAD
import { Filter } from 'lucide-react';
=======
import {
  Filter,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  TrendingUp,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common/ui/select';
import { Separator } from '@common/ui/separator';
import { Skeleton } from '@common/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@common/ui/accordion';
import { Switch } from '@common/ui/switch';
import { Label } from '@common/ui/label';

>>>>>>> my-local-backup
import {
  fetchJobs,
  fetchMyJobs,
  fetchMyApplications,
  selectJobs,
  selectMyJobs,
  selectMyApplications
} from '../redux/homeSlice.js';
import { selectRole } from '@features/auth/redux/authSlice.js';
import { applyToJob } from '@features/jobs/redux/jobsSlice.js';

export default function JobsTab({ id, tabpanelProps = {} }) {
  const dispatch = useDispatch();
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
=======
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

>>>>>>> my-local-backup
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: ''
  });

  // Get current user and role
  const userRole = useSelector(selectRole);
  const canApply = userRole === 'learner';

  // Get data from Redux store based on user role
  const jobsData = useSelector(selectJobs);
  const myJobsData = useSelector(selectMyJobs);
  const myApplicationsData = useSelector(selectMyApplications);

  // Determine which jobs to show based on user role
  const { jobs, isLoading } = useMemo(() => {
    if (userRole === 'employer') {
      return {
        jobs: Array.isArray(myJobsData.data) ? myJobsData.data : [],
        isLoading: myJobsData.loading
      };
    } else {
      return {
        jobs: Array.isArray(jobsData.data) ? jobsData.data : [],
        isLoading: jobsData.loading
      };
    }
  }, [userRole, jobsData, myJobsData]);

  // Fetch appropriate data on mount based on role
  useEffect(() => {
    if (userRole === 'employer') {
      dispatch(fetchMyJobs());
    } else {
      dispatch(fetchJobs());
    }

    // If learner, also fetch applications to show applied jobs
    if (userRole === 'learner') {
      dispatch(fetchMyApplications());
    }
  }, [dispatch, userRole]);

  // Track applied jobs from applications data
  useEffect(() => {
    if (userRole === 'learner' && Array.isArray(myApplicationsData.data)) {
      const appliedJobIds = new Set(
        myApplicationsData.data.map(app => app.job || app.jobId).filter(Boolean)
      );
      setAppliedJobs(appliedJobIds);
    }
  }, [userRole, myApplicationsData.data]);

<<<<<<< HEAD
  // Filter jobs based on search query and filters
  const filteredJobs = useMemo(() => {
    let result = jobs;
    
    // Search by title or company name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => 
=======
  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Search by title or company name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) =>
>>>>>>> my-local-backup
        (job.title || '').toLowerCase().includes(query) ||
        (job.employer?.companyName || '').toLowerCase().includes(query)
      );
    }
<<<<<<< HEAD
    
=======

>>>>>>> my-local-backup
    // Filter by job type
    if (filters.jobType) {
      result = result.filter(job => job.jobType === filters.jobType);
    }
<<<<<<< HEAD
    
=======

>>>>>>> my-local-backup
    // Filter by experience level
    if (filters.experienceLevel) {
      result = result.filter(job => job.experienceLevel === filters.experienceLevel);
    }
<<<<<<< HEAD
    
=======

>>>>>>> my-local-backup
    // Filter by salary range
    if (filters.minSalary || filters.maxSalary) {
      result = result.filter(job => {
        if (!job.salary) return false;
        const jobMin = job.salary.min || 0;
        const jobMax = job.salary.max || Infinity;
        const filterMin = filters.minSalary ? parseInt(filters.minSalary) : 0;
        const filterMax = filters.maxSalary ? parseInt(filters.maxSalary) : Infinity;
<<<<<<< HEAD
        
        return jobMax >= filterMin && jobMin <= filterMax;
      });
    }
    
    return result;
  }, [jobs, searchQuery, filters]);
=======
        return jobMax >= filterMin && jobMin <= filterMax;
      });
    }

    // Filter by applied jobs only
    if (showAppliedOnly && canApply) {
      result = result.filter(job => appliedJobs.has(job._id || job.id));
    }

    // Sort jobs
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'salary-high':
          return (b.salary?.max || 0) - (a.salary?.max || 0);
        case 'salary-low':
          return (a.salary?.min || 0) - (b.salary?.min || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, searchQuery, filters, showAppliedOnly, appliedJobs, sortBy, canApply]);

  // Helper to count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.jobType) count++;
    if (filters.experienceLevel) count++;
    if (filters.minSalary || filters.maxSalary) count++;
    if (showAppliedOnly) count++;
    return count;
  }, [filters, showAppliedOnly]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      jobType: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: ''
    });
    setShowAppliedOnly(false);
    setSearchQuery('');
  };
>>>>>>> my-local-backup

  // Handle job application
  const handleApplyJob = async (job) => {
    const jobId = job._id || job.id;
    if (job.status !== 'active') return;
    if (appliedJobs.has(jobId)) return;
    if (!canApply) return;

    try {
      const result = await dispatch(applyToJob(jobId));
      if (result.type.endsWith('fulfilled')) {
        setAppliedJobs((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Failed to apply to job:', error);
    }
  };

  const getStatusIndicator = (status) => {
    if (status === 'active') {
      return <div className="w-2 h-2 bg-chart-verified rounded-full" />;
    }
    return <div className="w-2 h-2 bg-muted-foreground rounded-full" />;
  };

  return (
<<<<<<< HEAD
    <div
      className="space-y-3"
      id={id}
      {...tabpanelProps}
    >
      {/* Filters Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Name Search */}
            <Input
              placeholder="Search by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
            
            {/* Job Type Filter */}
            <select
              value={filters.jobType}
              onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
              className="text-sm px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            
            {/* Experience Level Filter */}
            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="text-sm px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
            </select>
            
            {/* Salary Range Filter */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min salary"
                value={filters.minSalary}
                onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max salary"
                value={filters.maxSalary}
                onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      {isLoading && Array.from({ length: 6 }).map((_, i) => (
        <Card key={`j-skel-${i}`}>
          <CardContent className="space-y-2 p-4">
            <div className="h-5 w-2/3 bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted/40 animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-muted/30 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}

      {!isLoading && filteredJobs.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-sm text-muted-foreground">No jobs found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredJobs.map((job) => {
        const jobId = job._id || job.id;
        const isExpanded = expandedJobId === jobId;
        const isApplied = appliedJobs.has(jobId);
        const isActive = job.status === 'active';

        return (
          <Card key={jobId} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="truncate">{job.title}</span>
                <div className="flex items-center gap-2 ml-2">
                  {getStatusIndicator(job.status)}
                  <Badge variant={isActive ? 'success' : 'secondary'} className="text-xs">
                    {isActive ? 'Active' : 'Draft'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{job.employer?.companyName || 'Company Not Specified'}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const loc = job.location;
                      if (typeof loc === 'object' && loc) {
                        return `${loc.city || ''}${loc.state ? ', ' + loc.state : ''}${loc.country ? ', ' + loc.country : ''}`.trim().replace(/^,|,$/, '') || 'Location not specified';
                      }
                      return loc || 'Location not specified';
                    })()}
                  </p>
                  {job.jobType && (
                    <Badge variant="outline" className="text-xs capitalize">
=======
    <div className="space-y-3" id={id} {...tabpanelProps}>
      {/* Filters Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters & Search</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Highest Salary</SelectItem>
                  <SelectItem value="salary-low">Lowest Salary</SelectItem>
                  <SelectItem value="title">Job Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Job Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Job Type</Label>
                <Select
                  value={filters.jobType || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Experience Level</Label>
                <Select
                  value={filters.experienceLevel || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Salary Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minSalary}
                    onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxSalary}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Show Applied Only Toggle (for learners) */}
            {canApply && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show Applied Jobs Only</Label>
                    <p className="text-xs text-muted-foreground">Filter to show only jobs you've applied to</p>
                  </div>
                  <Switch
                    checked={showAppliedOnly}
                    onCheckedChange={setShowAppliedOnly}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> of{' '}
            <span className="font-medium text-foreground">{jobs.length}</span> jobs
          </p>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Loading Skeletons */}
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={`j-skel-${i}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* No Results */}
        {!isLoading && filteredJobs.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <p className="text-sm text-muted-foreground">No jobs found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Job Cards */}
        {!isLoading && filteredJobs.map((job) => {
          const jobId = job._id || job.id;
          const isApplied = appliedJobs.has(jobId);
          const isActive = job.status === 'active';

          return (
            <Card key={jobId} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <Briefcase className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{job.title}</span>
                  </span>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {getStatusIndicator(job.status)}
                    <Badge variant={isActive ? 'success' : 'secondary'} className="text-xs">
                      {isActive ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Company Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{job.employer?.companyName || 'Company Not Specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {(() => {
                        const loc = job.location;
                        if (typeof loc === 'object' && loc) {
                          return `${loc.city || ''}${loc.state ? ', ' + loc.state : ''}${loc.country ? ', ' + loc.country : ''}`.trim().replace(/^,|,$/, '') || 'Location not specified';
                        }
                        return loc || 'Location not specified';
                      })()}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Job Details */}
                <div className="flex items-center gap-2 flex-wrap">
                  {job.jobType && (
                    <Badge variant="outline" className="text-xs capitalize">
                      <Clock className="h-3 w-3 mr-1" />
>>>>>>> my-local-backup
                      {job.jobType.replace('-', ' ')}
                    </Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="secondary" className="text-xs capitalize">
<<<<<<< HEAD
=======
                      <TrendingUp className="h-3 w-3 mr-1" />
>>>>>>> my-local-backup
                      {job.experienceLevel} level
                    </Badge>
                  )}
                </div>
<<<<<<< HEAD
              </div>

              {job.salary && (job.salary.min || job.salary.max) && (
                <p className="text-sm font-medium text-chart-verified">
                  💰 {(() => {
                    const { min, max, currency = 'USD' } = job.salary;
                    if (min && max) {
                      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
                    } else if (min) {
                      return `${currency} ${min.toLocaleString()}+`;
                    } else if (max) {
                      return `Up to ${currency} ${max.toLocaleString()}`;
                    }
                    return '';
                  })()}
                </p>
              )}

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {job.description && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isExpanded
                      ? job.description
                      : `${job.description.substring(0, 100)}${job.description.length > 100 ? '...' : ''}`
                    }
                  </p>
                  {job.description.length > 100 && (
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : jobId)}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
=======

                {/* Salary */}
                {job.salary && (job.salary.min || job.salary.max) && (
                  <div className="flex items-center gap-2 text-sm font-medium text-chart-verified">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {(() => {
                        const { min, max, currency = 'USD' } = job.salary;
                        if (min && max) {
                          return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
                        } else if (min) {
                          return `${currency} ${min.toLocaleString()}+`;
                        } else if (max) {
                          return `Up to ${currency} ${max.toLocaleString()}`;
                        }
                        return '';
                      })()}
                    </span>
                  </div>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Description with Accordion */}
                {job.description && job.description.length > 150 ? (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="description" className="border-0">
                      <div className="text-sm text-muted-foreground">
                        {job.description.substring(0, 150)}...
                      </div>
                      <AccordionTrigger className="py-2 text-xs hover:no-underline">
                        Read full description
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {job.description}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : job.description ? (
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                ) : null}

                <Separator />

                {/* Actions and Meta */}
                <div className="flex items-center justify-between pt-1">
>>>>>>> my-local-backup
                  <Button
                    size="sm"
                    onClick={() => handleApplyJob(job)}
                    disabled={isApplied || !isActive || !canApply}
                    variant={isApplied ? "outline" : "default"}
                    className="text-xs"
                  >
<<<<<<< HEAD
                    {isApplied ? 'Applied ✓' : !canApply ? 'Login to apply' : 'Apply'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {job.createdAt ? `Posted ${new Date(job.createdAt).toLocaleDateString()}` : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
=======
                    {isApplied ? '✓ Applied' : !canApply ? 'View Details' : 'Apply Now'}
                  </Button>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Date N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
>>>>>>> my-local-backup
    </div>
  );
}
