import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import StatCard from '@common/components/StatCard.jsx';
import SimpleStackedArea from '@common/components/charts/SimpleStackedArea.jsx';
import ActivityHeatmap from '@common/components/charts/ActivityHeatmap.jsx';

export default function UserDashboardView({ stats }) {
  if (!stats || !stats.personalStats) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const { personalStats, chartData, heatmapData } = stats;

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
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item}>
          <StatCard
            title="Verified"
            value={personalStats.verifiedCredentials || 0}
            icon={CheckCircle2}
            iconBgClass="bg-green-500/10 text-green-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Pending"
            value={personalStats.pendingCredentials || 0}
            icon={Clock}
            iconBgClass="bg-yellow-500/10 text-yellow-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Unverified"
            value={personalStats.totalCredentials - (personalStats.verifiedCredentials + personalStats.pendingCredentials) || 0}
            icon={XCircle}
            iconBgClass="bg-red-500/10 text-red-600"
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
          <div className="p-6 border-b"><h2 className="text-base font-semibold">Verification Activity</h2></div>
          <div className="p-6 pt-4"><SimpleStackedArea data={chartData?.simpleSeries || []} /></div>
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="p-6 border-b"><h2 className="text-base font-semibold">Activity Streak</h2></div>
          <div className="p-6 pt-4"><ActivityHeatmap data={heatmapData?.user || []} /></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
