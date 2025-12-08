import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, Avatar, AvatarImage, AvatarFallback, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@common';

import { Filter, GraduationCap, Building2, MapPin, Briefcase, Mail } from 'lucide-react';
import { Skeleton } from '@common/ui/skeleton';
import { Separator } from '@common/ui/separator';

import { Filter } from 'lucide-react';

import {
  fetchUsers,
  fetchAdmins,
  fetchEmployers,
  selectRoleData
} from '../redux/homeSlice.js';
import { selectUser } from '@features/auth/redux/authSlice.js';
import { useNavigate } from 'react-router-dom';

const emptyText = {
  user: 'No users found.',
  admin: 'No admins found.',
  employer: 'No employers found.',
};

export default function RoleTab({ role, id, tabpanelProps = {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skill: '',
    institution: '',
    company: '',
    department: '',
    companySize: ''
  });
  const [displayCount, setDisplayCount] = useState(20);

  // Get current user to check permissions
  const currentUser = useSelector(selectUser);
  const userRole = currentUser?.role || 'user';

  // Get data from Redux store based on role
  const users = useSelector((state) => selectRoleData(state, 'users'));
  const admins = useSelector((state) => selectRoleData(state, 'admins'));
  const employers = useSelector((state) => selectRoleData(state, 'employers'));



  // Fetch data on mount
  useEffect(() => {
    if (role === 'learner' || role === 'learners') {
      dispatch(fetchUsers());
    } else if (role === 'regulator' || role === 'regulators') {
      // Fetch regulators for all users (public profiles)
      dispatch(fetchAdmins());
    } else if (role === 'employer' || role === 'employers') {
      // Fetch employers for all users (public profiles)
      dispatch(fetchEmployers());
    }
  }, [dispatch, role]);

  // Get the appropriate data and loading state for the role
  const { items, isLoading } = useMemo(() => {
    const roleKey = role === 'learner' ? 'learners' : role === 'regulator' ? 'regulators' : role === 'employer' ? 'employers' : role;

    switch (roleKey) {
      case 'learners':
        return { items: Array.isArray(users?.data) ? users.data : [], isLoading: users?.loading || false };
      case 'regulators':
        return { items: Array.isArray(admins?.data) ? admins.data : [], isLoading: admins?.loading || false };
      case 'employers':
        return { items: Array.isArray(employers?.data) ? employers.data : [], isLoading: employers?.loading || false };
      default:
        return { items: [], isLoading: false };
    }
  }, [role, users, admins, employers]);

  // Filter items based on search query and filters
  const filteredItems = useMemo(() => {
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];

    return safeItems.filter((item) => {
      // Search by name
      const nameMatch = !searchQuery.trim() || (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Role-specific filters
      switch (role) {
        case 'learner': {
          const skillMatch = !filters.skill || (Array.isArray(item.skills) && item.skills.some(s => s.toLowerCase().includes(filters.skill.toLowerCase())));
          const institutionMatch = !filters.institution || (Array.isArray(item.education) && item.education.some(edu => (edu.institution || '').toLowerCase().includes(filters.institution.toLowerCase())));
          return nameMatch && skillMatch && institutionMatch;
        }
        case 'regulator': {
          const institutionMatch = !filters.institution || (item.institution || '').toLowerCase().includes(filters.institution.toLowerCase());
          const departmentMatch = !filters.department || (item.department || '').toLowerCase().includes(filters.department.toLowerCase());
          return nameMatch && institutionMatch && departmentMatch;
        }
        case 'employer': {
          const companyMatch = !filters.company || (item.companyName || '').toLowerCase().includes(filters.company.toLowerCase());

          // Normalize item companySize into defined buckets so comparisons are robust
          const normalizeSize = (size) => {
            if (!size) return '';
            const s = String(size).trim();
            // If already one of the expected buckets, return as-is
            const buckets = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
            if (buckets.includes(s)) return s;
            // Try to parse numeric or ranges
            // Replace any en/em dashes with hyphen
            const cleaned = s.replace(/[–—]/g, '-');
            // If formatted like "10-50"
            const rangeMatch = cleaned.match(/^(\d+)\s*-\s*(\d+)$/);
            if (rangeMatch) {
              const min = parseInt(rangeMatch[1], 10);
              const max = parseInt(rangeMatch[2], 10);
              if (min <= 10 && max <= 10) return '1-10';
              if (max <= 50) return '11-50';
              if (max <= 200) return '51-200';
              if (max <= 500) return '201-500';
              if (max <= 1000) return '501-1000';
              return '1000+';
            }
            // If single number
            const num = parseInt(cleaned, 10);
            if (!isNaN(num)) {
              if (num <= 10) return '1-10';
              if (num <= 50) return '11-50';
              if (num <= 200) return '51-200';
              if (num <= 500) return '201-500';
              if (num <= 1000) return '501-1000';
              return '1000+';
            }
            // Fallback for textual sizes
            const lower = cleaned.toLowerCase();
            if (lower.includes('micro') || lower.includes('small') || lower.includes('startup')) return '1-10';
            if (lower.includes('medium')) return '51-200';
            if (lower.includes('large') || lower.includes('enterprise')) return '1000+';
            return s; // return original if unknown
          };

          const selectedBucket = filters.companySize === 'all' || !filters.companySize ? '' : filters.companySize;
          const itemBucket = normalizeSize(item.companySize);
          const companySizeMatch = !selectedBucket || itemBucket === selectedBucket;

          return nameMatch && companyMatch && companySizeMatch;
        }
        default:
          return nameMatch;
      }
    });
  }, [items, searchQuery, filters, role]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Name Search - Always visible */}
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />

            {/* Role-specific filters */}
            {role === 'learner' && (
              <>
                <Input
                  placeholder="Filter by skill..."
                  value={filters.skill}
                  onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  placeholder="Filter by institution..."
                  value={filters.institution}
                  onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                  className="text-sm"
                />
              </>
            )}

            {role === 'regulator' && (
              <>
                <Input
                  placeholder="Filter by institution..."
                  value={filters.institution}
                  onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                  className="text-sm"
                />
                <Input
                  placeholder="Filter by department..."
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="text-sm"
                />
              </>
            )}

            {role === 'employer' && (
              <>
                <Input
                  placeholder="Filter by company..."
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="text-sm"
                />
                <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Company Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={`${role}-skel-${i}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}

        {!isLoading && filteredItems.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{emptyText[role] ?? 'No records found.'}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredItems.slice(0, displayCount).map((item) => {

          {/* Results */ }
          {
            isLoading && Array.from({ length: 6 }).map((_, i) => (
              <Card key={`${role}-skel-${i}`}>
                <CardContent>
                  <div className="h-5 w-2/3 bg-muted/50 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          }

          {
            !isLoading && filteredItems.length === 0 && (
              <Card className="col-span-full">
                <CardContent>
                  <p className="text-sm text-muted-foreground">{emptyText[role] ?? 'No records found.'}</p>
                </CardContent>
              </Card>
            )
          }

          {
            !isLoading && filteredItems.slice(0, displayCount).map((item) => {

              const key = item._id || item.id;
              const name = item.name || 'Unknown';
              const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              const onViewProfile = () => {
                // Navigate to profile page with userId and role as query params
                const routeRole = role === 'learner' ? 'learner' : role === 'regulator' ? 'regulator' : 'employer';
                navigate(`/profile?userId=${key}&role=${routeRole}`);
              };

              return (

                <Card key={key} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">

                        <Card key={key} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border/60">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-3">
                              <Avatar className="h-10 w-10">

                                {item.avatar ? (
                                  <AvatarImage
                                    src={item.avatar}
                                    alt={`${name} profile`}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {initials}
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold truncate">{name}</CardTitle>

                                <div className="flex-1">
                                  <div className="font-medium">{name}</div>

                                  {item.verified !== undefined && (
                                    <Badge
                                      variant={item.verified ? "success" : "warning"}
                                      className="text-xs mt-1"
                                    >
                                      {item.verified ? "Verified" : "Pending"}
                                    </Badge>
                                  )}
                                </div>

                              </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            {role === 'learner' && (
                              <div className="space-y-3 flex-1">

                              </CardTitle>
            </CardHeader>
                          <CardContent>
                            {role === 'learner' && (
                              <div className="space-y-2">

                                {/* Bio */}
                                {item.bio && (
                                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    "{item.bio}"
                                  </p>
                                )}


                                <Separator />

                                {/* Education - Show latest */}
                                {item.education && item.education.length > 0 && (
                                  <div className="flex items-start gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground text-xs">
                                      {item.education[0].degree} at {item.education[0].institution}
                                    </span>
                                  </div>
                                )}


                                {/* Education - Show latest */}
                                {item.education && item.education.length > 0 && (
                                  <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">🎓 </span>
                                    <span className="text-muted-foreground">
                                      {item.education[0].degree} - {item.education[0].institution}
                                    </span>
                                  </div>
                                )}

                                {/* Skills */}
                                {item.skills && item.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.skills.slice(0, 3).map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {item.skills.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{item.skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}


                                {/* Email */}
                                {item.email && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{item.email}</span>
                                  </div>
                                )}

                                <p className="text-sm text-muted-foreground">
                                  {item.email || 'No email provided'}
                                </p>

                              </div>
                            )}

                            {role === 'regulator' && (

                              <div className="space-y-3 flex-1">
                                {/* Bio */}
                                {item.bio && (
                                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    "{item.bio}"
                                  </p>
                                )}

                                <Separator />

                                {/* Institution */}
                                {item.institution && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground text-xs">{item.institution}</span>
                                  </div>
                                )}

                                {item.department && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <GraduationCap className="h-3 w-3 shrink-0" />
                                    <span>Department: {item.department}</span>
                                  </div>
                                )}

                                {/* Skills */}
                                {item.skills && item.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1">

                                    <div className="space-y-1">
                                      {/* Bio */}
                                      {item.bio && (
                                        <p className="text-xs text-muted-foreground italic line-clamp-2 mb-2">
                                          "{item.bio}"
                                        </p>
                                      )}
                                      {/* Institution */}
                                      {item.institution && (
                                        <p className="text-sm font-medium text-muted-foreground">
                                          🏛️ {item.institution}
                                        </p>
                                      )}
                                      {item.department && (
                                        <p className="text-xs text-muted-foreground">
                                          📚 Department: {item.department}
                                        </p>
                                      )}
                                      {/* Skills */}
                                      {item.skills && item.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">

                                          {item.skills.slice(0, 3).map((skill, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                          {item.skills.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{item.skills.length - 3} more
                                            </Badge>
                                          )}
                                        </div>
                                      )}


                                      {/* Email */}
                                      {item.email && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Mail className="h-3 w-3" />
                                          <span className="truncate">{item.email}</span>
                                        </div>
                                      )}

                                      {/* Stats */}

                                      <p className="text-xs text-muted-foreground">
                                        {item.email || 'No email provided'}
                                      </p>

                                      {(item.verifiedCount > 0 || item.rejectedCount > 0) && (
                                        <div className="flex gap-2 mt-2">
                                          <Badge variant="success" className="text-xs">
                                            ✓ {item.verifiedCount || 0} verified
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            ✗ {item.rejectedCount || 0} rejected
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
              )}

                                    {role === 'employer' && (

                                      <div className="space-y-3 flex-1">
                                        {/* Bio */}
                                        {item.bio && (
                                          <p className="text-xs text-muted-foreground italic line-clamp-2">
                                            "{item.bio}"
                                          </p>
                                        )}

                                        <Separator />

                                        {/* Company Name */}
                                        {item.companyName && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="font-medium text-muted-foreground text-xs">{item.companyName}</span>
                                          </div>
                                        )}

                                        {/* Industry & Company Size */}
                                        <div className="flex flex-wrap gap-2 items-center">
                                          {item.industry && (
                                            <Badge variant="outline" className="text-xs">
                                              {item.industry}
                                            </Badge>
                                          )}
                                          {item.companySize && (
                                            <Badge variant="secondary" className="text-xs">
                                              {item.companySize} employees
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Skills */}
                                        {item.skills && item.skills.length > 0 && (
                                          <div className="flex flex-wrap gap-1">

                                            <div className="space-y-1">
                                              {/* Bio */}
                                              {item.bio && (
                                                <p className="text-xs text-muted-foreground italic line-clamp-2 mb-2">
                                                  "{item.bio}"
                                                </p>
                                              )}
                                              {/* Company Name */}
                                              <p className="text-sm font-medium text-muted-foreground">
                                                🏢 {item.companyName || 'No company'}
                                              </p>
                                              {/* Industry & Company Size */}
                                              <div className="flex flex-wrap gap-2 items-center">
                                                {item.industry && (
                                                  <p className="text-xs text-muted-foreground">
                                                    🏭 {item.industry}
                                                  </p>
                                                )}
                                                {item.companySize && (
                                                  <Badge variant="outline" className="text-xs">
                                                    {item.companySize}
                                                  </Badge>
                                                )}
                                              </div>
                                              {/* Skills */}
                                              {item.skills && item.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">

                                                  {item.skills.slice(0, 3).map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                      {skill}
                                                    </Badge>
                                                  ))}
                                                  {item.skills.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                      +{item.skills.length - 3} more
                                                    </Badge>
                                                  )}
                                                </div>
                                              )}


                                              {/* Experience - Show latest */}
                                              {item.experience && item.experience.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <Briefcase className="h-3 w-3 shrink-0" />
                                                  <span>{item.experience[0].position} at {item.experience[0].company}</span>
                                                </div>
                                              )}

                                              {/* Location */}
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                <span>
                                                  {(() => {
                                                    const loc = item.companyLocation || item.location || item.city;
                                                    if (typeof loc === 'object' && loc) {
                                                      return `${loc.city || ''}${loc.state ? ', ' + loc.state : ''}${loc.country ? ', ' + loc.country : ''}`.trim().replace(/^,|,$/, '') || 'Location not specified';
                                                    }
                                                    return loc || 'Location not specified';
                                                  })()}
                                                </span>
                                              </div>
                                            </div>
              )}

                                            <Separator className="my-3" />

                                            <div className="flex justify-end">
                                              <Button
                                                onClick={onViewProfile}
                                                size="sm"
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                View Profile
                                              </Button>

                                              {/* Experience - Show latest */}
                                              {item.experience && item.experience.length > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                  💼 {item.experience[0].position} at {item.experience[0].company}
                                                </p>
                                              )}
                                              {/* Location */}
                                              <p className="text-xs text-muted-foreground">
                                                📍 {(() => {
                                                  const loc = item.companyLocation || item.location || item.city;
                                                  if (typeof loc === 'object' && loc) {
                                                    return `${loc.city || ''}${loc.state ? ', ' + loc.state : ''}${loc.country ? ', ' + loc.country : ''}`.trim().replace(/^,|,$/, '') || 'Location not specified';
                                                  }
                                                  return loc || 'Location not specified';
                                                })()}
                                              </p>
                                            </div>
              )}
                                            <div className="mt-4 flex justify-end">
                                              <button
                                                type="button"
                                                onClick={onViewProfile}
                                                className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:opacity-95 focus:outline-none"
                                              >
                                                View Profile
                                              </button>

                                            </div>
                                          </CardContent>
          </Card>
                                    );
      })}

                                  </div>


      

      {/* Load More Button */}
                                {!isLoading && filteredItems.length > displayCount && (
                                  <div className="flex justify-center pt-4">
                                    <Button
                                      onClick={() => setDisplayCount(prev => prev + 20)}
                                      variant="outline"
                                      className="gap-2"
                                    >
                                      Load More ({filteredItems.length - displayCount} remaining)
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
}
