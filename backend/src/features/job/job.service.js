import Job from './job.model.js';
import { createNotification } from '../notification/notification.service.js';
import User from '../user/user.model.js';
import Credential from '../credential/credential.model.js';

// Create a new job (curator)
export const createJob = async (curatorId, jobData) => {
  const job = await Job.create({
    curator: curatorId,
    ...jobData,
  });

  // Notify curator of successful job posting
  if (job.status === 'active') {
    await createNotification({
      user: curatorId,
      title: 'Job Posted Successfully',
      message: `Your job "${job.title}" is now live and accepting applications.`,
      type: 'success',
      category: 'job',
      metadata: {
        jobId: job._id,
        jobTitle: job.title,
        status: job.status,
      },
    });
  }

  return job.populate('curator', 'name email');
};

// Get all jobs created by a curator
export const getJobsByCurator = async (curatorId, status = null) => {
  const filter = { curator: curatorId };
  if (status) {
    filter.status = status;
  }

  const jobs = await Job.find(filter)
    .populate('curator', 'name email')
    .sort({ createdAt: -1 });

  return jobs;
};

// Get single job by ID
export const getJobById = async (jobId) => {
  const job = await Job.findById(jobId)
    .populate('curator', 'name email')
    .populate('applicants.credentialist', 'name email avatar');

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
};

// Update a job (curator only)
export const updateJob = async (curatorId, jobId, updates) => {
  const job = await Job.findOne({ _id: jobId, curator: curatorId });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  Object.assign(job, updates);
  await job.save();

  return job;
};

// Delete a job (curator only)
export const deleteJob = async (curatorId, jobId) => {
  const job = await Job.findOneAndDelete({ _id: jobId, curator: curatorId });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  return job;
};

// Get all applicants for a job (curator only)
export const getApplicants = async (curatorId, jobId) => {
  const job = await Job.findOne({ _id: jobId, curator: curatorId }).populate({
    path: 'applicants.credentialist',
    select: 'name email avatar role',
  });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  return job.applicants;
};

// Get single applicant full details (curator only - bypasses privacy)
export const getApplicantDetails = async (curatorId, jobId, applicantUserId) => {
  // Verify curator owns this job and applicant applied
  const job = await Job.findOne({
    _id: jobId,
    curator: curatorId,
    'applicants.credentialist': applicantUserId,
  });

  if (!job) {
    throw new Error('Job not found, unauthorized, or applicant not found');
  }

  // Get full credentialist profile (even if private)
  const profile = await User.findById(applicantUserId).select('-passwordHash');

  // Get all verified credentials (public showcase)
  const verifiedCredentials = await Credential.find({
    credentialist: applicantUserId,
    status: 'verified',
    isPublic: true,
  }).select('title issuer credentialType issueDate credentialId skills');

  // Get application details
  const application = job.applicants.find(
    (app) => app.credentialist.toString() === applicantUserId.toString()
  );

  return {
    profile,
    verifiedCredentials,
    application: {
      appliedAt: application.appliedAt,
      status: application.status,
      _id: application._id,
    },
  };
};

// Update applicant status (curator only)
export const updateApplicantStatus = async (curatorId, jobId, applicantId, status) => {
  const job = await Job.findOne({ _id: jobId, curator: curatorId });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  const applicant = job.applicants.id(applicantId);

  if (!applicant) {
    throw new Error('Applicant not found');
  }

  const oldStatus = applicant.status;
  applicant.status = status;
  await job.save();

  // Notify credentialist if status changed
  if (oldStatus !== status) {
    let notificationTitle = 'Application Status Update';
    let notificationMessage = `Your application for "${job.title}" status: ${status}`;
    let notificationType = 'info';

    if (status === 'shortlisted') {
      notificationTitle = '🎉 You\'re Shortlisted!';
      notificationMessage = `Congratulations! You've been shortlisted for "${job.title}"!`;
      notificationType = 'success';
    } else if (status === 'rejected') {
      notificationTitle = 'Application Status Update';
      notificationMessage = `Your application for "${job.title}" was not selected this time.`;
      notificationType = 'warning';
    } else if (status === 'reviewed') {
      notificationTitle = 'Application Reviewed';
      notificationMessage = `Your application for "${job.title}" has been reviewed.`;
    }

    await createNotification({
      user: applicant.credentialist,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      category: 'application',
      metadata: {
        jobId: job._id,
        jobTitle: job.title,
        applicationStatus: status,
      },
    });
  }

  return job;
};

// Get all active jobs (public/browse)
export const getAllJobs = async (filters = {}) => {
  const query = { status: 'active' };

  // Optional filters
  if (filters.jobType) {
    query.jobType = filters.jobType;
  }
  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  const jobs = await Job.find(query)
    .populate('curator', 'name email companyName')
    .sort({ createdAt: -1 });

  return jobs;
};

// Apply to a job (credentialist)
export const applyToJob = async (jobId, credentialistId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== 'active') {
    throw new Error('Job is not accepting applications');
  }

  // Check if already applied
  const alreadyApplied = job.applicants.some(
    (app) => app.credentialist.toString() === credentialistId.toString()
  );

  if (alreadyApplied) {
    throw new Error('You have already applied to this job');
  }

  job.applicants.push({
    credentialist: credentialistId,
  });

  await job.save();

  // Populate job to get curator info
  await job.populate('curator', 'name email');

  // Notify credentialist of successful application
  await createNotification({
    user: credentialistId,
    title: 'Application Submitted',
    message: `Your application for "${job.title}" has been submitted successfully.`,
    type: 'info',
    category: 'application',
    metadata: {
      jobId: job._id,
      jobTitle: job.title,
      curatorName: job.curator.name,
    },
  });

  // Notify curator of new application
  await createNotification({
    user: job.curator._id,
    title: 'New Application Received',
    message: `Someone applied for "${job.title}" position.`,
    type: 'info',
    category: 'application',
    metadata: {
      jobId: job._id,
      jobTitle: job.title,
      applicantId: credentialistId,
    },
  });

  return job;
};

// Get jobs a credentialist has applied to
export const getMyApplications = async (credentialistId) => {
  const jobs = await Job.find({
    'applicants.credentialist': credentialistId,
  })
    .populate('curator', 'name email')
    .sort({ 'applicants.appliedAt': -1 });

  // Transform to include application status
  const applications = jobs.map((job) => {
    const application = job.applicants.find(
      (app) => app.credentialist.toString() === credentialistId.toString()
    );

    return {
      job: {
        _id: job._id,
        title: job.title,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        curator: job.curator,
      },
      applicationStatus: application.status,
      appliedAt: application.appliedAt,
    };
  });

  return applications;
};

// Get job statistics for curator dashboard
export const getJobStats = async (curatorId) => {
  const jobs = await Job.find({ curator: curatorId });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const closedJobs = jobs.filter((j) => j.status === 'closed').length;
  const draftJobs = jobs.filter((j) => j.status === 'draft').length;

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
  const pendingApplicants = jobs.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === 'pending').length,
    0
  );
  const shortlistedApplicants = jobs.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === 'shortlisted').length,
    0
  );

  return {
    totalJobs,
    activeJobs,
    closedJobs,
    draftJobs,
    totalApplicants,
    pendingApplicants,
    shortlistedApplicants,
  };
};
