import { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, Link as LinkIcon, Building2, Loader2 } from 'lucide-react';
import { Input, Button } from '@common';
import { motion, AnimatePresence } from 'framer-motion';
import organizationApi from '../api/organizationApi.js';

export default function OrganizationVerificationModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    companyName: '',
    certificateFile: null,
    courseUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch companies when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await organizationApi.getCompanies();
      if (response.success) {
        setCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to load organizations. Please try again.'
      }));
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        certificateFile: 'Only PDF, JPEG, PNG files are allowed'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        certificateFile: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({ ...prev, certificateFile: file }));
    setFilePreview(file.name);
    setErrors(prev => ({ ...prev, certificateFile: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName) {
      newErrors.companyName = 'Please select an organization';
    }
    if (!formData.certificateFile) {
      newErrors.certificateFile = 'Please upload a certificate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    // Convert file to base64 for backend
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = reader.result; // This includes the data:image/xxx;base64, prefix

        // Prepare verification data as JSON
        const verificationData = {
          companyName: formData.companyName,
          certificateImageBase64: base64Data,
          courseUrl: formData.courseUrl.trim() || null,
          fileName: formData.certificateFile.name,
          fileType: formData.certificateFile.type,
          fileSize: formData.certificateFile.size,
        };

        // Call the verification API
        const response = await organizationApi.verifyWithOrganization(verificationData);

        if (response.success) {
          // Pass the result to parent component
          onSubmit({
            ...response.data,
            uploadMethod: 'Organization Verification',
            companyName: formData.companyName,
            courseUrl: formData.courseUrl,
          });
          handleClose();
        } else {
          setErrors(prev => ({
            ...prev,
            general: response.message || 'Verification failed. Please try again.'
          }));
        }
      } catch (error) {
        console.error('Verification error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to verify certificate';
        setErrors(prev => ({ ...prev, general: errorMessage }));
      } finally {
        setIsSubmitting(false);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setErrors(prev => ({ ...prev, certificateFile: 'Failed to read file' }));
      setIsSubmitting(false);
    };

    // Read file as data URL (base64)
    reader.readAsDataURL(formData.certificateFile);
  };

  const handleClose = () => {
    setFormData({
      companyName: '',
      certificateFile: null,
      courseUrl: '',
    });
    setErrors({});
    setFilePreview(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-[#116466]/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#116466]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#116466]">Organization Verification</h2>
                    <p className="text-sm text-muted-foreground">Verify certificates from registered organizations</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* General Error Alert */}
                {errors.general && (
                  <div className="p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Verification Error</p>
                      <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* Info Alert */}
                <div className="p-4 rounded-md bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">How Organization Verification Works</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Select the organization that issued your certificate</li>
                      <li>Upload your certificate image or PDF</li>
                      <li>We'll verify it against our organization database using OCR and matching</li>
                      <li>Verified certificates are automatically added to your portfolio</li>
                    </ul>
                  </div>
                </div>

                {/* Organization Selector */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCompanies ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading organizations...
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                      No organizations found. Please ensure the backend has processed some certificates first.
                    </div>
                  ) : (
                    <select
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#116466] ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select an organization</option>
                      {companies.map((company) => (
                        <option key={company.name} value={company.name}>
                          {company.name} ({company.count} {company.count === 1 ? 'certificate' : 'certificates'})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>

                {/* Certificate Upload */}
                <div>
                  <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Document <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="certificateFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="certificateFile"
                      className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                        errors.certificateFile
                          ? 'border-red-300 bg-red-50 hover:bg-red-100'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-center">
                        {filePreview ? (
                          <>
                            <FileText className="mx-auto h-12 w-12 text-[#116466]" />
                            <p className="mt-2 text-sm font-medium text-gray-900">{filePreview}</p>
                            <p className="mt-1 text-xs text-gray-500">Click to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-semibold text-[#116466]">Click to upload</span> or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPEG (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors.certificateFile && (
                    <p className="mt-1 text-sm text-red-600">{errors.certificateFile}</p>
                  )}
                </div>

                {/* Course URL (Optional) */}
                <div>
                  <label htmlFor="courseUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Link (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="courseUrl"
                      type="url"
                      placeholder="https://example.com/course/..."
                      value={formData.courseUrl}
                      onChange={(e) => handleInputChange('courseUrl', e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Add course URL for NCrF/NSQF level analysis (from Coursera, NPTEL, etc.)
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#116466] text-white hover:bg-[#0d4d4f]"
                    disabled={isSubmitting || isLoadingCompanies}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Certificate'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
