// Mock documents for each user
export const mockDocuments = {
  'mock-user-001': [
    {
      uri: 'digilocker://NSDC/CERT001',
      doctype: 'CERT',
      name: 'AI Fundamentals Certificate',
      issuer: 'NSDC',
      issuerName: 'NSDC',
      date: '2024-01-15',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 4,
      schemeName: 'PMKVY',
      description: 'AI basics and ML fundamentals',
      size: '245KB'
    },
    {
      uri: 'digilocker://MHRD/EDU002',
      doctype: 'EDU',
      name: 'Full Stack Web Development',
      issuer: 'Ministry of Education',
      issuerName: 'MoE',
      date: '2024-02-20',
      type: 'certificate',
      category: 'education',
      nsqfLevel: 5,
      schemeName: 'NSQF',
      description: 'MERN stack development',
      size: '312KB'
    },
    {
      uri: 'digilocker://IGNOU/CERT003',
      doctype: 'CERT',
      name: 'Data Science Certificate',
      issuer: 'IGNOU',
      issuerName: 'IGNOU',
      date: '2024-03-10',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 6,
      schemeName: 'SWAYAM',
      description: 'Data science micro-credential',
      size: '289KB'
    },
    {
      uri: 'digilocker://NPTEL/CERT004',
      doctype: 'CERT',
      name: 'Cloud Computing',
      issuer: 'NPTEL',
      issuerName: 'NPTEL',
      date: '2024-04-05',
      type: 'certificate',
      category: 'technology',
      nsqfLevel: 5,
      schemeName: 'NPTEL',
      description: 'Cloud and AWS basics',
      size: '198KB'
    },
    {
      uri: 'digilocker://NSDC/CERT005',
      doctype: 'CERT',
      name: 'Digital Marketing',
      issuer: 'NSDC',
      issuerName: 'NSDC',
      date: '2024-05-12',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 5,
      schemeName: 'PMKVY',
      description: 'Digital marketing and SEO',
      size: '267KB'
    },
    {
      uri: 'digilocker://NIELIT/CERT006',
      doctype: 'CERT',
      name: 'Cybersecurity',
      issuer: 'NIELIT',
      issuerName: 'NIELIT',
      date: '2024-06-18',
      type: 'certificate',
      category: 'technology',
      nsqfLevel: 6,
      schemeName: 'CCC',
      description: 'Network security and ethical hacking',
      size: '298KB'
    },
    {
      uri: 'digilocker://AICTE/CERT007',
      doctype: 'CERT',
      name: 'Mobile App Development',
      issuer: 'AICTE',
      issuerName: 'AICTE',
      date: '2024-07-22',
      type: 'certificate',
      category: 'education',
      nsqfLevel: 5,
      schemeName: 'AICTE',
      description: 'Android and iOS development',
      size: '324KB'
    },
    {
      uri: 'digilocker://SWAYAM/CERT008',
      doctype: 'CERT',
      name: 'Blockchain Technology',
      issuer: 'SWAYAM',
      issuerName: 'SWAYAM',
      date: '2024-08-15',
      type: 'certificate',
      category: 'technology',
      nsqfLevel: 6,
      schemeName: 'SWAYAM',
      description: 'Blockchain and smart contracts',
      size: '276KB'
    },
    {
      uri: 'digilocker://MHRD/CERT009',
      doctype: 'CERT',
      name: 'Machine Learning',
      issuer: 'Ministry of Education',
      issuerName: 'MoE',
      date: '2024-09-10',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 7,
      schemeName: 'NSQF',
      description: 'ML algorithms and deep learning',
      size: '342KB'
    }
  ]
};

// Get documents by userId
export function getDocumentsByUserId(userId) {
  return mockDocuments[userId] || [];
}

// Get document by URI and userId
export function getDocumentByUri(userId, uri) {
  const documents = mockDocuments[userId] || [];
  return documents.find(d => d.uri === uri);
}
