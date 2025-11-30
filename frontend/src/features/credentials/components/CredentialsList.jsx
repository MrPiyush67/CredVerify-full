import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@common';

const getStatusIcon = (status) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-3 w-3" />;
    case 'pending':
      return <Clock className="h-3 w-3" />;
    default:
      return <XCircle className="h-3 w-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'verified':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default:
      return 'bg-red-500/10 text-red-600 border-red-500/20';
  }
};

export default function CredentialsList({ credentials, onViewDetails, pagination, onPageChange }) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {credentials.map((credential) => (
          <motion.div key={credential._id} variants={item}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{credential.title}</CardTitle>
                    {credential.issuer && (
                      <p className="text-sm text-muted-foreground mt-1">{credential.issuer}</p>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(credential.status)} flex items-center gap-1`}>
                    {getStatusIcon(credential.status)}
                    {credential.status}
                  </Badge>
                </div>
                {credential.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(credential.createdAt).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {credential.documentUrl && (
                      <a
                        href={credential.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Document →
                      </a>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(credential)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
