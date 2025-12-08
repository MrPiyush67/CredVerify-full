import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { Button, Card } from '@common';
import Loader from '@common/components/Loader.jsx';
import { fetchMyJobs, selectMyJobs, selectJobsLoading, selectJobsErrors } from '../redux/jobsSlice';
import JobsList from '../components/JobsList.jsx';

export default function JobsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myJobs = useSelector(selectMyJobs);
  const loading = useSelector(selectJobsLoading);
  const errors = useSelector(selectJobsErrors);

  useEffect(() => {
    dispatch(fetchMyJobs());
  }, [dispatch]);

  const handleRefresh = () => dispatch(fetchMyJobs());

  if (loading.myJobs && myJobs.length === 0) return <Loader type="list" fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My Job Postings</h1>
            <p className="text-muted-foreground">Manage your active job listings and view applicants.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
              disabled={loading.myJobs}
            >
              <RefreshCw className={`h-4 w-4 ${loading.myJobs ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/post-job')} className="gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Error State */}
      {errors.myJobs && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
        >
          {errors.myJobs}
        </motion.div>
      )}

      {/* Content */}
      {myJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <span className="text-3xl">💼</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first job posting to start receiving applications
          </p>
          <Button onClick={() => navigate('/post-job')} className="gap-2">
            <Plus className="h-4 w-4" />
            Post Your First Job
          </Button>
        </motion.div>
      ) : (
        <JobsList jobs={myJobs} />
      )}
    </div>
  );
}
