import { useState } from 'react';
import { FileText, Plus, Trash2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosClient from '@services/axiosClient';

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

    // Validate recipients
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

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty recipients
    const validRecipients = recipients
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

              {/* Recipients Section */}
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
            <li>• Add recipients by entering their name and email address</li>
            <li>
              • Each recipient will receive a personalized PDF certificate via email to{' '}
              <strong>piyushtest10067@gmail.com</strong>
            </li>
            <li>• The certificate will be generated with the format provided by WEV DEV LOPED BY TO BOOT CAMP</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default IssueCredentialsPage;
