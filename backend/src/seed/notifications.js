import Notification from '../features-old/notification/notification.model.js';
import { SEED_IDS } from './users.js';

// Helper to generate past dates
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursAgo = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// Notifications for demo users based on their activities
const notifications = [
  // ========== Priya's Notifications (learner1) ==========
  {
    user: SEED_IDS.learner1,
    title: 'Credential Verified',
    message:
      'Your Machine Learning Specialization certificate has been verified by Dr. Kavita Rao.',
    type: 'success',
    category: 'verification',
    read: true,
    metadata: {
      credentialTitle: 'Machine Learning Specialization',
      verifiedBy: 'Dr. Kavita Rao',
    },
    createdAt: daysAgo(10),
  },
  {
    user: SEED_IDS.learner1,
    title: 'Credential Verified',
    message:
      'Your Bachelor of Technology - Computer Science degree has been verified by Dr. Kavita Rao.',
    type: 'success',
    category: 'verification',
    read: true,
    metadata: {
      credentialTitle: 'Bachelor of Technology - Computer Science',
      verifiedBy: 'Dr. Kavita Rao',
    },
    createdAt: daysAgo(7),
  },
  {
    user: SEED_IDS.learner1,
    title: 'Credential Rejected',
    message:
      'Your Google Cloud Professional Developer certificate was rejected. Please check the verification notes and resubmit.',
    type: 'error',
    category: 'verification',
    read: true,
    metadata: {
      credentialTitle: 'Google Cloud Professional Developer',
      rejectedBy: 'Dr. Kavita Rao',
      reason:
        'Name on certificate does not match legal name. Credential ID not found in issuer records.',
    },
    createdAt: daysAgo(3),
  },
  {
    user: SEED_IDS.learner1,
    title: 'New Message',
    message:
      'Dr. Kavita Rao sent you a message about your credential verification.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Dr. Kavita Rao',
    },
    createdAt: daysAgo(4),
  },
  {
    user: SEED_IDS.learner1,
    title: 'New Message',
    message:
      'Meera Krishnan sent you a message about the Senior Full Stack Developer position.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Meera Krishnan',
    },
    createdAt: daysAgo(5),
  },
  {
    user: SEED_IDS.learner1,
    title: 'Interview Scheduled',
    message:
      'Your interview for Senior Full Stack Developer at StartupX Technologies is scheduled for Thursday at 3 PM.',
    type: 'success',
    category: 'job',
    read: false,
    metadata: {
      jobTitle: 'Senior Full Stack Developer',
      company: 'StartupX Technologies',
      interviewDate: 'Thursday at 3 PM',
    },
    createdAt: daysAgo(5),
  },
  {
    user: SEED_IDS.learner1,
    title: 'Credential Pending Review',
    message:
      'Your MongoDB Certified Developer certificate is pending verification.',
    type: 'info',
    category: 'verification',
    read: false,
    metadata: {
      credentialTitle: 'MongoDB Certified Developer',
    },
    createdAt: daysAgo(15),
  },
  {
    user: SEED_IDS.learner1,
    title: 'Credential Pending Review',
    message: 'Your React Professional Certificate is pending verification.',
    type: 'info',
    category: 'verification',
    read: false,
    metadata: {
      credentialTitle: 'React Professional Certificate',
    },
    createdAt: daysAgo(7),
  },

  // ========== Dr. Kavita's Notifications (regulator1) ==========
  {
    user: SEED_IDS.regulator1,
    title: 'New Verification Request',
    message:
      'Priya Sharma submitted AWS Certified Solutions Architect certificate for verification.',
    type: 'info',
    category: 'verification',
    read: true,
    metadata: {
      learnerName: 'Priya Sharma',
      credentialTitle: 'AWS Certified Solutions Architect - Associate',
    },
    createdAt: daysAgo(12),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'Verification Completed',
    message:
      'You successfully verified the AWS Certified Solutions Architect certificate for Priya Sharma.',
    type: 'success',
    category: 'verification',
    read: true,
    metadata: {
      learnerName: 'Priya Sharma',
      credentialTitle: 'AWS Certified Solutions Architect - Associate',
    },
    createdAt: daysAgo(10),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'New Verification Request',
    message:
      'Priya Sharma submitted Bachelor of Technology - Computer Science degree for verification.',
    type: 'info',
    category: 'verification',
    read: true,
    metadata: {
      learnerName: 'Priya Sharma',
      credentialTitle: 'Bachelor of Technology - Computer Science',
    },
    createdAt: daysAgo(9),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'Verification Completed',
    message:
      'You successfully verified the Bachelor of Technology degree for Priya Sharma.',
    type: 'success',
    category: 'verification',
    read: true,
    metadata: {
      learnerName: 'Priya Sharma',
      credentialTitle: 'Bachelor of Technology - Computer Science',
    },
    createdAt: daysAgo(7),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'Credential Rejected',
    message:
      'You rejected the Google Cloud Professional Developer certificate for Priya Sharma.',
    type: 'warning',
    category: 'verification',
    read: true,
    metadata: {
      learnerName: 'Priya Sharma',
      credentialTitle: 'Google Cloud Professional Developer',
    },
    createdAt: daysAgo(3),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'New Message',
    message: 'Priya Sharma sent you a message about credential verification.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Priya Sharma',
    },
    createdAt: daysAgo(11),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'New Message',
    message:
      'Meera Krishnan sent you a message about credential verification partnership.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Meera Krishnan',
    },
    createdAt: daysAgo(9),
  },
  {
    user: SEED_IDS.regulator1,
    title: 'Verification Statistics',
    message:
      'You have verified 2 credentials and rejected 1 credential this month.',
    type: 'info',
    category: 'system',
    read: false,
    metadata: {
      verifiedCount: 2,
      rejectedCount: 1,
    },
    createdAt: hoursAgo(24),
  },

  // ========== Meera's Notifications (employer1) ==========
  {
    user: SEED_IDS.employer1,
    title: 'Job Posted Successfully',
    message:
      'Your job posting "Senior Full Stack Developer" has been published.',
    type: 'success',
    category: 'job',
    read: true,
    metadata: {
      jobTitle: 'Senior Full Stack Developer',
    },
    createdAt: daysAgo(20),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Job Posted Successfully',
    message: 'Your job posting "UI/UX Designer" has been published.',
    type: 'success',
    category: 'job',
    read: true,
    metadata: {
      jobTitle: 'UI/UX Designer',
    },
    createdAt: daysAgo(18),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Job Posted Successfully',
    message: 'Your job posting "DevOps Engineer" has been published.',
    type: 'success',
    category: 'job',
    read: true,
    metadata: {
      jobTitle: 'DevOps Engineer',
    },
    createdAt: daysAgo(15),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Job Posted Successfully',
    message: 'Your job posting "Product Manager" has been published.',
    type: 'success',
    category: 'job',
    read: true,
    metadata: {
      jobTitle: 'Product Manager',
    },
    createdAt: daysAgo(12),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Job Posted Successfully',
    message: 'Your job posting "Frontend Developer Intern" has been published.',
    type: 'success',
    category: 'job',
    read: true,
    metadata: {
      jobTitle: 'Frontend Developer Intern',
    },
    createdAt: daysAgo(8),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Candidate Interest',
    message:
      'Priya Sharma expressed interest in the Senior Full Stack Developer position.',
    type: 'info',
    category: 'application',
    read: true,
    metadata: {
      candidateName: 'Priya Sharma',
      jobTitle: 'Senior Full Stack Developer',
    },
    createdAt: daysAgo(8),
  },
  {
    user: SEED_IDS.employer1,
    title: 'New Message',
    message:
      'Priya Sharma sent you a message about the Senior Full Stack Developer position.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Priya Sharma',
    },
    createdAt: daysAgo(8),
  },
  {
    user: SEED_IDS.employer1,
    title: 'New Message',
    message:
      'Dr. Kavita Rao sent you a message about credential verification services.',
    type: 'info',
    category: 'message',
    read: true,
    metadata: {
      senderName: 'Dr. Kavita Rao',
    },
    createdAt: daysAgo(10),
  },
  {
    user: SEED_IDS.employer1,
    title: 'Partnership Opportunity',
    message:
      'Dr. Kavita Rao proposed a collaboration for priority credential verification.',
    type: 'info',
    category: 'system',
    read: false,
    metadata: {
      proposedBy: 'Dr. Kavita Rao',
    },
    createdAt: daysAgo(3),
  },
];

const seedNotifications = async () => {
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`✅ Notifications created: ${createdNotifications.length}`);

  // Count per user
  const priyaNotifs = notifications.filter(
    (n) => n.user === SEED_IDS.learner1,
  ).length;
  const kavitaNotifs = notifications.filter(
    (n) => n.user === SEED_IDS.regulator1,
  ).length;
  const meeraNotifs = notifications.filter(
    (n) => n.user === SEED_IDS.employer1,
  ).length;

  console.log(`   - Priya (learner): ${priyaNotifs} notifications`);
  console.log(`   - Dr. Kavita (regulator): ${kavitaNotifs} notifications`);
  console.log(`   - Meera (employer): ${meeraNotifs} notifications`);

  return createdNotifications;
};

export default seedNotifications;
