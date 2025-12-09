import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common';
import Loader from '@common/components/Loader.jsx';
import { fetchPendingCredentials, selectCredentials, selectCredentialsLoading, selectCredentialsError } from '@features/credentials/redux/credentialsSlice';
import RequestCard from '../components/RequestCard.jsx';
import AiChatWrapper from '@features/ai-chat/components/AiChatWrapper.jsx';

export default function RequestsPage() {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('pending');

  const credentials = useSelector(selectCredentials);
  const loading = useSelector(selectCredentialsLoading);
  const error = useSelector(selectCredentialsError);

  useEffect(() => {
    // Handle different filter types
    let params = {};
    if (filter === 'past') {
      // Past requests = verified OR rejected
      params = { statusIn: 'verified,rejected' };
    } else if (filter !== 'all') {
      params = { status: filter };
    }
    dispatch(fetchPendingCredentials(params));
  }, [dispatch, filter]);

  // Filter credentials based on search query
  const filteredCredentials = useMemo(() => {
    if (!query) return credentials;

    return credentials.filter((cred) => {
      const userName = cred.user?.name || '';
      const userEmail = cred.user?.email || '';
      const title = cred.title || '';
      const searchText = `${userName} ${userEmail} ${title}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  }, [credentials, query]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleRefresh = () => {
    let params = {};
    if (filter === 'past') {
      params = { statusIn: 'verified,rejected' };
    } else if (filter !== 'all') {
      params = { status: filter };
    }
    dispatch(fetchPendingCredentials(params));
  };

  if (loading && credentials.length === 0) return <Loader type="list" fullScreen />;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Credential Verification Requests</h1>
            <p className="text-muted-foreground mt-1">
              Review and verify user credential submissions
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search by user name, email, or credential..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:flex-1"
          />
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Filter requests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="past">Past Requests</SelectItem>
              <SelectItem value="all">All Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Content */}
      {filteredCredentials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No credential requests found</h3>
          <p className="text-muted-foreground">
            {query || filter !== 'pending'
              ? 'Try adjusting your search or filter criteria'
              : 'Verification requests will appear here when users submit credentials'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredCredentials.map((credential) => (
            <RequestCard
              key={credential._id}
              credential={credential}
              onSuccess={handleRefresh}
            />
          ))}
        </motion.div>
      )}

      <AiChatWrapper />
    </div>
  );
}
