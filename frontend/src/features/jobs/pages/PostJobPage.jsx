import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@common';
import Loader from '@common/components/Loader.jsx';
import PageHeader from '@common/components/PageHeader.jsx';
import { createJob, updateJob, selectJobsLoading, selectJobsErrors, clearErrors, selectMyJobs } from '../redux/jobsSlice';
import { getJob } from '../api/jobsApi';
import JobForm from '../components/JobForm.jsx';
import AiChatWrapper from '@features/ai-chat/components/AiChatWrapper.jsx';

export default function PostJobPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const loading = useSelector(selectJobsLoading);
  const errors = useSelector(selectJobsErrors);
  const myJobs = useSelector(selectMyJobs);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    applicationDeadline: '',
    status: 'draft'
  });
  const [isLoadingJob, setIsLoadingJob] = useState(false);

  useEffect(() => {
    // Clear errors on mount
    dispatch(clearErrors());

    // Load existing job if editing
    if (id) {
      const loadJob = async () => {
        setIsLoadingJob(true);
        try {
          // First check in myJobs (already loaded)
          const existingJob = myJobs.find(job => job._id === id);
          if (existingJob) {
            setFormData({
              title: existingJob.title || '',
              description: existingJob.description || '',
              requirements: existingJob.requirements || '',
              skills: Array.isArray(existingJob.skills) ? existingJob.skills.join(', ') : '',
              jobType: existingJob.jobType || 'full-time',
              experienceLevel: existingJob.experienceLevel || 'mid',
              location: existingJob.location || '',
              salaryMin: existingJob.salary?.min || existingJob.salaryMin || '',
              salaryMax: existingJob.salary?.max || existingJob.salaryMax || '',
              currency: existingJob.salary?.currency || existingJob.currency || 'INR',
              applicationDeadline: existingJob.applicationDeadline ? new Date(existingJob.applicationDeadline).toISOString().split('T')[0] : '',
              status: existingJob.status || 'draft'
            });
          } else {
            // Fetch from API if not in myJobs
            const response = await getJob(id);
            const job = response.data;
            setFormData({
              title: job.title || '',
              description: job.description || '',
              requirements: job.requirements || '',
              skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
              jobType: job.jobType || 'full-time',
              experienceLevel: job.experienceLevel || 'mid',
              location: job.location || '',
              salaryMin: job.salary?.min || job.salaryMin || '',
              salaryMax: job.salary?.max || job.salaryMax || '',
              currency: job.salary?.currency || job.currency || 'INR',
              applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
              status: job.status || 'draft'
            });
          }
        } catch (error) {
          console.error('Failed to load job:', error);
        } finally {
          setIsLoadingJob(false);
        }
      };
      loadJob();
    }
  }, [dispatch, id, myJobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (status = 'active') => {
    const jobData = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements ? formData.requirements.split('\n').filter(Boolean) : [],
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      location: formData.location,
      salary: {
        min: Number(formData.salaryMin) || undefined,
        max: Number(formData.salaryMax) || undefined,
        currency: formData.currency || 'INR',
      },
      applicationDeadline: formData.applicationDeadline,
      status
    };

    try {
      if (id) {
        await dispatch(updateJob({ id, data: jobData })).unwrap();
      } else {
        await dispatch(createJob(jobData)).unwrap();
      }
      navigate('/jobs');
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  if (isLoadingJob) return <Loader type="page" />;

  return (
    <div className="space-y-6 max-w-7xl px-6 mx-auto">
      {/* Header */}
      <PageHeader
        title={id ? 'Edit Job Posting' : 'Create New Job Posting'}
        description={id ? 'Update your job listing details.' : 'Create a new job listing to find the perfect candidate.'}
      />

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <JobForm
            formData={formData}
            onChange={handleChange}
            handleSubmit={handleSubmit}
            loading={loading}
            errors={errors}
            isEdit={!!id}
          />
        </CardContent>
      </Card>

      <AiChatWrapper />
    </div>
  );
}
