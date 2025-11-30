import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@common';
import { Filter } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: ''
  });

  // Get current user and role
  const userRole = useSelector(selectRole);
  const canApply = userRole === 'credentialist';

  // Get data from Redux store based on user role
  const jobsData = useSelector(selectJobs);
  const myJobsData = useSelector(selectMyJobs);
  const myApplicationsData = useSelector(selectMyApplications);

  // Determine which jobs to show based on user role
  const { jobs, isLoading } = useMemo(() => {
    if (userRole === 'curator') {
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
    if (userRole === 'curator') {
      dispatch(fetchMyJobs());
    } else {
      dispatch(fetchJobs());
    }

    // If credentialist, also fetch applications to show applied jobs
    if (userRole === 'credentialist') {
      dispatch(fetchMyApplications());
    }
  }, [dispatch, userRole]);

  // Track applied jobs from applications data
  useEffect(() => {
    if (userRole === 'credentialist' && Array.isArray(myApplicationsData.data)) {
      const appliedJobIds = new Set(
        myApplicationsData.data.map(app => app.job || app.jobId).filter(Boolean)
      );
      setAppliedJobs(appliedJobIds);
    }
  }, [userRole, myApplicationsData.data]);

  // Filter jobs based on search query and filters
  const filteredJobs = useMemo(() => {
    let result = jobs;
    
    // Search by title or company name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => 
        (job.title || '').toLowerCase().includes(query) ||
        (job.curator?.companyName || '').toLowerCase().includes(query)
      );
    }
    
    // Filter by job type
    if (filters.jobType) {
      result = result.filter(job => job.jobType === filters.jobType);
    }
    
    // Filter by experience level
    if (filters.experienceLevel) {
      result = result.filter(job => job.experienceLevel === filters.experienceLevel);
    }
    
    // Filter by salary range
    if (filters.minSalary || filters.maxSalary) {
      result = result.filter(job => {
        if (!job.salary) return false;
        const jobMin = job.salary.min || 0;
        const jobMax = job.salary.max || Infinity;
        const filterMin = filters.minSalary ? parseInt(filters.minSalary) : 0;
        const filterMax = filters.maxSalary ? parseInt(filters.maxSalary) : Infinity;
        
        return jobMax >= filterMin && jobMin <= filterMax;
      });
    }
    
    return result;
  }, [jobs, searchQuery, filters]);

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
                <p className="text-sm font-medium">{job.curator?.companyName || 'Company Not Specified'}</p>
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
                      {job.jobType.replace('-', ' ')}
                    </Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {job.experienceLevel} level
                    </Badge>
                  )}
                </div>
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
                  <Button
                    size="sm"
                    onClick={() => handleApplyJob(job)}
                    disabled={isApplied || !isActive || !canApply}
                    variant={isApplied ? "outline" : "default"}
                    className="text-xs"
                  >
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
    </div>
  );
}
