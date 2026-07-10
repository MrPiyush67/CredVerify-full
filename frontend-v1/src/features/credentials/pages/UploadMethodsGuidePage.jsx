import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Puzzle,
  ShieldCheck,
  Upload,
  Link2,
  Clock,
  Info,
  Zap,
  Award,
  CheckCircle2,
  Download,
  Scan,
  Edit3,
  Database,
  Globe,
  FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button, PageHeader } from '@common';

export default function UploadMethodsGuidePage() {
  const navigate = useNavigate();

  const methods = [
    {
      id: 1,
      title: 'Browser Extension',
      icon: Puzzle,
      accentColor: '#0F766E',
      description:
        'Automatically capture and verify certificates while browsing',
      steps: [
        {
          step: 1,
          title: 'Install Extension',
          description:
            'Add the Credify browser extension from Chrome Web Store or Firefox Add-ons',
          icon: Download,
        },
        {
          step: 2,
          title: 'Browse Platforms',
          description:
            'Visit supported platforms like HackerRank, Coursera, NPTEL, or LinkedIn Learning',
          icon: Globe,
        },
        {
          step: 3,
          title: 'Auto-Detect Certificates',
          description:
            'Extension automatically detects certificates on the page and highlights them',
          icon: Scan,
        },
        {
          step: 4,
          title: 'One-Click Import',
          description:
            'Click the extension icon and import certificates directly to your Credify profile',
          icon: CheckCircle2,
        },
      ],
      features: [
        'Works on 50+ platforms including HackerRank, Coursera, Udemy, NPTEL',
        'Real-time certificate detection with visual indicators',
        'Bulk import multiple certificates at once',
        'Automatic metadata extraction (title, issuer, date)',
      ],
      timeEstimate: '30 seconds per certificate',
      difficulty: 'Easiest',
      bestFor: 'Online course certificates and coding platform achievements',
    },
    {
      id: 2,
      title: 'Verify with Regulator',
      icon: ShieldCheck,
      accentColor: '#0F766E',
      description: 'Get institutional verification for academic credentials',
      steps: [
        {
          step: 1,
          title: 'Select Institution',
          description:
            'Choose your educational institution from our verified database',
          icon: Database,
        },
        {
          step: 2,
          title: 'Upload Certificate',
          description:
            'Upload your degree/diploma certificate (PDF or image format)',
          icon: Upload,
        },
        {
          step: 3,
          title: 'Fill Details',
          description:
            'Enter credential details like degree name, roll number, graduation year',
          icon: Edit3,
        },
        {
          step: 4,
          title: 'Institutional Review',
          description:
            "Institution's Regulator verifies your credential against their records",
          icon: FileCheck,
        },
        {
          step: 5,
          title: 'Get Verified Badge',
          description:
            'Once approved, receive a verified badge on your credential',
          icon: Award,
        },
      ],
      features: [
        'Direct verification from educational institutions',
        'Trusted by 500+ universities and colleges',
        'Tamper-proof blockchain-backed verification',
        'Shareable verified credential link',
      ],
      timeEstimate: '2-5 business days',
      difficulty: 'Medium',
      bestFor: 'Academic degrees, diplomas, and institutional certificates',
    },
    {
      id: 3,
      title: 'Upload PDF/QR Code',
      icon: Upload,
      accentColor: '#0F766E',
      description:
        'Upload certificate PDFs or scan QR codes for instant verification',
      steps: [
        {
          step: 1,
          title: 'Choose Upload Type',
          description:
            'Select PDF upload or QR code scan based on your certificate type',
          icon: FileCheck,
        },
        {
          step: 2,
          title: 'Upload/Scan',
          description:
            'Drag & drop PDF file or use your camera to scan the QR code',
          icon: Scan,
        },
        {
          step: 3,
          title: 'Data Extraction',
          description:
            'System extracts key information: title, issuer, date, and credential ID',
          icon: Database,
        },
        {
          step: 4,
          title: 'Verify Details',
          description:
            'Review extracted information and make corrections if needed',
          icon: Edit3,
        },
        {
          step: 5,
          title: 'Submit for Validation',
          description:
            "System validates against issuer's database or blockchain records",
          icon: ShieldCheck,
        },
      ],
      features: [
        'OCR technology for automatic data extraction',
        'Supports PDF, PNG, JPG formats',
        'QR code verification for NSDC, Skill India, DigiLocker certificates',
        'Anti-tamper detection using digital signatures',
      ],
      timeEstimate: '2-3 minutes per certificate',
      difficulty: 'Easy',
      bestFor:
        'Government certificates, skill training certificates, PDF certificates',
    },
    {
      id: 4,
      title: 'Verify with Link',
      icon: Link2,
      accentColor: '#0F766E',
      description: 'Verify credentials using public verification URLs',
      steps: [
        {
          step: 1,
          title: 'Get Verification URL',
          description:
            'Copy the public verification link from your certificate email or portal',
          icon: Globe,
        },
        {
          step: 2,
          title: 'Paste Link',
          description: 'Enter the verification URL in the Credify platform',
          icon: Link2,
        },
        {
          step: 3,
          title: 'System Validation',
          description:
            "Our system fetches and validates the certificate from the issuer's server",
          icon: Zap,
        },
        {
          step: 4,
          title: 'Credential Imported',
          description:
            'Verified credential is automatically added to your profile',
          icon: CheckCircle2,
        },
      ],
      features: [
        'Works with any publicly verifiable credential',
        'Real-time validation from source',
        'No file upload needed',
        'Supports platforms like Credly, Accredible, Badgr',
      ],
      timeEstimate: '1 minute per certificate',
      difficulty: 'Easiest',
      bestFor:
        'Digital badges, online certifications with public verification links',
    },
    {
      id: 5,
      title: 'DigiLocker Integration',
      icon: Database,
      accentColor: '#0F766E',
      description:
        'Securely import government-issued certificates from DigiLocker',
      steps: [
        {
          step: 1,
          title: 'Connect DigiLocker',
          description:
            'Authorize Credify to access your DigiLocker account using your Aadhaar credentials',
          icon: Link2,
        },
        {
          step: 2,
          title: 'Select Documents',
          description:
            'Choose which certificates to import from your DigiLocker repository',
          icon: FileCheck,
        },
        {
          step: 3,
          title: 'Automatic Import',
          description:
            'Selected documents are securely imported with government verification',
          icon: Download,
        },
        {
          step: 4,
          title: 'Verified Badge',
          description:
            'Imported certificates receive automatic government-verified status',
          icon: ShieldCheck,
        },
      ],
      features: [
        'Direct access to government-verified documents',
        'Supports marksheets, degrees, PAN card, driving license',
        'No manual upload required',
        'Government-backed authentication and verification',
      ],
      timeEstimate: '2-3 minutes for initial setup',
      difficulty: 'Easy',
      bestFor:
        'Government certificates, educational documents, identity documents',
    },
  ];

  const comparisonData = [
    {
      method: 'Browser Extension',
      speed: 'Instant',
      speedIcon: Zap,
      verification: 'Instant',
      bestUse: 'Online Courses',
    },
    {
      method: 'Verify with Regulator',
      speed: 'Slow',
      speedIcon: Clock,
      verification: 'Institution Verified',
      bestUse: 'Academic Degrees',
    },
    {
      method: 'Upload PDF/QR',
      speed: 'Fast',
      speedIcon: Zap,
      verification: 'OCR + Blockchain',
      bestUse: 'Government Certs',
    },
    {
      method: 'Verify with Link',
      speed: 'Instant',
      speedIcon: Zap,
      verification: 'Real-time',
      bestUse: 'Digital Badges',
    },
    {
      method: 'DigiLocker',
      speed: 'Fast',
      speedIcon: Zap,
      verification: 'Government Verified',
      bestUse: 'Govt Documents',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="How to Upload Credentials"
        description="Learn about the different methods to add and verify your credentials on Credify"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/credentials/add')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Add Credentials
          </Button>
        </motion.div>

        {/* Overview Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#116466]/10 rounded-xl">
              <Info className="h-6 w-6 text-[#116466]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Upload Method
              </h2>
              <p className="text-gray-600">
                Credify offers four powerful methods to add and verify your
                credentials. Each method is designed for specific types of
                credentials and use cases. Select the method that best fits your
                needs.
              </p>
            </div>
          </div>

          {/* Quick Comparison Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0F766E] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Speed
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Verification Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Best For
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.method}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <row.speedIcon className="h-4 w-4 text-[#116466]" />
                        <span className="text-sm text-gray-700">
                          {row.speed}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.verification}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.bestUse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Detailed Method Explanations */}
        <div className="space-y-8">
          {methods.map((method, index) => (
            <motion.section
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border overflow-hidden"
            >
              {/* Method Header */}
              <div className="bg-[#0F766E] px-8 py-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <method.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{method.title}</h3>
                    <p className="text-white/90 text-sm mt-1">
                      {method.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-lg">
                    <div className="text-sm font-semibold">
                      {method.difficulty}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Step-by-Step Guide */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Step-by-Step Process
                  </h4>

                  <div className="space-y-4">
                    {method.steps.map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.step} className="flex gap-4 items-start">
                          {/* Step Icon */}
                          <div className="shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#116466] text-white">
                              <StepIcon className="h-6 w-6" />
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {step.step}. {step.title}
                            </h5>
                            <p className="text-gray-600 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {method.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5 text-[#116466]" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time & Best For */}
                <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5 text-[#116466]" />
                    <span className="text-sm">
                      <span className="font-medium">Time:</span>{' '}
                      {method.timeEstimate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Info className="h-5 w-5 text-[#116466]" />
                    <span className="text-sm">
                      <span className="font-medium">Best for:</span>{' '}
                      {method.bestFor}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-[#116466] rounded-xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-3">
            Ready to Add Your Credentials?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Choose the method that works best for your credentials and start
            building your verified professional profile today.
          </p>
          <Button
            onClick={() => navigate('/credentials/add')}
            className="bg-white text-[#116466] hover:bg-gray-100 font-semibold px-8"
          >
            Start Adding Credentials
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
