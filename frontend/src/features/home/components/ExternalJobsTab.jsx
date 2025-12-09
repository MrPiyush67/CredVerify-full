import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, Button, Input, Badge } from '@common';
import {
  Filter,
  Search,
  X,
  Loader2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common/ui/Select';
import { Separator } from '@common/ui/separator';
import { Skeleton } from '@common/ui/skeleton';
import JobCards from './JobCards.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8003/api';
const JOBS_PER_PAGE = 18;

export default function ExternalJobsTab({ id, tabpanelProps = {} }) {
  const [jobs, setJobs] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('shuffled');
  const [useMockData, setUseMockData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());

  // Fetch sectors on mount
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/credentials/job-sectors`);
        if (response.data.success) {
          setSectors(response.data.data.sectors);
        }
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
      }
    };

    fetchSectors();
  }, []);

  // Fetch jobs when sector changes or on initial load
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        let url = `${API_BASE_URL}/credentials/external-jobs`;
        const params = new URLSearchParams();

        if (selectedSector && selectedSector !== 'all') {
          params.append('sector', selectedSector);
        }

        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        if (useMockData) {
          params.append('useMock', 'true');
        }

        params.append('limit', '20');

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await axios.get(url);

        if (response.data.success) {
          // Handle different response formats
          let fetchedJobs = [];

          if (response.data.data.jobs) {
            // Single sector or search result
            fetchedJobs = response.data.data.jobs;
          } else if (response.data.data.jobsBySector) {
            // All sectors - flatten the jobs from all sectors
            const jobsBySector = response.data.data.jobsBySector;
            fetchedJobs = Object.values(jobsBySector).flat();
          }

          setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedSector, searchQuery, useMockData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSector, searchQuery, sortBy]);

  // Shuffle function with seed for consistent randomization
  const shuffleWithSeed = (array, seed) => {
    const shuffled = [...array];
    let currentSeed = seed;

    for (let i = shuffled.length - 1; i > 0; i--) {
      // Simple seeded random number generator
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const j = Math.floor((currentSeed / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filter, sort and shuffle jobs
  const sortedJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    let jobsCopy = [...jobs];

    // Client-side search filter (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      jobsCopy = jobsCopy.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting first
    switch (sortBy) {
      case 'recent':
        jobsCopy.sort((a, b) =>
          new Date(b.postedDate) - new Date(a.postedDate)
        );
        break;
      case 'salary-high':
        jobsCopy.sort((a, b) =>
          (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0)
        );
        break;
      case 'salary-low':
        jobsCopy.sort((a, b) =>
          (a.salaryMin || a.salaryMax || 0) - (b.salaryMin || b.salaryMax || 0)
        );
        break;
      case 'title':
        jobsCopy.sort((a, b) =>
          (a.title || '').localeCompare(b.title || '')
        );
        break;
      case 'company':
        jobsCopy.sort((a, b) =>
          (a.company || '').localeCompare(b.company || '')
        );
        break;
      case 'shuffled':
      default:
        // Only apply shuffle if sort is set to 'shuffled' or default
        jobsCopy = shuffleWithSeed(jobsCopy, shuffleSeed);
        break;
    }

    return jobsCopy;
  }, [jobs, sortBy, shuffleSeed, searchQuery]);

  // Paginate jobs
  const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    return sortedJobs.slice(startIndex, endIndex);
  }, [sortedJobs, currentPage]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    // Generate a new random seed for shuffling
    const newSeed = Math.floor(Math.random() * 1000000);
    console.log('Re-shuffling jobs with seed:', newSeed);
    setSortBy('shuffled'); // Set to shuffled mode
    setShuffleSeed(newSeed);
    setCurrentPage(1);
    // Scroll to top to make the shuffle more noticeable
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSector && selectedSector !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (sortBy !== 'shuffled') count++;
    return count;
  }, [selectedSector, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedSector('all');
    setSearchQuery('');
    setSortBy('shuffled');
    setCurrentPage(1);
  };

  return (
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
            <div className="flex gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8 text-xs"
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Re-shuffle
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search and Sector Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>

              {/* Sector Filter */}
              <Select
                value={selectedSector || 'all'}
                onValueChange={(value) => {
                  setSelectedSector(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'shuffled', label: 'Shuffled' },
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'salary-high', label: 'Highest Salary' },
                  { value: 'salary-low', label: 'Lowest Salary' },
                  { value: 'title', label: 'Job Title' },
                  { value: 'company', label: 'Company' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${sortBy === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{paginatedJobs.length}</span> jobs
            {selectedSector && selectedSector !== 'all' && (
              <> in <span className="font-medium text-foreground">{selectedSector}</span></>
            )}
            {' '}(<span className="font-medium text-foreground">{sortedJobs.length}</span> total)
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`j-skel-${i}`} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full rounded-md" />
            </Card>
          ))}
        </div>
      )}

      {/* Job Cards */}
      {!isLoading && <JobCards jobs={paginatedJobs} />}

      {/* Pagination Controls */}
      {!isLoading && sortedJobs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant={currentPage === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(1)}
                  className="w-10"
                >
                  1
                </Button>
                {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
              </>
            )}

            {/* Page numbers around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - currentPage);
                return distance <= 2;
              })
              .map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                <Button
                  variant={currentPage === totalPages ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className="w-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && sortedJobs.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {activeFilterCount > 0
                ? 'No jobs found matching your search.'
                : 'No jobs are currently available.'}
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
