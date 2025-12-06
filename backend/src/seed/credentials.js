import Credential from '../features/credential/credential.model.js';
import { SEED_IDS } from './users.js';

// Helper to generate past dates
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const monthsAgo = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
};

// Demo certificate image URL (consistent across all certificates for demo purposes)
const DEMO_CERT_IMAGE = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop';

// 5 Credentials for Priya Sharma (demo credentialist)
const credentials = [
  // VERIFIED #1 - Coursera Certificate
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    verificationStatus: 'VERIFIED',
    finalVerificationScore: 95,
    autoApproved: true,
    title: 'Machine Learning Specialization',
    issuer: 'Coursera - Stanford University',
    issueDate: monthsAgo(8),
    type: 'certificate',
    credentialId: 'COURSERA-ML-2024-PS123',
    totalHours: 120,
    skills: ['Machine Learning', 'Python', 'Neural Networks', 'TensorFlow', 'Supervised Learning'],
    description: 'Comprehensive machine learning specialization covering supervised learning, neural networks, and deep learning. Completed 3-course series with hands-on projects.',
    file: {
      url: DEMO_CERT_IMAGE,
      fileName: 'coursera-ml-certificate.jpg',
      fileType: 'image/jpeg',
      uploadedAt: monthsAgo(8),
    },
    sourceUrl: 'https://www.coursera.org/account/accomplishments/specialization/ABC123XYZ',
    sourceDomain: 'coursera.org',
    isDomainTrusted: true,
    isIssuerVerified: true,
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Certificate verified through Coursera official API. All metadata confirmed valid.',
    verifiedAt: daysAgo(5),
    meta: {
      platform: 'Coursera',
      verificationMethod: 'api_verified',
      courseCount: 3,
    },
    createdAt: monthsAgo(8),
    updatedAt: daysAgo(5)
  },
  // VERIFIED #2 - Degree Certificate
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    verificationStatus: 'VERIFIED',
    finalVerificationScore: 98,
    autoApproved: true,
    title: 'Bachelor of Technology - Computer Science',
    issuer: 'Indian Institute of Technology Delhi',
    issueDate: new Date('2019-06-15'),
    type: 'degree',
    credentialId: 'IIT-DEL-CS-2019-456',
    skills: ['Computer Science', 'Algorithms', 'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks'],
    description: 'Bachelor of Technology degree in Computer Science and Engineering from IIT Delhi. Graduated with honors.',
    file: {
      url: DEMO_CERT_IMAGE,
      fileName: 'btech-degree-iitdelhi.pdf',
      fileType: 'application/pdf',
      uploadedAt: monthsAgo(6),
    },
    sourceUrl: 'https://home.iitd.ac.in/verify/degree/2019CS456',
    sourceDomain: 'iitd.ac.in',
    isDomainTrusted: true,
    isIssuerVerified: true,
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Degree verified with IIT Delhi registrar office. Student ID and graduation year confirmed.',
    verifiedAt: daysAgo(10),
    meta: {
      graduationYear: 2019,
      cgpa: 8.5,
      honors: true,
      department: 'Computer Science and Engineering',
    },
    createdAt: monthsAgo(6),
    updatedAt: daysAgo(10)
  },
  // REJECTED - Name Mismatch
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya S.',
    nameMatchConfidence: 65,
    verificationStatus: 'REJECTED',
    finalVerificationScore: 52,
    autoApproved: false,
    title: 'Google Cloud Professional Developer',
    issuer: 'Google Cloud',
    issueDate: monthsAgo(3),
    type: 'certificate',
    credentialId: 'GCP-PD-2024-789',
    skills: ['Google Cloud', 'GCP', 'Kubernetes', 'Cloud Development'],
    description: 'Professional certification for developing applications on Google Cloud Platform.',
    file: {
      url: DEMO_CERT_IMAGE,
      fileName: 'gcp-developer-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: monthsAgo(3),
    },
    sourceUrl: 'https://cloud.google.com/certification/cloud-developer',
    sourceDomain: 'cloud.google.com',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'rejected',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Name on certificate does not match legal name. Certificate shows "Priya S." but legal name is "Priya Sharma". Unable to verify credential ID in Google Cloud records.',
    rejectionReason: 'Name mismatch and credential ID not found in issuer records',
    meta: {
      rejectedAt: daysAgo(3),
      nameIssue: true,
    },
    createdAt: monthsAgo(3),
    updatedAt: daysAgo(3)
  },
  // PENDING #1 - Under Manual Review
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    verificationStatus: 'REVIEW_REQUIRED',
    finalVerificationScore: 78,
    autoApproved: false,
    title: 'AWS Certified Developer - Associate',
    issuer: 'Amazon Web Services',
    issueDate: monthsAgo(2),
    type: 'certificate',
    credentialId: 'AWS-DEV-2024-321',
    totalHours: 40,
    skills: ['AWS', 'Lambda', 'DynamoDB', 'API Gateway', 'CloudFormation', 'S3'],
    description: 'AWS certification for developers building and maintaining applications on AWS platform. Covers core AWS services and best practices.',
    file: {
      url: DEMO_CERT_IMAGE,
      fileName: 'aws-developer-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: daysAgo(15),
    },
    sourceUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
    sourceDomain: 'aws.amazon.com',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'pending',
    verificationRequested: true,
    requestedAt: daysAgo(15),
    meta: {
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
      requiresManualReview: true,
      reviewReason: 'Domain trusted but credential ID verification pending',
    },
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15)
  },
  // PENDING #2 - Auto-approval threshold not met
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    verificationStatus: 'REVIEW_REQUIRED',
    finalVerificationScore: 82,
    autoApproved: false,
    title: 'Full Stack Web Development Bootcamp',
    issuer: 'Udemy',
    issueDate: monthsAgo(1),
    type: 'micro_credential',
    credentialId: 'UC-FULLSTACK-2024-654',
    totalHours: 80,
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'REST API'],
    description: 'Comprehensive full-stack development bootcamp covering MERN stack. Completed with 50+ hands-on projects and real-world applications.',
    file: {
      url: DEMO_CERT_IMAGE,
      fileName: 'udemy-fullstack-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: daysAgo(7),
    },
    sourceUrl: 'https://www.udemy.com/certificate/UC-FULLSTACK-2024-654/',
    sourceDomain: 'udemy.com',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'pending',
    verificationRequested: true,
    requestedAt: daysAgo(7),
    meta: {
      completionRate: 100,
      projectCount: 52,
      rating: 4.8,
    },
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7)
  },
];

const seedCredentials = async () => {
  const createdCredentials = await Credential.insertMany(credentials);
  console.log(`✅ Credentials created: ${createdCredentials.length} (for demo credentialist Priya)`);
  return createdCredentials;
};

export default seedCredentials;
