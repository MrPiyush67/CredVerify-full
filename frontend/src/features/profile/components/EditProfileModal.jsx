import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Save, Loader2, Plus, Trash2, Briefcase, GraduationCap, Award, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@common/ui/Button.jsx';
import { updateUserProfile, fetchUserProfile } from '../redux/profileSlice.js';

export default function EditProfileModal({ isOpen, onClose, user }) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    phone: '',
    isPublic: true,
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    },
    skills: [],
    experience: [],
    education: [],
    achievements: []
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phoneNo || user.phone || '',
        isPublic: user.isPublic !== undefined ? user.isPublic : true,
        socialLinks: user.socialLinks || {
          linkedin: '',
          github: '',
          twitter: '',
          website: ''
        },
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        achievements: user.achievements || []
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Transform form data to match backend schema
    const { phone, ...rest } = formData;
    const backendData = {
      ...rest,
      phoneNo: phone, // Backend expects phoneNo, not phone
    };

    console.log('Submitting profile update with data:', backendData);

    try {
      const result = await dispatch(updateUserProfile(backendData)).unwrap();
      console.log('Profile update result:', result);
      // Refetch the profile to ensure all data is synced
      const refreshedProfile = await dispatch(fetchUserProfile()).unwrap();
      console.log('Refreshed profile:', refreshedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile: ' + (error.message || error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, skills });
  };

  // Experience handlers
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { position: '', company: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  // Education handlers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }]
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  // Achievement handlers
  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, { title: '', issuer: '', date: '', description: '' }]
    });
  };

  const updateAchievement = (index, field, value) => {
    const updated = [...formData.achievements];
    updated[index][field] = value;
    setFormData({ ...formData, achievements: updated });
  };

  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your profile information (Name cannot be changed)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Read-only Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Cannot be changed)
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="url"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={handleChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="GitHub URL"
                  />
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={formData.socialLinks.website}
                    onChange={handleChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Website URL"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="React, Node.js, Python, etc."
                />
              </div>

              {/* Visibility */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.isPublic ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formData.isPublic ? 'Your profile is visible to everyone' : 'Your profile is private'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPublic ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Experience Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {formData.experience.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No experience added yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-700">Experience #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Position"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Company"
                          />
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Start Date (e.g., Jan 2020)"
                          />
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="End Date (e.g., Present)"
                          />
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {formData.education.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No education added yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-700">Education #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Institution"
                          />
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Degree"
                          />
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Field of Study"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={edu.startYear}
                              onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="Start Year"
                            />
                            <input
                              type="text"
                              value={edu.endYear}
                              onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="End Year"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAchievement}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {formData.achievements.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No achievements added yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-700">Achievement #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAchievement(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Achievement Title"
                          />
                          <input
                            type="text"
                            value={achievement.issuer}
                            onChange={(e) => updateAchievement(index, 'issuer', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Issuer"
                          />
                          <input
                            type="text"
                            value={achievement.date}
                            onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Date (e.g., Dec 2023)"
                          />
                        </div>
                        <textarea
                          value={achievement.description}
                          onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note about credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Credentials cannot be edited from profile. Please use the Credentials page to manage your credentials.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
