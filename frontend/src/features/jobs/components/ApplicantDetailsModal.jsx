import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, 
  CheckCircle, XCircle, Clock, Calendar, Building, User 
} from 'lucide-react';
import { Button } from '@common/ui/Button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@common/ui/Card.jsx';
import { Badge } from '@common/ui/Badge.jsx';
import Loader from '@common/components/Loader.jsx';
import { getApplicantDetails, updateApplicantStatus } from '../api/jobsApi';

export default function ApplicantDetailsModal({ jobId, applicantUserId, applicantId, onClose, onStatusUpdate }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  const loadApplicantDetails = async () => {
    try {
      setLoading(true);
      const response = await getApplicantDetails(jobId, applicantUserId);
      setDetails(response.data?.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load applicant details:', err);
      setError(err.response?.data?.message || 'Failed to load applicant details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, applicantUserId]);

  const handleUpdateStatus = async (status) => {
    try {
      setUpdating(true);
      await updateApplicantStatus(jobId, applicantId, status);
      // Update local state
      setDetails(prev => ({
        ...prev,
        application: { ...prev.application, status }
      }));
      // Notify parent to refresh
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {details?.profile?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Applicant Profile</h2>
                {details?.application && (
                  <Badge className={`mt-1 ${getStatusColor(details.application.status)}`}>
                    {details.application.status}
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {loading ? (
              <Loader type="page" />
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">❌</div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Details</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : details ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{details.profile?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{details.profile?.email || 'N/A'}</p>
                        </div>
                      </div>
                      {details.profile?.phoneNo && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{details.profile.phoneNo}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Applied On</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatDate(details.application?.appliedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {details.profile?.bio && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Bio</p>
                        <p className="text-sm">{details.profile.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                {details.profile?.skills && details.profile.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {details.profile.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {details.profile?.education && details.profile.education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {details.profile.education.map((edu, idx) => (
                        <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.fieldOfStudy} • {edu.startYear} - {edu.endYear || 'Present'}
                          </p>
                          {edu.grade && (
                            <p className="text-sm mt-1">Grade: {edu.grade}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Experience */}
                {details.profile?.experience && details.profile.experience.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {details.profile.experience.map((exp, idx) => (
                        <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                          <h4 className="font-semibold">{exp.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span>{exp.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                            {exp.location && (
                              <>
                                <span>•</span>
                                <MapPin className="h-4 w-4" />
                                <span>{exp.location}</span>
                              </>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Verified Credentials */}
                {details.verifiedCredentials && details.verifiedCredentials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Verified Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {details.verifiedCredentials.map((cred, idx) => (
                        <div key={idx} className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{cred.title}</h4>
                              <p className="text-sm text-muted-foreground">{cred.issuer}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {cred.type}
                                </Badge>
                                {cred.issueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    Issued: {formatDate(cred.issueDate)}
                                  </span>
                                )}
                              </div>
                              {cred.skills && cred.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {cred.skills.map((skill, skillIdx) => (
                                    <Badge key={skillIdx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {details && details.application && (
            <div className="p-6 border-t bg-muted/30 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Application Status: <strong className="text-foreground">{details.application.status}</strong>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updating || details.application.status === 'rejected'}
                  variant="outline"
                  className="gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('reviewed')}
                  disabled={updating || details.application.status === 'reviewed'}
                  variant="outline"
                  className="gap-2 text-purple-500 border-purple-500/20 hover:bg-purple-500/10"
                >
                  <Clock className="h-4 w-4" />
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('shortlisted')}
                  disabled={updating || details.application.status === 'shortlisted'}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Shortlist
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
