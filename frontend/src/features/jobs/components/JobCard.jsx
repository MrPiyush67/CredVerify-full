import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Edit, Trash2, Eye, MoreVertical, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@common/ui/Card.jsx';
import { Badge } from '@common/ui/Badge.jsx';
import { Button } from '@common/ui/Button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@common/ui/DropdownMenu.jsx';
import { deleteJob, updateJobStatus, fetchJobApplicants } from '../redux/jobsSlice';
import ApplicantsModal from './ApplicantsModal.jsx';

export default function JobCard({ job }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showApplicants, setShowApplicants] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await dispatch(deleteJob(job._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await dispatch(updateJobStatus({ id: job._id, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleViewApplicants = async () => {
    await dispatch(fetchJobApplicants(job._id));
    setShowApplicants(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-1">{job.title}</h3>
              <Badge className={`mt-2 ${getStatusColor(job.status)}`}>
                {job.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/post-job/${job._id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStatusToggle}>
                  <Eye className="h-4 w-4 mr-2" />
                  {job.status === 'active' ? 'Close' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{job.jobType || job.employmentType || 'Full-time'}</span>
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleViewApplicants}
              variant="outline"
              className="w-full gap-2"
            >
              <Users className="h-4 w-4" />
              View Applicants ({job.applicants?.length || 0})
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {showApplicants && (
        <ApplicantsModal
          jobId={job._id}
          jobTitle={job.title}
          onClose={() => setShowApplicants(false)}
        />
      )}
    </>
  );
}
