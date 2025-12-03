import { motion } from 'framer-motion';
import { FileText, CheckCircle2, XCircle, Users, Building } from 'lucide-react';
import StatCard from '@common/components/StatCard.jsx';
import SimpleStackedArea from '@common/components/charts/SimpleStackedArea.jsx';
import ActivityHeatmap from '@common/components/charts/ActivityHeatmap.jsx';

export default function AdminDashboardView({ stats }) {
  if (!stats || !stats.platformOverview) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const { platformOverview, chartData, heatmapData } = stats;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="space-y-6">

      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Requests"
            value={platformOverview.totalCredentials || 0}
            icon={FileText}
            iconBgClass="bg-blue-600 text-white"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Accepted"
            value={platformOverview.verifiedCredentials || 0}
            icon={CheckCircle2}
            iconBgClass="bg-green-600 text-white"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Rejected"
            value={platformOverview.rejectedCredentials || 0}
            icon={XCircle}
            iconBgClass="bg-red-500 text-white"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Users"
            value={platformOverview.totalUsers || 0}
            icon={Users}
            iconBgClass="bg-purple-600 text-white"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Employers"
            value={platformOverview.totalEmployers || 0}
            icon={Building}
            iconBgClass="bg-orange-600 text-white"
          />
        </motion.div>
      </motion.section>

      <motion.div
        className="grid gap-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div
          className="rounded-xl border bg-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className="p-6 border-b"><h2 className="text-base font-semibold">Verification Requests Over Time</h2></div>
          <div className="p-6 pt-4"><SimpleStackedArea data={chartData?.adminSeries || []} /></div>
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="p-6 border-b"><h2 className="text-base font-semibold">Activity Streak</h2></div>
          <div className="p-6 pt-4"><ActivityHeatmap data={heatmapData?.admin || []} /></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
