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

// 5 Credentials for Priya Sharma (demo credentialist)
const credentials = [
  // VERIFIED #1
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    issueDate: monthsAgo(8),
    type: 'certificate',
    credentialId: 'AWS-CSA-2024-PS123',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'Lambda'],
    description: 'Professional certification demonstrating expertise in designing distributed systems on AWS.',
    file: {
      url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      fileName: 'aws-solutions-architect.pdf',
      fileType: 'application/pdf',
      uploadedAt: monthsAgo(8),
    },
    sourceUrl: 'https://aws.amazon.com/certification/',
    sourceDomain: 'aws.amazon.com',
    isDomainTrusted: true,
    isIssuerVerified: true,
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Certificate verified through AWS official portal. Credential ID confirmed valid.',
    verifiedAt: daysAgo(5),
    meta: {
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      verificationMethod: 'official_portal',
    },
    createdAt: monthsAgo(8),
    updatedAt: daysAgo(5)
  },
  // VERIFIED #2
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    title: 'Bachelor of Technology - Computer Science',
    issuer: 'Indian Institute of Technology Delhi',
    issueDate: new Date('2019-06-15'),
    type: 'degree',
    credentialId: 'IIT-DEL-CS-2019-PS456',
    skills: ['Computer Science', 'Algorithms', 'Data Structures', 'DBMS'],
    description: 'Bachelor of Technology degree in Computer Science and Engineering from IIT Delhi.',
    file: {
      url: 'https://via.placeholder.com/800x600/34A853/FFFFFF?text=IIT+Delhi+B.Tech+Degree',
      fileName: 'btech-degree-iitdelhi.pdf',
      fileType: 'application/pdf',
      uploadedAt: monthsAgo(6),
    },
    sourceUrl: 'https://home.iitd.ac.in/',
    sourceDomain: 'iitd.ac.in',
    isDomainTrusted: true,
    isIssuerVerified: true,
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Degree verified with IIT Delhi records. Student ID and graduation year confirmed.',
    verifiedAt: daysAgo(10),
    meta: {
      graduationYear: 2019,
      cgpa: 8.5,
    },
    createdAt: monthsAgo(6),
    updatedAt: daysAgo(10)
  },
  // REJECTED
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya S.',
    nameMatchConfidence: 75,
    title: 'Google Cloud Professional Developer',
    issuer: 'Google Cloud',
    issueDate: monthsAgo(3),
    type: 'certificate',
    credentialId: 'GCP-PD-2024-PS789',
    skills: ['Google Cloud', 'GCP', 'Cloud Development'],
    description: 'Professional certification for developing applications on Google Cloud Platform.',
    file: {
      url: 'https://via.placeholder.com/800x600/EA4335/FFFFFF?text=GCP+Developer+Certificate',
      fileName: 'gcp-developer-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: monthsAgo(3),
    },
    sourceUrl: 'https://cloud.google.com/certification',
    sourceDomain: 'cloud.google.com',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'rejected',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Unable to verify certificate. Credential ID not found in Google Cloud records. Please provide correct documentation.',
    rejectionReason: 'Credential ID not found in issuer records',
    meta: {
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      rejectedAt: daysAgo(3),
    },
    createdAt: monthsAgo(3),
    updatedAt: daysAgo(3)
  },
  // PENDING #1
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    title: 'MongoDB Certified Developer',
    issuer: 'MongoDB Inc.',
    issueDate: monthsAgo(2),
    type: 'micro_credential',
    credentialId: 'MONGO-DEV-2024-PS321',
    totalHours: 40,
    skills: ['MongoDB', 'NoSQL', 'Database Design', 'Aggregation'],
    description: 'Official MongoDB developer certification demonstrating proficiency in MongoDB database development.',
    file: {
      url: 'https://via.placeholder.com/800x600/00ED64/FFFFFF?text=MongoDB+Developer+Certificate',
      fileName: 'mongodb-developer-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: daysAgo(15),
    },
    sourceUrl: 'https://university.mongodb.com/',
    sourceDomain: 'mongodb.com',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'pending',
    verificationRequested: true,
    requestedAt: daysAgo(15),
    meta: {
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
    },
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15)
  },
  // PENDING #2
  {
    user: SEED_IDS.credentialist1,
    legalNameSnapshot: 'Priya Sharma',
    certificateName: 'Priya Sharma',
    nameMatchConfidence: 100,
    title: 'React Professional Certificate',
    issuer: 'Meta (Facebook)',
    issueDate: monthsAgo(1),
    type: 'certificate',
    credentialId: 'META-REACT-2024-PS654',
    totalHours: 60,
    skills: ['React', 'JavaScript', 'Frontend Development', 'Hooks', 'Redux'],
    description: 'Professional certificate in React development from Meta, covering advanced React concepts and best practices.',
    file: {
      url: 'https://via.placeholder.com/800x600/1877F2/FFFFFF?text=Meta+React+Certificate',
      fileName: 'meta-react-cert.pdf',
      fileType: 'application/pdf',
      uploadedAt: daysAgo(7),
    },
    sourceUrl: 'https://www.coursera.org/meta',
    sourceDomain: 'coursera.org',
    isDomainTrusted: true,
    isIssuerVerified: false,
    isPublic: false,
    status: 'pending',
    verificationRequested: true,
    requestedAt: daysAgo(7),
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
