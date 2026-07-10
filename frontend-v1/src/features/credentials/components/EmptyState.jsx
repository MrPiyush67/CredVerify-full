import { motion } from 'framer-motion';
import { CheckCircle, Plus } from 'lucide-react';
import { Card, Button } from '@common';

import { useNavigate } from 'react-router';

export default function EmptyState({ onAddCredential }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No credentials yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first credential to get started with verification
            </p>
          </div>
          <Button
            onClick={() => navigate('/credentials/add')}
            className="mt-2 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Credential
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
