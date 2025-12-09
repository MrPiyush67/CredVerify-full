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
      {isLoading && Array.from({ length: 6 }).map((_, i) => (
        <Card key={`c-skel-${i}`}>
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
          </CardContent>
        </Card>
      ))}

      {/* No Results */}
      {!isLoading && filteredCourses.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-sm text-muted-foreground">No courses found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* Course Cards */}
      {!isLoading && filteredCourses.map((course) => {
        const courseId = course._id || course.id;
        // const isExpanded = expandedCourseId === courseId;
        const platform = course.meta?.platform || course.issuer?.split(' - ')[0] || '';

        return (
          <Card key={courseId} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 flex-1 min-w-0">
                  <BookOpen className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate">{typeof course.title === 'object' ? (course.title.name || course.title.id || 'Untitled Course') : (course.title || 'Untitled Course')}</span>
                </CardTitle>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Badge variant="success" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Issuer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{typeof course.issuer === 'object' ? (course.issuer.name || course.issuer.id || 'Issuer Not Specified') : (course.issuer || 'Issuer Not Specified')}</span>
                </div>
                {platform && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {typeof platform === 'object' ? (platform.name || platform.id || 'Platform') : platform}
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Course Details */}
              <div className="flex items-center gap-2 flex-wrap">
                {course.totalHours && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.totalHours} hours
                  </Badge>
                )}
                {course.nsqfLevel && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    NSQF Level {course.nsqfLevel}
                  </Badge>
                )}
                {course.type && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {course.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              {/* Skills */}
              {course.skills && course.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {course.skills.slice(0, 5).map((skill, i) => {
                    const skillName = typeof skill === 'object' ? (skill.name || skill.id || 'Skill') : skill;
                    return (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skillName}
                      </Badge>
                    );
                  })}
                  {course.skills.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{course.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Description with Accordion */}
              {course.description && course.description.length > 150 ? (
                <Accordion type="single" collapsible>
                  <AccordionItem value="description" className="border-0">
                    <div className="text-sm text-muted-foreground">
                      {course.description.substring(0, 150)}...
                    </div>
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      Read full description
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {course.description}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : course.description ? (
                <p className="text-sm text-muted-foreground">{course.description}</p>
              ) : null}

              <Separator />

              {/* Meta Info */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {course.meta?.category && (
                    <Badge variant="secondary" className="text-xs">
                      {typeof course.meta.category === 'object'
                        ? (course.meta.category.name || course.meta.category.id || 'Category')
                        : course.meta.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {course.issueDate ? new Date(course.issueDate).toLocaleDateString('en-US', {
                      month: 'short',
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
  );
}
