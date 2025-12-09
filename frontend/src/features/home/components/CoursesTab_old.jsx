import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@common';
import {
  Filter,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  X,
  GraduationCap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common/ui/Select';
import { Separator } from '@common/ui/separator';
import { Skeleton } from '@common/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@common/ui/accordion';
import CourseCards from './CourseCards.jsx';

import {
  fetchCredentialHistory,
  selectCredentialHistory
} from '../redux/homeSlice.js';

export default function CoursesTab({ id, tabpanelProps = {} }) {
  const dispatch = useDispatch();
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const [filters, setFilters] = useState({
    platform: '',
    nsqfLevel: '',
    minHours: '',
    maxHours: ''
  });

  // Get credentials data from Redux store
  const credentialHistory = useSelector(selectCredentialHistory);

  // Fetch credentials on mount
  useEffect(() => {
    dispatch(fetchCredentialHistory());
  }, [dispatch]);

  // Filter courses from credentials
  const courses = useMemo(() => {
    const data = Array.isArray(credentialHistory.data) ? credentialHistory.data : [];
    // Filter for verified certificates and micro-credentials only
    return data.filter(
      c => c.verificationStatus === 'VERIFIED' &&
        (c.type === 'certificate' || c.type === 'micro_credential')
    );
  }, [credentialHistory.data]);

  const isLoading = credentialHistory.loading;

  // Extract unique platforms from courses
  const availablePlatforms = useMemo(() => {
    const platforms = new Set();
    courses.forEach(course => {
      // Try to extract platform from meta or issuer
      let platform = course.meta?.platform || course.issuer?.split(' - ')[0] || course.issuer?.split(' ')[0];

      // Handle case where platform is an object
      if (typeof platform === 'object' && platform !== null) {
        platform = platform.name || platform.id || platform.category || platform.title || 'Unknown Platform';
      }

      if (platform && typeof platform === 'string') {
        platforms.add(platform);
      }
    });
    return Array.from(platforms).sort();
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Search by title or issuer
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((course) =>
        (course.title || '').toLowerCase().includes(query) ||
        (course.issuer || '').toLowerCase().includes(query)
      );
    }

    // Filter by platform
    if (filters.platform) {
      result = result.filter(course => {
        const platform = course.meta?.platform || course.issuer?.split(' - ')[0] || course.issuer?.split(' ')[0];
        return platform && platform.toLowerCase() === filters.platform.toLowerCase();
      });
    }

    // Filter by NSQF level
    if (filters.nsqfLevel) {
      const level = parseInt(filters.nsqfLevel);
      result = result.filter(course => course.nsqfLevel === level);
    }

    // Filter by hours range
    if (filters.minHours || filters.maxHours) {
      result = result.filter(course => {
        if (!course.totalHours) return false;
        const hours = course.totalHours;
        const filterMin = filters.minHours ? parseInt(filters.minHours) : 0;
        const filterMax = filters.maxHours ? parseInt(filters.maxHours) : Infinity;
        return hours >= filterMin && hours <= filterMax;
      });
    }

    // Sort courses
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'hours-high':
          return (b.totalHours || 0) - (a.totalHours || 0);
        case 'hours-low':
          return (a.totalHours || 0) - (b.totalHours || 0);
        case 'nsqf-level':
          return (b.nsqfLevel || 0) - (a.nsqfLevel || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return result;
  }, [courses, searchQuery, filters, sortBy]);

  // Helper to count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.platform) count++;
    if (filters.nsqfLevel) count++;
    if (filters.minHours || filters.maxHours) count++;
    return count;
  }, [filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      platform: '',
      nsqfLevel: '',
      minHours: '',
      maxHours: ''
    });
    setSearchQuery('');
  };

  // Transform courses to Udemy-style card format
  const transformedCourses = useMemo(() => {
    return filteredCourses.map((course) => {
      // Calculate rating based on verification status and NSQF level
      const baseRating = 4.0;
      const nsqfBonus = course.nsqfLevel ? (course.nsqfLevel / 10) * 0.5 : 0;
      const rating = Math.min(5, baseRating + nsqfBonus).toFixed(1);

      // Generate ratings count (mock data based on course age)
      const courseAge = course.createdAt ? Math.floor((Date.now() - new Date(course.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1;
      const ratingsCount = Math.floor(Math.random() * 500 + 50) * Math.max(1, courseAge);

      // Determine badge
      let badge = null;
      if (course.nsqfLevel >= 8) {
        badge = 'Premium';
      } else if (course.nsqfLevel >= 6 || course.totalHours >= 40) {
        badge = 'Bestseller';
      }

      // Calculate price (mock pricing based on hours and NSQF level)
      const basePrice = 500;
      const hourMultiplier = course.totalHours ? Math.min(course.totalHours * 10, 200) : 0;
      const nsqfMultiplier = course.nsqfLevel ? course.nsqfLevel * 20 : 0;
      const currentPrice = Math.floor(basePrice + hourMultiplier + nsqfMultiplier);
      const originalPrice = Math.floor(currentPrice * 3.5);

      return {
        _id: course._id || course.id,
        title: typeof course.title === 'object' ? (course.title.name || course.title.id || 'Untitled Course') : (course.title || 'Untitled Course'),
        instructor: typeof course.issuer === 'object' ? (course.issuer.name || course.issuer.id || 'Instructor') : (course.issuer || 'Instructor'),
        rating: parseFloat(rating),
        ratings_count: ratingsCount.toLocaleString(),
        badge,
        price: `₹${currentPrice}`,
        original_price: `₹${originalPrice}`,
        image: course.file?.url || 'https://placehold.co/600x400/14b8a6/ffffff?text=Course+Image',
        // Keep original data for reference
        originalData: course
      };
    });
  }, [filteredCourses]);

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
                placeholder="Search by course title or issuer..."
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
                  <SelectItem value="hours-high">Longest Duration</SelectItem>
                  <SelectItem value="hours-low">Shortest Duration</SelectItem>
                  <SelectItem value="nsqf-level">NSQF Level (High to Low)</SelectItem>
                  <SelectItem value="title">Course Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        {typeof platform === 'string' ? platform : 'Unknown Platform'}
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
            Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> of{' '}
            <span className="font-medium text-foreground">{courses.length}</span> courses
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={`c-skel-${i}`} className="p-4 space-y-3">
              <Skeleton className="w-full aspect-[16/9] rounded-xl" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && filteredCourses.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-sm text-muted-foreground">No courses found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* Course Cards - Udemy Style */}
      {!isLoading && filteredCourses.length > 0 && (
        <CourseCards courses={transformedCourses} />
      )}
    </div>
  );
}
