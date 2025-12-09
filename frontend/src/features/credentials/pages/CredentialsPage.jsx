import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { Button, PageHeader, Loader, Card, CardContent, Input } from '@common';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@common/ui/command';
import { fetchCredentials, fetchCredentialById, selectCredentials, selectCredentialsLoading, selectCredentialsError, selectCredentialsPagination, selectSelectedCredential } from '../redux/credentialsSlice';
import { selectUser } from '@features/auth/redux/authSlice';
import CredentialsList from '../components/CredentialsList.jsx';
import CategorizedCredentialsList from '../components/CategorizedCredentialsList.jsx';
import CredentialUploadModal from '../components/CredentialUploadModal.jsx';
import CredentialDetailsModal from '../components/CredentialDetailsModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

const INDUSTRIES = [
  'Aerospace & Aviation',
  'Agriculture',
  'Apparel',
  'Automotive',
  'Beauty & Wellness',
  'BFSI (Banking, Financial Services & Insurance)',
  'Capital Goods & Manufacturing',
  'Chemicals & Petrochemicals',
  'Construction',
  'Education, Training & Research',
  'Electronics & HW (Hardware)',
  'Environmental Science',
  'Food Industry / Food Processing',
  'Gem & Jewellery',
  'Glass & Ceramics',
  'Handicrafts & Carpets',
  'Healthcare',
  'Home Management & Caregiving',
  'Hydrocarbon',
  'Indian Defence Forces',
  'Infrastructure',
  'Instrumentation',
  'Iron & Steel',
  'IT/ITeS',
  'Judiciary',
  'Leather',
  'Legal Activities',
  'Legislators',
  'Life Sciences',
  'Management',
  'Media & Entertainment',
  'Mining',
  'Musical Instruments',
  'Office Administration & Facility Management',
  'Optical Products',
  'Paints & Coatings',
  'Paper & Paper Products',
  'Persons with Disability',
  'Plumbing',
  'Postal Services',
  'Power',
  'Printing',
  'Private Security',
  'Public Administration',
  'Railways',
  'Real Estate',
  'Religious Professionals',
  'Retail',
  'Rubber Industry',
  'Shipping',
  'Sports, Physical Education, Fitness & Leisure',
  'Telecom',
  'Textile & Handloom',
  'Tobacco Industry',
  'Tourism & Hospitality',
  'Transportation, Logistics & Warehousing',
  'Unorganised Sector',
  'Water Supply, Sewerage, Waste Management & Remediation Activities',
  'Wood & Carpentry'
];

export default function CredentialsPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const credentials = useSelector(selectCredentials);

  // Only learners can add credentials
  const canAddCredential = user?.role === 'learner';
  const loading = useSelector(selectCredentialsLoading);
  const error = useSelector(selectCredentialsError);
  const pagination = useSelector(selectCredentialsPagination);
  const selectedCredential = useSelector(selectSelectedCredential);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewingCredential, setViewingCredential] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');

  useEffect(() => {
    dispatch(fetchCredentials());
  }, [dispatch]);

  // Filter industries based on search
  const filteredIndustries = INDUSTRIES.filter(industry =>
    industry.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Close command dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCommandOpen && !event.target.closest('.command-wrapper')) {
        setIsCommandOpen(false);
        setIndustrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCommandOpen]);

  const handleViewDetails = async (credential) => {
    setViewingCredential(credential);
    setIsDetailsModalOpen(true);

    // Only fetch details for real credentials (not dummy ones)
    if (credential._id && !credential._id.toString().startsWith('dummy-')) {
      setDetailsLoading(true);
      try {
        // Fetch full credential details from backend
        await dispatch(fetchCredentialById(credential._id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch credential details:', error);
      } finally {
        setDetailsLoading(false);
      }
    }
  };

  const handleRefresh = () => dispatch(fetchCredentials({ page: pagination.page }));

  const handlePageChange = (newPage) => dispatch(fetchCredentials({ page: newPage }));

  if (loading && credentials.length === 0) return <Loader type="list" fullScreen />;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Header */}
      <PageHeader
        title="Your Credentials"
        description="Manage and submit your certifications for verification"
        action={
          canAddCredential && (
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Credential
            </Button>
          )
        }
      />

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

      {/* Search and Filter Section */}
      <Card className="mb-6 bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search Input */}
            <Input
              placeholder="Search by title, subcategory, or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />

            {/* Industry Filter with Command */}
            <div className="relative command-wrapper">
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
                onClick={() => setIsCommandOpen(!isCommandOpen)}
              >
                <span className={selectedIndustry ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedIndustry || 'Filter by Industry...'}
                </span>
                {selectedIndustry ? (
                  <X
                    className="h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndustry('');
                    }}
                  />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>

              {/* Command Dropdown */}
              {isCommandOpen && (
                <div className="absolute z-50 w-full mt-1">
                  <Command className="rounded-lg border shadow-md bg-popover">
                    <CommandInput
                      placeholder="Search industries..."
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                    />
                    <CommandList>
                      {filteredIndustries.length === 0 ? (
                        <CommandEmpty>No industry found.</CommandEmpty>
                      ) : (
                        <CommandGroup heading="Industries">
                          {filteredIndustries.map((industry) => (
                            <CommandItem
                              key={industry}
                              onSelect={() => {
                                setSelectedIndustry(industry);
                                setIsCommandOpen(false);
                                setIndustrySearch('');
                              }}
                              className="cursor-pointer"
                            >
                              {industry}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedIndustry) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Search: {searchQuery}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </div>
              )}
              {selectedIndustry && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <span>Industry: {selectedIndustry}</span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedIndustry('')}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <CategorizedCredentialsList
        credentials={credentials}
        onViewDetails={handleViewDetails}
        searchQuery={searchQuery}
        selectedIndustry={selectedIndustry}
      />

      {/* Modals */}
      <CredentialUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <CredentialDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        credential={selectedCredential && viewingCredential && selectedCredential._id === viewingCredential._id ? selectedCredential : viewingCredential}
        loading={detailsLoading}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
