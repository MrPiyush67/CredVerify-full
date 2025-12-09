import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Button, Badge, Input } from '@common';
import {
  Filter,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common/ui/Select';
import { Separator } from '@common/ui/separator';
import { Skeleton } from '@common/ui/skeleton';
import CourseCards from './CourseCards.jsx';

import {
  fetchExternalCourses,
  selectExternalCourses
} from '../redux/homeSlice.js';

export default function CoursesTab({ id, tabpanelProps = {} }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force new shuffle

  const [filters, setFilters] = useState({
    platform: '',
    category: '',
    nsqfLevel: '',
    minHours: '',
    maxHours: ''
  });

  // Get external courses from Redux store
  const externalCourses = useSelector(selectExternalCourses);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Fetch external courses when filters, page, or refreshKey changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 36,
      shuffle: true, // Always shuffle
      _refresh: refreshKey, // Add refresh key to force new request
      ...(searchQuery && { query: searchQuery }),
      ...(filters.platform && { platform: filters.platform }),
      ...(filters.category && { category: filters.category }),
      ...(filters.nsqfLevel && { nsqfLevel: filters.nsqfLevel }),
      ...(filters.minHours && { minHours: filters.minHours }),
      ...(filters.maxHours && { maxHours: filters.maxHours })
    };
    dispatch(fetchExternalCourses(params));
  }, [dispatch, currentPage, searchQuery, filters, refreshKey]);

  const courses = useMemo(() => {
    return Array.isArray(externalCourses.data) ? externalCourses.data : [];
  }, [externalCourses.data]);

  const pagination = externalCourses.pagination || {
    currentPage: 1,
    totalPages: 0,
    totalCourses: 0,
    hasNextPage: false,
    hasPrevPage: false
  };

  const isLoading = externalCourses.loading;

  // Extract unique platforms and categories from fetched courses
  const { availablePlatforms, availableCategories } = useMemo(() => {
    const platforms = new Set();
    const categories = new Set();

    courses.forEach(course => {
      if (course.platform) platforms.add(course.platform);
      if (course.category) categories.add(course.category);
    });

    return {
      availablePlatforms: Array.from(platforms).sort(),
      availableCategories: Array.from(categories).sort()
    };
  }, [courses]);

  // Sort courses (backend already filters, we just sort on frontend)
  const sortedCourses = useMemo(() => {
    const result = [...courses];

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return (b.id || 0) - (a.id || 0);
        case 'hours-high':
          return (b.duration || 0) - (a.duration || 0);
        case 'hours-low':
          return (a.duration || 0) - (b.duration || 0);
        case 'nsqf-level':
          return (b.nsqfLevel || 0) - (a.nsqfLevel || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return result;
  }, [courses, sortBy]);

  // Helper to count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.platform) count++;
    if (filters.category) count++;
    if (filters.nsqfLevel) count++;
    if (filters.minHours || filters.maxHours) count++;
    return count;
  }, [filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      platform: '',
      category: '',
      nsqfLevel: '',
      minHours: '',
      maxHours: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Refresh courses with new shuffle
  const refreshCourses = () => {
    setRefreshKey(prev => prev + 1); // Increment key to force new shuffle
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                onClick={refreshCourses}
                className="h-8 text-xs"
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Re-shuffle
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Search by course title, instructor, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="hours-high">Longest Duration</SelectItem>
                  <SelectItem value="hours-low">Shortest Duration</SelectItem>
                  <SelectItem value="nsqf-level">NSQF Level (High to Low)</SelectItem>
                  <SelectItem value="title">Course Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Platform Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Platform</label>
                <Select
                  value={filters.platform || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {availablePlatforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Category</label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NSQF Level Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">NSQF Level</label>
                <Select
                  value={filters.nsqfLevel || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, nsqfLevel: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All NSQF Levels</SelectItem>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                      <SelectItem key={level} value={level.toString()}>Level {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hours Range */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Duration (Hours)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minHours}
                    onChange={(e) => setFilters(prev => ({ ...prev, minHours: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxHours}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxHours: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing <span className="font-medium text-foreground">{sortedCourses.length}</span> courses on page {pagination.currentPage} of {pagination.totalPages}
            {' '}(<span className="font-medium text-foreground">{pagination.totalCourses}</span> total)
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={`c-skel-${i}`} className="p-3 space-y-2">
              <Skeleton className="w-full aspect-[16/9] rounded-lg" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && sortedCourses.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-sm text-muted-foreground">No courses found matching your search.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Course Cards - Udemy Style */}
      {!isLoading && sortedCourses.length > 0 && (
        <CourseCards courses={sortedCourses} />
      )}

      {/* Pagination Controls */}
      {!isLoading && sortedCourses.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
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
                  onClick={() => handlePageChange(1)}
                  className="w-10"
                >
                  1
                </Button>
                {currentPage > 4 && <span className="px-2 text-muted-foreground">...</span>}
              </>
            )}

            {/* Page numbers around current page */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - currentPage);
                return distance <= 2;
              })
              .map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}

            {/* Last page */}
            {currentPage < pagination.totalPages - 2 && (
              <>
                {currentPage < pagination.totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                <Button
                  variant={currentPage === pagination.totalPages ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="w-10"
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
