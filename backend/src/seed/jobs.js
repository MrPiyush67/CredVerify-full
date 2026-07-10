import Job from '../features-old/job/job.model.js';
import { SEED_IDS } from './users.js';

// Helper to generate random past dates for applications
const randomDaysAgo = (minDays, maxDays) => {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper to generate past dates
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// 5 Job Postings by Meera Krishnan (demo employer)
const jobs = [
  {
    employer: SEED_IDS.employer1,
    title: 'Senior Full Stack Developer',
    description:
      'We are looking for an experienced Full Stack Developer to join our growing team at StartupX Technologies. You will be responsible for developing and maintaining web applications using React, Node.js, and MongoDB. The ideal candidate has 4+ years of experience in building scalable applications and working in agile environments.',
    requirements: [
      '4+ years of experience in full stack development',
      'Proficiency in React, Node.js, and MongoDB',
      'Experience with RESTful APIs and microservices',
      'Strong understanding of JavaScript/TypeScript',
      'Familiarity with cloud platforms (AWS/GCP)',
      'Excellent problem-solving and communication skills',
    ],
    location: 'Mumbai, India (Hybrid)',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 1800000,
      max: 2500000,
      currency: 'INR',
    },
    status: 'active',
    applicants: [
      {
        learner: SEED_IDS.learner1, // Priya Sharma
        appliedAt: randomDaysAgo(5, 15),
        status: 'shortlisted',
      },
      {
        learner: SEED_IDS.learner2,
        appliedAt: randomDaysAgo(5, 15),
        status: 'reviewed',
      },
      {
        learner: SEED_IDS.learner3,
        appliedAt: randomDaysAgo(5, 15),
        status: 'pending',
      },
      {
        learner: SEED_IDS.learner4,
        appliedAt: randomDaysAgo(5, 15),
        status: 'pending',
      },
    ],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    employer: SEED_IDS.employer1,
    title: 'UI/UX Designer',
    description:
      'StartupX Technologies is seeking a creative UI/UX Designer to design intuitive and engaging user interfaces for our SaaS products. You will work closely with product managers and developers to create beautiful, functional designs that enhance user experience.',
    requirements: [
      '3+ years of experience in UI/UX design',
      'Proficiency in Figma, Adobe XD, or Sketch',
      'Strong portfolio demonstrating web and mobile design',
      'Understanding of design systems and accessibility',
      'Experience with user research and usability testing',
      'Ability to translate business requirements into design',
    ],
    location: 'Mumbai, India (Remote)',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 1200000,
      max: 1800000,
      currency: 'INR',
    },
    status: 'active',
    applicants: [
      {
        learner: SEED_IDS.learner5,
        appliedAt: randomDaysAgo(3, 12),
        status: 'reviewed',
      },
      {
        learner: SEED_IDS.learner6,
        appliedAt: randomDaysAgo(3, 12),
        status: 'pending',
      },
      {
        learner: SEED_IDS.learner7,
        appliedAt: randomDaysAgo(3, 12),
        status: 'rejected',
      },
    ],
    createdAt: daysAgo(18),
    updatedAt: daysAgo(18),
  },
  {
    employer: SEED_IDS.employer1,
    title: 'DevOps Engineer',
    description:
      'Join our team as a DevOps Engineer to help build and maintain our cloud infrastructure. You will automate deployment pipelines, manage containerized applications, and ensure high availability of our services. This is a great opportunity to work with modern DevOps tools and practices.',
    requirements: [
      '3+ years of DevOps experience',
      'Expertise in Docker, Kubernetes, and CI/CD pipelines',
      'Strong knowledge of AWS or Google Cloud Platform',
      'Experience with infrastructure as code (Terraform, CloudFormation)',
      'Proficiency in scripting languages (Bash, Python)',
      'Understanding of monitoring and logging tools',
    ],
    location: 'Mumbai, India (Hybrid)',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 1500000,
      max: 2200000,
      currency: 'INR',
    },
    status: 'active',
    applicants: [
      {
        learner: SEED_IDS.learner8,
        appliedAt: randomDaysAgo(2, 10),
        status: 'shortlisted',
      },
      {
        learner: SEED_IDS.learner9,
        appliedAt: randomDaysAgo(2, 10),
        status: 'pending',
      },
    ],
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    employer: SEED_IDS.employer1,
    title: 'Product Manager',
    description:
      'We are looking for a passionate Product Manager to drive the vision and execution of our SaaS products. You will work with cross-functional teams to define product strategy, prioritize features, and deliver value to our customers.',
    requirements: [
      '4+ years of product management experience',
      'Experience in SaaS or B2B products',
      'Strong analytical and data-driven decision-making skills',
      'Excellent communication and stakeholder management',
      'Understanding of agile methodologies',
      'Technical background or CS degree preferred',
    ],
    location: 'Mumbai, India (Hybrid)',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 2000000,
      max: 3000000,
      currency: 'INR',
    },
    status: 'active',
    applicants: [
      {
        learner: SEED_IDS.learner10,
        appliedAt: randomDaysAgo(1, 8),
        status: 'reviewed',
      },
      {
        learner: SEED_IDS.learner1, // Priya applying to multiple jobs
        appliedAt: randomDaysAgo(1, 8),
        status: 'pending',
      },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
  {
    employer: SEED_IDS.employer1,
    title: 'Frontend Developer Intern',
    description:
      'StartupX Technologies is offering an exciting internship opportunity for aspiring frontend developers. You will work on real projects, learn modern web development technologies, and gain hands-on experience in a fast-paced startup environment.',
    requirements: [
      "Pursuing or recently completed Bachelor's in Computer Science",
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Familiarity with React or other frontend frameworks',
      'Passion for web development and learning',
      'Good communication skills',
      'Available for 6 months internship',
    ],
    location: 'Mumbai, India (On-site)',
    jobType: 'internship',
    experienceLevel: 'entry',
    salary: {
      min: 15000,
      max: 25000,
      currency: 'INR',
    },
    status: 'active',
    applicants: [
      {
        learner: SEED_IDS.learner2,
        appliedAt: randomDaysAgo(1, 5),
        status: 'pending',
      },
      {
        learner: SEED_IDS.learner3,
        appliedAt: randomDaysAgo(1, 5),
        status: 'pending',
      },
      {
        learner: SEED_IDS.learner4,
        appliedAt: randomDaysAgo(1, 5),
        status: 'reviewed',
      },
      {
        learner: SEED_IDS.learner5,
        appliedAt: randomDaysAgo(1, 5),
        status: 'pending',
      },
      {
        learner: SEED_IDS.learner6,
        appliedAt: randomDaysAgo(1, 5),
        status: 'pending',
      },
    ],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
];

const seedJobs = async () => {
  const createdJobs = await Job.insertMany(jobs);
  console.log(
    `✅ Jobs created: ${createdJobs.length} (posted by demo employer Meera)`,
  );
  return createdJobs;
};

export default seedJobs;
