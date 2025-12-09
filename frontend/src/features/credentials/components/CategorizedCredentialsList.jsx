import CredentialCard from './CredentialCard';

const CATEGORIES = [
  {
    id: 'school-vocational',
    title: '1. School Vocational Education (NSQF 1–4)',
    subcategories: ['Agriculture assistant', 'Automotive service technician', 'IT/ITeS junior jobs', 'Retail associate']
  },
  {
    id: 'iti-trades',
    title: '2. ITI Trades (NCVT/SCVT)',
    subcategories: ['Electrician', 'Fitter', 'Welder', 'COPA', 'Mechanic Motor Vehicle']
  },
  {
    id: 'diploma-polytechnic',
    title: '3. Diploma / Polytechnic (AICTE)',
    subcategories: ['Mechanical', 'Civil', 'Electrical', 'CS', 'Electronics']
  },
  {
    id: 'undergraduate',
    title: '4. Undergraduate Degrees (UGC/AICTE)',
    subcategories: ['B.Tech / BE', 'B.Sc', 'B.Com', 'BA', 'BCA', 'BBA', 'B.Ed', 'B.Pharm']
  },
  {
    id: 'postgraduate',
    title: '5. Postgraduate Degrees',
    subcategories: ['M.Tech / ME', 'MBA / MCA', 'M.Sc', 'MA', 'M.Com', 'M.Ed', 'M.Pharm']
  },
  {
    id: 'nsdc',
    title: '6. NSDC + Sector Skill Councils',
    subcategories: ['IT-ITES', 'Healthcare', 'Beauty & Wellness', 'Retail', 'Automotive']
  },
  {
    id: 'medical',
    title: '7. Medical & Paramedical',
    subcategories: ['MBBS', 'BDS', 'Nursing', 'Physiotherapy', 'Lab Technician']
  },
  {
    id: 'teacher-training',
    title: '8. Teacher Training / Education',
    subcategories: ['D.El.Ed', 'B.Ed', 'M.Ed']
  },
  {
    id: 'law-arch-mgmt',
    title: '9. Law, Architecture, Management',
    subcategories: ['LLB', 'LLM', 'B.Arch', 'MBA specializations']
  },
  {
    id: 'agriculture',
    title: '10. Agriculture & Allied',
    subcategories: ['B.Sc Agriculture', 'Veterinary', 'Horticulture', 'Fisheries']
  }
];

const generateDummyCredentials = (category) => {
  return category.subcategories.map((sub, index) => {
    // Generate varied dates (some recent, some older)
    const now = new Date();
    const daysAgo = [15, 45, 120, 200, 400][index % 5]; // Mix of different ages
    const createdDate = new Date(now);
    createdDate.setDate(now.getDate() - daysAgo);

    return {
      _id: `dummy-${category.id}-${index}`,
      title: `${sub} Certificate`,
      issuer: 'Government of India',
      status: 'verified',
      createdAt: createdDate.toISOString(),
      isPublic: index % 3 !== 0, // Mix: public (67%), private (33%)
      file: {
        url: null, // Dummy link as requested
        fileType: 'image/png'
      },
      subcategory: sub,
      category: category.title // Keep category in data for internal organization
    };
  });
};

export default function CategorizedCredentialsList({ 
  credentials, 
  onViewDetails, 
  searchQuery = '', 
  selectedIndustry = '',
  selectedDate = '',
  visibilityFilter = ''
}) {
  // Generate all credentials from all categories and flatten them into a single array
  const allCredentials = CATEGORIES.flatMap(category => generateDummyCredentials(category));

  // Helper function to check date filter
  const matchesDateFilter = (credential) => {
    if (!selectedDate) return true;
    
    const createdDate = new Date(credential.createdAt);
    const filterDate = new Date(selectedDate);
    const now = new Date();
    
    // Check if credential was created between selected date and today
    return createdDate >= filterDate && createdDate <= now;
  };

  // Filter credentials based on all filters
  const filteredCredentials = allCredentials.filter((credential) => {
    // Search filter
    const matchesSearch = !searchQuery.trim() ||
      credential.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      credential.issuer.toLowerCase().includes(searchQuery.toLowerCase());

    // Industry filter (map industry to subcategory)
    const matchesIndustry = !selectedIndustry ||
      credential.subcategory.toLowerCase().includes(selectedIndustry.toLowerCase());

    // Date filter
    const matchesDate = matchesDateFilter(credential);

    // Visibility filter
    const matchesVisibility = !visibilityFilter ||
      (visibilityFilter === 'public' && credential.isPublic) ||
      (visibilityFilter === 'private' && !credential.isPublic);

    return matchesSearch && matchesIndustry && matchesDate && matchesVisibility;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCredentials.length > 0 ? (
        filteredCredentials.map((credential) => (
          <CredentialCard
            key={credential._id}
            credential={credential}
            onViewDetails={onViewDetails}
            subcategory={credential.subcategory}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No credentials found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
