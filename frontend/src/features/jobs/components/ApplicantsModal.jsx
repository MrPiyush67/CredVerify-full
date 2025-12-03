import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Eye } from 'lucide-react';
import { Button } from '@common/ui/Button.jsx';
import { Card, CardContent } from '@common/ui/Card.jsx';
import { Badge } from '@common/ui/Badge.jsx';
import Loader from '@common/components/Loader.jsx';
import { selectJobApplicants, selectJobsLoading, fetchJobApplicants } from '../redux/jobsSlice';
import ApplicantDetailsModal from './ApplicantDetailsModal.jsx';

export default function ApplicantsModal({ jobId, jobTitle, onClose }) {
  const dispatch = useDispatch();
  const applicants = useSelector(selectJobApplicants);
  const loading = useSelector(selectJobsLoading);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const handleRefresh = () => {
    dispatch(fetchJobApplicants(jobId));
  };

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'reviewed':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Applicants</h2>
              <p className="text-sm text-muted-foreground mt-1">{jobTitle}</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
            {loading.jobApplicants ? (
              <Loader type="list" />
            ) : applicants.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <span className="text-3xl">📭</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
                <p className="text-muted-foreground">
                  Applications will appear here once candidates start applying
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <Card 
                    key={applicant._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewProfile(applicant)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {applicant.user?.name?.charAt(0).toUpperCase() || applicant.credentialist?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold truncate">
                                {applicant.user?.name || applicant.credentialist?.name || 'Unknown'}
                              </h3>
                              <Badge className={`${getStatusColor(applicant.status)} text-xs`}>
                                {applicant.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{applicant.user?.email || applicant.credentialist?.email || 'N/A'}</span>
                            </div>
                            {applicant.appliedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(applicant);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <ApplicantDetailsModal
          jobId={jobId}
          applicantUserId={selectedApplicant.user?._id || selectedApplicant.credentialist?._id}
          applicantId={selectedApplicant._id}
          onClose={() => setSelectedApplicant(null)}
          onStatusUpdate={handleRefresh}
        />
      )}
    </AnimatePresence>
  );
}
