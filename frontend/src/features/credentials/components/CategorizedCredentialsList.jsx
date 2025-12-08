import { motion } from 'framer-motion';
import CredentialCard from './CredentialCard';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  return category.subcategories.map((sub, index) => ({
    _id: `dummy-${category.id}-${index}`,
    title: `${sub} Certificate`,
    issuer: 'Government of India',
    status: 'verified',
    createdAt: new Date().toISOString(),
    isPublic: true,
    file: {
      url: null, // Dummy link as requested
      fileType: 'image/png'
    },
    subcategory: sub
  }));
};

const ScrollContainer = ({ children, id }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; // Card width + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 -ml-4"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 -mr-4"
      >
        <ChevronRight className="h-6 w-6 text-gray-700" />
      </button>
    </div>
  );
};

export default function CategorizedCredentialsList({ credentials, onViewDetails }) {
  // In a real scenario, we would filter 'credentials' into categories.
  // For now, we generate dummy data as requested.

  return (
    <div className="space-y-10 pb-10">
      {CATEGORIES.map((category) => {
        const categoryCredentials = generateDummyCredentials(category);

        return (
          <section key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              <span className="text-sm text-gray-500">{categoryCredentials.length} Certificates</span>
            </div>

            <ScrollContainer id={category.id}>
              {categoryCredentials.map((credential) => (
                <div key={credential._id} className="snap-start">
                  <CredentialCard
                    credential={credential}
                    onViewDetails={onViewDetails}
                    subcategory={credential.subcategory}
                  />
                </div>
              ))}
            </ScrollContainer>
          </section>
        );
      })}
    </div>
  );
}
