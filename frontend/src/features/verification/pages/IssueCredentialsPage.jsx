import { useState } from 'react';
import { FileText, Plus, Trash2, Send, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import axiosClient from '@services/axiosClient';
import AiChatWrapper from '@features/ai-chat/components/AiChatWrapper.jsx';

const IssueCredentialsPage = () => {
  const [formData, setFormData] = useState({
    credentialName: '',
    issueDate: new Date().toISOString().split('T')[0],
    hours: '',
    nsqfLevel: '',
  });

  const [recipients, setRecipients] = useState([
    { id: 1, name: '', email: '' },
  ]);

  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'csv'

  // Handle credential details change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle recipient change
  const handleRecipientChange = (id, field, value) => {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === id ? { ...recipient, [field]: value } : recipient
      )
    );
  };

  // Add new recipient row
  const addRecipient = () => {
    const newId = Math.max(...recipients.map((r) => r.id), 0) + 1;
    setRecipients((prev) => [...prev, { id: newId, name: '', email: '' }]);
  };

  // Remove recipient row
  const removeRecipient = (id) => {
    if (recipients.length === 1) {
      toast.error('At least one recipient is required');
      return;
    }
    setRecipients((prev) => prev.filter((recipient) => recipient.id !== id));
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    setCsvFile(file);

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          console.error('CSV parsing errors:', results.errors);
          return;
        }

        // Extract name and email, ignore other fields
        const parsedData = results.data
          .map((row, index) => {
            // Try different common column names for name
            const name = row['name'] || row['Name'] || row['full name'] ||
              row['Full Name'] || row['fullname'] || row['FullName'] || '';

            // Try different common column names for email
            const email = row['email'] || row['Email'] || row['EMAIL'] ||
              row['e-mail'] || row['E-mail'] || '';

            if (!name.trim() && !email.trim()) {
              return null; // Skip empty rows
            }

            return {
              id: index + 1,
              name: name.trim(),
              email: email.trim(),
            };
          })
          .filter(Boolean); // Remove null entries

        if (parsedData.length === 0) {
          toast.error('No valid recipients found in CSV. Ensure columns are named "name" and "email"');
          setCsvFile(null);
          return;
        }

        // Validate that we have at least name or email
        const validData = parsedData.filter(r => r.name || r.email);

        if (validData.length === 0) {
          toast.error('CSV must contain "name" and "email" columns');
          setCsvFile(null);
          return;
        }

        setCsvData(validData);
        setUploadMode('csv');
        toast.success(`✅ Loaded ${validData.length} recipients from CSV`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      },
    });
  };

  // Remove CSV file
  const removeCsvFile = () => {
    setCsvFile(null);
    setCsvData([]);
    setUploadMode('manual');
    toast.success('CSV file removed');
  };

  // Switch to manual mode
  const switchToManual = () => {
    setUploadMode('manual');
    setCsvFile(null);
    setCsvData([]);
  };

  // Switch to CSV mode
  const switchToCsv = () => {
    setUploadMode('csv');
  };

  // Validate form
  const validateForm = () => {
    if (!formData.credentialName.trim()) {
      toast.error('Please enter credential name');
      return false;
    }
    if (!formData.issueDate) {
      toast.error('Please select issue date');
      return false;
    }
    if (!formData.hours || formData.hours <= 0) {
      toast.error('Please enter valid hours');
      return false;
    }
    if (!formData.nsqfLevel || formData.nsqfLevel < 1 || formData.nsqfLevel > 10) {
      toast.error('Please enter valid NSQF level (1-10)');
      return false;
    }

    // Validate recipients based on mode
    if (uploadMode === 'csv') {
      if (csvData.length === 0) {
        toast.error('Please upload a CSV file with recipients');
        return false;
      }

      // Validate email format for CSV data
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const recipient of csvData) {
        if (!recipient.name || !recipient.name.trim()) {
          toast.error('All recipients must have a name');
          return false;
        }
        if (!recipient.email || !recipient.email.trim()) {
          toast.error('All recipients must have an email');
          return false;
        }
        if (!emailRegex.test(recipient.email)) {
          toast.error(`Invalid email format: ${recipient.email}`);
          return false;
        }
      }
    } else {
      // Manual mode validation
      const validRecipients = recipients.filter(
        (r) => r.name.trim() && r.email.trim()
      );
      if (validRecipients.length === 0) {
        toast.error('Please add at least one recipient with name and email');
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const recipient of validRecipients) {
        if (!emailRegex.test(recipient.email)) {
          toast.error(`Invalid email format: ${recipient.email}`);
          return false;
        }
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get recipients based on mode
    const validRecipients = uploadMode === 'csv'
      ? csvData.map((r) => ({ name: r.name.trim(), email: r.email.trim() }))
      : recipients
        .filter((r) => r.name.trim() && r.email.trim())
        .map((r) => ({ name: r.name.trim(), email: r.email.trim() }));

    // Show immediate success toast
    toast.success(
      `✅ ${validRecipients.length} credential(s) will be created!`,
      { duration: 4000 }
    );

    // Reset form immediately
    setFormData({
      credentialName: '',
      issueDate: new Date().toISOString().split('T')[0],
      hours: '',
      nsqfLevel: '',
    });
    setRecipients([{ id: 1, name: '', email: '' }]);
    setCsvFile(null);
    setCsvData([]);
    setUploadMode('manual');

    // Send request to backend (fire and forget - admin is free to continue)
    axiosClient.post('/credentials/bulk-issue', {
      credentialData: {
        credentialName: formData.credentialName,
        issueDate: formData.issueDate,
        hours: parseInt(formData.hours),
        nsqfLevel: parseInt(formData.nsqfLevel),
      },
      recipients: validRecipients,
    }).catch((error) => {
      console.error('Failed to issue credentials:', error);
      // Silently log error - admin already moved on
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">Issue Credentials</h1>
          </div>
          <p className="text-gray-600">
            Generate and send credential certificates to multiple recipients via email
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Credential Details Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Credential Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Micro-Credential Name *
                  </label>
                  <input
                    type="text"
                    name="credentialName"
                    value={formData.credentialName}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development Fundamentals"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours *
                  </label>
                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 40"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NSQF Level * (1-10)
                  </label>
                  <input
                    type="number"
                    name="nsqfLevel"
                    value={formData.nsqfLevel}
                    onChange={handleInputChange}
                    placeholder="e.g., 4"
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Upload Mode Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Add Recipients
              </h2>

              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={switchToManual}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${uploadMode === 'manual'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-semibold'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={switchToCsv}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${uploadMode === 'csv'
                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-semibold'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload CSV
                </button>
              </div>

              {/* CSV Upload Section */}
              {uploadMode === 'csv' && (
                <div className="space-y-4">
                  {!csvFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <span className="text-teal-600 hover:text-teal-700 font-semibold">
                          Click to upload CSV file
                        </span>
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        CSV should contain columns: <strong>name</strong> and <strong>email</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="font-semibold text-gray-800">{csvFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {csvData.length} recipient{csvData.length !== 1 ? 's' : ''} loaded
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCsvFile}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Preview CSV Data */}
                      <div className="max-h-60 overflow-y-auto bg-white rounded-lg p-3 border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-600">#</th>
                              <th className="px-3 py-2 text-left text-gray-600">Name</th>
                              <th className="px-3 py-2 text-left text-gray-600">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvData.map((recipient, index) => (
                              <tr key={index} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                                <td className="px-3 py-2 text-gray-800">{recipient.name}</td>
                                <td className="px-3 py-2 text-gray-600">{recipient.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recipients Section - Manual Entry */}
            {uploadMode === 'manual' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Recipients</h2>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Recipient
                  </button>
                </div>

                <div className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <motion.div
                      key={recipient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) =>
                          handleRecipientChange(recipient.id, 'name', e.target.value)
                        }
                        placeholder="Full Name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) =>
                          handleRecipientChange(recipient.id, 'email', e.target.value)
                        }
                        placeholder="email@example.com"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={recipients.length === 1}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    credentialName: '',
                    issueDate: new Date().toISOString().split('T')[0],
                    hours: '',
                    nsqfLevel: '',
                  });
                  setRecipients([{ id: 1, name: '', email: '' }]);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Send className="w-5 h-5" />
                Issue Credentials
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="font-semibold text-blue-900 mb-2">📧 How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fill in the credential details that will be common for all recipients</li>
            <li>• Add recipients manually or upload a CSV file with name and email columns</li>
            <li>
              • Each recipient will receive a personalized PDF certificate via email to{' '}
              <strong>piyushtest10067@gmail.com</strong>
            </li>
            <li>• The certificate will be generated with the format provided by WEV DEV LOPED BY TO BOOT CAMP</li>
            <li>• CSV format: First row should have headers "name" and "email", subsequent rows contain recipient data</li>
          </ul>
        </motion.div>
      </div>

      <AiChatWrapper />
    </div>
  );
};

export default IssueCredentialsPage;
