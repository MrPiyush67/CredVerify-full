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
    credentialist: SEED_IDS.credentialist1,
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    issueDate: monthsAgo(8),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    credentialType: 'certificate',
    credentialId: 'AWS-CSA-2024-PS123',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'Lambda'],
    description: 'Professional certification demonstrating expertise in designing distributed systems on AWS.',
    file: {
      url: 'https://via.placeholder.com/800x600/4285F4/FFFFFF?text=AWS+Solutions+Architect+Certificate',
      fileName: 'aws-solutions-architect.pdf',
      fileType: 'application/pdf'
    },
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Certificate verified through AWS official portal. Credential ID confirmed valid.',
    verifiedAt: daysAgo(5),
    createdAt: monthsAgo(8),
    updatedAt: daysAgo(5)
  },
  // VERIFIED #2
  {
    credentialist: SEED_IDS.credentialist1,
    title: 'Bachelor of Technology - Computer Science',
    issuer: 'Indian Institute of Technology Delhi',
    issueDate: new Date('2019-06-15'),
    expiryDate: null,
    credentialType: 'credential',
    credentialId: 'IIT-DEL-CS-2019-PS456',
    skills: ['Computer Science', 'Algorithms', 'Data Structures', 'DBMS'],
    description: 'Bachelor of Technology degree in Computer Science and Engineering from IIT Delhi.',
    file: {
      url: 'https://via.placeholder.com/800x600/34A853/FFFFFF?text=IIT+Delhi+B.Tech+Degree',
      fileName: 'btech-degree-iitdelhi.pdf',
      fileType: 'application/pdf'
    },
    isPublic: true,
    status: 'verified',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Degree verified with IIT Delhi records. Student ID and graduation year confirmed.',
    verifiedAt: daysAgo(10),
    createdAt: monthsAgo(6),
    updatedAt: daysAgo(10)
  },
  // REJECTED
  {
    credentialist: SEED_IDS.credentialist1,
    title: 'Google Cloud Professional Developer',
    issuer: 'Google Cloud',
    issueDate: monthsAgo(3),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    credentialType: 'micro-credential',
    credentialId: 'GCP-PD-2024-PS789',
    skills: ['Google Cloud', 'GCP', 'Cloud Development'],
    description: 'Professional certification for developing applications on Google Cloud Platform.',
    file: {
      url: 'https://via.placeholder.com/800x600/EA4335/FFFFFF?text=GCP+Developer+Certificate',
      fileName: 'gcp-developer-cert.pdf',
      fileType: 'application/pdf'
    },
    isPublic: true,
    status: 'rejected',
    verifiedBy: SEED_IDS.validant1,
    verificationNotes: 'Unable to verify certificate. Credential ID not found in Google Cloud records. Please provide correct documentation.',
    rejectedAt: daysAgo(3),
    createdAt: monthsAgo(3),
    updatedAt: daysAgo(3)
  },
  // PENDING #1
  {
    credentialist: SEED_IDS.credentialist1,
    title: 'MongoDB Certified Developer',
    issuer: 'MongoDB Inc.',
    issueDate: monthsAgo(2),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
    credentialType: 'micro-credential',
    credentialId: 'MONGO-DEV-2024-PS321',
    skills: ['MongoDB', 'NoSQL', 'Database Design', 'Aggregation'],
    description: 'Official MongoDB developer certification demonstrating proficiency in MongoDB database development.',
    file: {
      url: 'https://via.placeholder.com/800x600/00ED64/FFFFFF?text=MongoDB+Developer+Certificate',
      fileName: 'mongodb-developer-cert.pdf',
      fileType: 'application/pdf'
    },
    isPublic: true,
    status: 'pending',
    verifiedBy: null,
    verificationNotes: null,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15)
  },
  // PENDING #2
  {
    credentialist: SEED_IDS.credentialist1,
    title: 'React Professional Certificate',
    issuer: 'Meta (Facebook)',
    issueDate: monthsAgo(1),
    expiryDate: null,
    credentialType: 'credential',
    credentialId: 'META-REACT-2024-PS654',
    skills: ['React', 'JavaScript', 'Frontend Development', 'Hooks', 'Redux'],
    description: 'Professional certificate in React development from Meta, covering advanced React concepts and best practices.',
    file: {
      url: 'https://via.placeholder.com/800x600/1877F2/FFFFFF?text=Meta+React+Certificate',
      fileName: 'meta-react-cert.pdf',
      fileType: 'application/pdf'
    },
    isPublic: true,
    status: 'pending',
    verifiedBy: null,
    verificationNotes: null,
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
