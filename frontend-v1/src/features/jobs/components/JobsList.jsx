import { motion } from 'framer-motion';
import JobCard from './JobCard.jsx';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function JobsList({ jobs }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {jobs.map((job) => (
        <motion.div key={job._id} variants={item}>
          <JobCard job={job} />
        </motion.div>
      ))}
    </motion.div>
  );
}
