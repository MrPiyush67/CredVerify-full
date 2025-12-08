import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Input, Button } from '@common';
import { INDIAN_INSTITUTIONS } from '../constants/institutions.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegulatorVerificationModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    certificateName: '',
    institution: '',
    type: 'degree',
    issueDate: '',
    file: null,
    learnerComments: '',
  });
  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);

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
        file: 'Only PDF, JPEG, PNG files are allowed'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setFilePreview(file.name);
    setErrors(prev => ({ ...prev, file: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Credential title is required';
    }
    if (!formData.institution) {
      newErrors.institution = 'Please select an institution';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }
    if (!formData.file) {
      newErrors.file = 'Please upload a document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert file to base64 for backend
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result; // This includes the data:image/xxx;base64, prefix

      // Prepare credential data as JSON (not FormData)
      const credentialData = {
        title: formData.title,
        certificateName: formData.certificateName || formData.title,
        legalNameSnapshot: formData.certificateName || formData.title,
        institution: formData.institution,
        issuer: formData.institution,
        type: formData.type,
        issueDate: formData.issueDate,
        verificationNotes: formData.learnerComments || '',
        status: 'pending',
        verificationRequested: true,
        // Store file as base64 data URL
        fileBase64: base64Data,
        fileName: formData.file.name,
        fileType: formData.file.type,
        fileSize: formData.file.size,
      };

      onSubmit(credentialData);
      handleClose();
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setErrors(prev => ({ ...prev, file: 'Failed to read file' }));
    };

    // Read file as data URL (base64)
    reader.readAsDataURL(formData.file);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      certificateName: '',
      institution: '',
      type: 'degree',
      issueDate: '',
      file: null,
      learnerComments: '',
    });
    setErrors({});
    setFilePreview(null);
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Verify with Regulator</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your academic credential for institutional verification
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Info Banner */}
              <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Upload your academic document (degree, certificate, etc.)</li>
                    <li>Select your institution/college</li>
                    <li>Your credential will be added as "Unverified"</li>
                    <li>The regulator from your institution will review and verify</li>
                    <li>Once approved, your credential status changes to "Verified"</li>
                  </ol>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Credential Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Bachelor of Technology in Computer Science"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution / College <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.institution ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select your institution</option>
                    {INDIAN_INSTITUTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                  {errors.institution && (
                    <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
                  )}
                </div>

                {/* Credential Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="degree">Degree</option>
                    <option value="certificate">Certificate</option>
                    <option value="micro_credential">Micro Credential</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.issueDate ? 'border-red-500' : ''}
                  />
                  {errors.issueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      {filePreview ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-green-600 mb-2" />
                          <p className="text-sm text-gray-600 font-medium">{filePreview}</p>
                          <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG (max 5MB)</p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                  )}
                </div>

                {/* Comments for Regulator */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments for Regulator (Optional)
                  </label>
                  <textarea
                    value={formData.learnerComments}
                    onChange={(e) => handleInputChange('learnerComments', e.target.value)}
                    placeholder="Add any additional information or context for the regulator..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {formData.learnerComments.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#116466] text-white hover:bg-[#0e4f50]"
                  >
                    Submit for Verification
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
