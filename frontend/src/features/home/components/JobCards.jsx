import React from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Building2, ExternalLink, Bookmark, Calendar } from 'lucide-react';

const JobCard = ({ job }) => {
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'bg-green-100 text-green-700 border-green-200',
      'Part-time': 'bg-blue-100 text-blue-700 border-blue-200',
      'Contract': 'bg-purple-100 text-purple-700 border-purple-200',
      'Internship': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    // Remove HTML tags if present
    const cleanText = text.replace(/<[^>]*>/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group">
      {/* Header Section with Company Info */}
      <div className="p-5 bg-muted/30 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          {/* Company Icon & Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-gray-700 mt-1 line-clamp-1">
                {job.company}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Add bookmark functionality here
            }}
          >
            <Bookmark className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
          </button>
        </div>

        {/* Location & Type */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="line-clamp-1">{job.location}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border ${getJobTypeColor(job.type)}`}>
            <Briefcase className="h-3 w-3 mr-1" />
            {job.type}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Job Description */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {truncateText(job.description, 180)}
        </p>

        {/* Tags/Skills */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="text-xs text-gray-500 font-medium">
                +{job.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Section: Salary, Posted Date & Apply Button */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3">
            {/* Salary & Posted Date */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">{job.salary}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Posted {timeAgo(job.postedDate)}</span>
              </div>
            </div>

            {/* Apply Button */}
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 group/btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Apply</span>
              <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Source Badge */}
        {job.source && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400 font-medium">
              via {job.source}
            </span>
            {job.category && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                {job.category}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const JobCards = ({ jobs = [] }) => {
  // Default dummy data if no jobs provided
  const defaultJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Tech Innovations Pvt Ltd",
      location: "Bangalore, Karnataka",
      description: "We are seeking an experienced Senior Software Engineer to join our dynamic team. You'll work on cutting-edge technologies and contribute to building scalable applications.",
      salary: "₹15L - ₹25L",
      salaryMin: 1500000,
      salaryMax: 2500000,
      type: "Full-time",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      url: "#",
      source: "Adzuna",
      category: "IT/ITeS",
      tags: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "Analytics Solutions",
      location: "Mumbai, Maharashtra",
      description: "Join our data science team to analyze complex datasets and build predictive models. Experience with Python, machine learning, and statistical analysis required.",
      salary: "₹12L - ₹20L",
      salaryMin: 1200000,
      salaryMax: 2000000,
      type: "Full-time",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: "#",
      source: "Adzuna",
      category: "IT/ITeS",
      tags: ["Python", "Machine Learning", "SQL"]
    },
    {
      id: 3,
      title: "Marketing Manager",
      company: "Brand Builders Inc",
      location: "Delhi NCR",
      description: "Looking for a creative Marketing Manager to develop and execute marketing strategies. Lead our marketing team and drive brand growth.",
      salary: "₹10L - ₹18L",
      salaryMin: 1000000,
      salaryMax: 1800000,
      type: "Full-time",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      url: "#",
      source: "Adzuna",
      category: "Management",
      tags: ["Digital Marketing", "Brand Management", "Team Leadership"]
    },
    {
      id: 4,
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "Pune, Maharashtra",
      description: "Creative UI/UX Designer needed to design beautiful and intuitive user interfaces. Work with cross-functional teams to deliver exceptional user experiences.",
      salary: "₹8L - ₹15L",
      salaryMin: 800000,
      salaryMax: 1500000,
      type: "Full-time",
      postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: "#",
      source: "Adzuna",
      category: "Media & Entertainment",
      tags: ["Figma", "Adobe XD", "User Research"]
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : defaultJobs;

  if (displayJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No jobs available at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {displayJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default JobCards;
