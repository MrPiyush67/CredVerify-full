import Job from './job.model.js';
import { createNotification } from '../notification/notification.service.js';
import User from '../user/user.model.js';
import Credential from '../credential/credential.model.js';

// Create a new job (employer)
export const createJob = async (employerId, jobData) => {
  const job = await Job.create({
    employer: employerId,
    ...jobData,
  });

  // Notify employer of successful job posting
  if (job.status === 'active') {
    await createNotification({
      user: employerId,
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

  return job.populate('employer', 'name email');
};

// Get all jobs created by a employer
export const getJobsByEmployer = async (employerId, status = null) => {
  const filter = { employer: employerId };
  if (status) {
    filter.status = status;
  }

  const jobs = await Job.find(filter)
    .populate('employer', 'name email')
    .sort({ createdAt: -1 });

  return jobs;
};

// Get single job by ID
export const getJobById = async (jobId) => {
  const job = await Job.findById(jobId)
    .populate('employer', 'name email')
    .populate('applicants.learner', 'name email avatar');

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
};

// Update a job (employer only)
export const updateJob = async (employerId, jobId, updates) => {
  const job = await Job.findOne({ _id: jobId, employer: employerId });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  Object.assign(job, updates);
  await job.save();

  return job;
};

// Delete a job (employer only)
export const deleteJob = async (employerId, jobId) => {
  const job = await Job.findOneAndDelete({ _id: jobId, employer: employerId });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  return job;
};

// Get all applicants for a job (employer only)
export const getApplicants = async (employerId, jobId) => {
  const job = await Job.findOne({ _id: jobId, employer: employerId }).populate({
    path: 'applicants.learner',
    select: 'name email avatar role',
  });

  if (!job) {
    throw new Error('Job not found or unauthorized');
  }

  return job.applicants;
};

// Get single applicant full details (employer only - bypasses privacy)
export const getApplicantDetails = async (employerId, jobId, applicantUserId) => {
  // Verify employer owns this job and applicant applied
  const job = await Job.findOne({
    _id: jobId,
    employer: employerId,
    'applicants.learner': applicantUserId,
  });

  if (!job) {
    throw new Error('Job not found, unauthorized, or applicant not found');
  }

  // Get full learner profile (even if private)
  const profile = await User.findById(applicantUserId).select('-passwordHash');

  // Get all verified credentials (public showcase)
  const verifiedCredentials = await Credential.find({
    learner: applicantUserId,
    status: 'verified',
    isPublic: true,
  }).select('title issuer credentialType issueDate credentialId skills');

  // Get application details
  const application = job.applicants.find(
    (app) => app.learner.toString() === applicantUserId.toString()
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

// Update applicant status (employer only)
export const updateApplicantStatus = async (employerId, jobId, applicantId, status) => {
  const job = await Job.findOne({ _id: jobId, employer: employerId });

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

  // Notify learner if status changed
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
      user: applicant.learner,
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
    .populate('employer', 'name email companyName')
    .sort({ createdAt: -1 });

  return jobs;
};

// Apply to a job (learner)
export const applyToJob = async (jobId, learnerId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== 'active') {
    throw new Error('Job is not accepting applications');
  }

  // Check if already applied
  const alreadyApplied = job.applicants.some(
    (app) => app.learner.toString() === learnerId.toString()
  );

  if (alreadyApplied) {
    throw new Error('You have already applied to this job');
  }

  job.applicants.push({
    learner: learnerId,
  });

  await job.save();

  // Populate job to get employer info
  await job.populate('employer', 'name email');

  // Notify learner of successful application
  await createNotification({
    user: learnerId,
    title: 'Application Submitted',
    message: `Your application for "${job.title}" has been submitted successfully.`,
    type: 'info',
    category: 'application',
    metadata: {
      jobId: job._id,
      jobTitle: job.title,
      employerName: job.employer.username,
    },
  });

  // Notify employer of new application
  await createNotification({
    user: job.employer._id,
    title: 'New Application Received',
    message: `Someone applied for "${job.title}" position.`,
    type: 'info',
    category: 'application',
    metadata: {
      jobId: job._id,
      jobTitle: job.title,
      applicantId: learnerId,
    },
  });

  return job;
};

// Get jobs a learner has applied to
export const getMyApplications = async (learnerId) => {
  const jobs = await Job.find({
    'applicants.learner': learnerId,
  })
    .populate('employer', 'name email')
    .sort({ 'applicants.appliedAt': -1 });

  // Transform to include application status
  const applications = jobs.map((job) => {
    const application = job.applicants.find(
      (app) => app.learner.toString() === learnerId.toString()
    );

    return {
      job: {
        _id: job._id,
        title: job.title,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        employer: job.employer,
      },
      applicationStatus: application.status,
      appliedAt: application.appliedAt,
    };
  });

  return applications;
};

// Get job statistics for employer dashboard
export const getJobStats = async (employerId) => {
  const jobs = await Job.find({ employer: employerId });

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
