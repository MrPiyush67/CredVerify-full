// Centralized platform metadata configuration
// Organized by upload/verification method

// Upload Methods
export const UPLOAD_METHODS = {
  PDF: 'PDF Certificate Upload',
  QR_CODE: 'QR Code Verification',
  CREDENTIAL_ID: 'Credential ID Verification',
  PROFILE_LINK: 'Profile Link'
};

// Platform categories by verification method
export const PLATFORMS = {
  // Platforms with downloadable PDF certificates (no QR by default)
  PDF_CERTIFICATES: [
    {
      id: 'hackerrank-pdf',
      name: 'HackerRank Skill Certifications',
      domain: 'hackerrank.com',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: true,
      verificationUrlLabel: 'Verification URL (optional)',
      icon: 'HR'
    },
    {
      id: 'bharatskills',
      name: 'Bharat Skills (DGT)',
      domain: 'bharatskills.gov.in',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: true,
      verificationUrlLabel: 'Verification link (if available)',
      icon: 'BS'
    },
    {
      id: 'ignou',
      name: 'IGNOU Online Certificates',
      domain: 'ignou.ac.in',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: false,
      icon: 'IGNOU'
    },
    {
      id: 'futureskillsprime-pdf',
      name: 'FutureSkills Prime',
      domain: 'futureskillsprime.in',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: false,
      note: 'Also supports Credential ID verification',
      icon: 'FSP'
    },
    {
      id: 'codechef-old',
      name: 'CodeChef (Old Certifications)',
      domain: 'codechef.com',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: true,
      verificationUrlLabel: 'Verification link',
      icon: 'CC'
    },
    {
      id: 'nptel-old',
      name: 'NPTEL/SWAYAM (Older Years)',
      domain: 'nptel.ac.in',
      uploadMethod: UPLOAD_METHODS.PDF,
      hasVerificationUrl: false,
      note: 'Certificate ID available for older batches',
      icon: 'NPTEL'
    }
  ],

  // Platforms with Credential ID + Online Verification
  CREDENTIAL_ID: [
    {
      id: 'hackerrank-id',
      name: 'HackerRank Skills Certification',
      domain: 'hackerrank.com',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://www.hackerrank.com/certificates/',
      placeholder: 'Enter certificate ID',
      icon: 'HR'
    },
    {
      id: 'futureskillsprime-id',
      name: 'FutureSkills Prime',
      domain: 'futureskillsprime.in',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://futureskillsprime.in/verify',
      placeholder: 'Enter certificate ID',
      icon: 'FSP'
    },
    {
      id: 'swayam-nptel',
      name: 'SWAYAM/NPTEL',
      domain: 'swayam.gov.in',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://nptel.ac.in/noc/certificate_verify.php',
      placeholder: 'Enter certificate ID',
      icon: 'NPTEL'
    },
    {
      id: 'eskillindia-id',
      name: 'eSkill India',
      domain: 'eskillindia.gov.in',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://eskillindia.gov.in/verify',
      placeholder: 'Enter certificate number',
      icon: 'eSI'
    },
    {
      id: 'skillindiadigital-id',
      name: 'Skill India Digital',
      domain: 'skillindiadigital.gov.in',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://skillindiadigital.gov.in/verify',
      placeholder: 'Enter certificate number',
      icon: 'SID'
    },
    {
      id: 'nsdc-id',
      name: 'NSDC Trust Portal',
      domain: 'nsdctrust.gov.in',
      uploadMethod: UPLOAD_METHODS.CREDENTIAL_ID,
      verificationUrl: 'https://nsdctrust.gov.in/verify',
      placeholder: 'Enter certificate number',
      icon: 'NSDC'
    }
  ],

  // Platforms with QR Code + Government Verification
  QR_CODE: [
    {
      id: 'skillindiadigital-qr',
      name: 'Skill India Digital',
      domain: 'skillindiadigital.gov.in',
      uploadMethod: UPLOAD_METHODS.QR_CODE,
      verificationPortal: 'Skill India Portal',
      supportsManualInput: true,
      icon: 'SID'
    },
    {
      id: 'nsdc-qr',
      name: 'NSDC Trust Portal',
      domain: 'nsdctrust.gov.in',
      uploadMethod: UPLOAD_METHODS.QR_CODE,
      verificationPortal: 'NSDC Verification',
      supportsManualInput: true,
      icon: 'NSDC'
    },
    {
      id: 'eskillindia-qr',
      name: 'eSkill India',
      domain: 'eskillindia.gov.in',
      uploadMethod: UPLOAD_METHODS.QR_CODE,
      verificationPortal: 'eSkill India Portal',
      supportsManualInput: true,
      icon: 'eSI'
    },
    {
      id: 'swayam-qr',
      name: 'SWAYAM/NPTEL (Latest)',
      domain: 'swayam.gov.in',
      uploadMethod: UPLOAD_METHODS.QR_CODE,
      verificationPortal: 'SWAYAM Portal',
      supportsManualInput: false,
      icon: 'NPTEL'
    },
    {
      id: 'digilocker',
      name: 'DigiLocker',
      domain: 'digilocker.gov.in',
      uploadMethod: UPLOAD_METHODS.QR_CODE,
      verificationPortal: 'DigiLocker (Aadhaar-linked)',
      supportsManualInput: false,
      note: 'Government-verified documents',
      icon: 'DL'
    }
  ],

  // DSA/CP Platforms (Profile Links Only)
  DSA_CP: [
    {
      id: 'leetcode',
      name: 'LeetCode',
      category: 'DSA/CP Portfolio',
      domain: 'leetcode.com',
      baseProfileUrl: 'https://leetcode.com/u/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: '{ }'
    },
    {
      id: 'codeforces',
      name: 'CodeForces',
      category: 'DSA/CP Portfolio',
      domain: 'codeforces.com',
      baseProfileUrl: 'https://codeforces.com/profile/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'CF'
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      category: 'DSA/CP Portfolio',
      domain: 'codechef.com',
      baseProfileUrl: 'https://www.codechef.com/users/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'CC'
    },
    {
      id: 'atcoder',
      name: 'AtCoder',
      category: 'DSA/CP Portfolio',
      domain: 'atcoder.jp',
      baseProfileUrl: 'https://atcoder.jp/users/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'AC'
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      category: 'DSA/CP Portfolio',
      domain: 'hackerrank.com',
      baseProfileUrl: 'https://www.hackerrank.com/profile/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'HR'
    },
    {
      id: 'geeksforgeeks',
      name: 'GeeksForGeeks',
      category: 'DSA/CP Portfolio',
      domain: 'geeksforgeeks.org',
      baseProfileUrl: 'https://www.geeksforgeeks.org/user/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'GFG'
    },
    {
      id: 'codestudio',
      name: 'CodeStudio (Naukri Code360)',
      category: 'DSA/CP Portfolio',
      domain: 'naukri.com',
      baseProfileUrl: 'https://www.naukri.com/code360/profile/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'CS'
    },
    {
      id: 'interviewbit',
      name: 'InterviewBit',
      category: 'DSA/CP Portfolio',
      domain: 'interviewbit.com',
      baseProfileUrl: 'https://www.interviewbit.com/profile/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'IB'
    },
    {
      id: 'hackerearth',
      name: 'HackerEarth',
      category: 'DSA/CP Portfolio',
      domain: 'hackerearth.com',
      baseProfileUrl: 'https://www.hackerearth.com/@',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'HE'
    },
    {
      id: 'topcoder',
      name: 'TopCoder',
      category: 'DSA/CP Portfolio',
      domain: 'topcoder.com',
      baseProfileUrl: 'https://www.topcoder.com/members/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'TC'
    }
  ],

  // Developer Portfolio Platforms (Profile Links Only)
  DEVELOPER_PORTFOLIO: [
    {
      id: 'github',
      name: 'GitHub',
      category: 'Developer Portfolio',
      domain: 'github.com',
      baseProfileUrl: 'https://github.com/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: null
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      category: 'Developer Portfolio',
      domain: 'gitlab.com',
      baseProfileUrl: 'https://gitlab.com/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'GL'
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      category: 'Developer Portfolio',
      domain: 'bitbucket.org',
      baseProfileUrl: 'https://bitbucket.org/',
      uploadMethod: UPLOAD_METHODS.PROFILE_LINK,
      icon: 'BB'
    }
  ]
};

// Categories for profile links
export const PROFILE_CATEGORIES = [
  'DSA/CP Portfolio',
  'Developer Portfolio'
];

// Helper functions
export function getPlatformsByUploadMethod(method) {
  switch(method) {
    case UPLOAD_METHODS.PDF:
      return PLATFORMS.PDF_CERTIFICATES;
    case UPLOAD_METHODS.QR_CODE:
      return PLATFORMS.QR_CODE;
    case UPLOAD_METHODS.CREDENTIAL_ID:
      return PLATFORMS.CREDENTIAL_ID;
    case UPLOAD_METHODS.PROFILE_LINK:
      return [...PLATFORMS.DSA_CP, ...PLATFORMS.DEVELOPER_PORTFOLIO];
    default:
      return [];
  }
}

export function getPlatformsByCategory(category) {
  if (category === 'DSA/CP Portfolio') {
    return PLATFORMS.DSA_CP;
  } else if (category === 'Developer Portfolio') {
    return PLATFORMS.DEVELOPER_PORTFOLIO;
  }
  return [];
}
