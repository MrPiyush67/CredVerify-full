import { motion } from 'framer-motion';
import { Save, Send } from 'lucide-react';
import { Input } from '@common/ui/Input.jsx';
import { Textarea } from '@common/ui/Textarea.jsx';
import { Button } from '@common/ui/Button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@common/ui/Select.jsx';

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

export default function JobForm({ formData, onChange, handleSubmit, loading, errors, isEdit }) {
  const fields = [
    {
      name: 'title',
      label: 'Job Title',
      type: 'text',
      placeholder: 'e.g., Senior Software Engineer',
      required: true,
      fullWidth: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Provide a detailed description of the role...',
      required: true,
      fullWidth: true,
      rows: 4
    },
    {
      name: 'requirements',
      label: 'Requirements',
      type: 'textarea',
      placeholder: 'List the key requirements for this position...',
      required: true,
      fullWidth: true,
      rows: 3
    },
    {
      name: 'skills',
      label: 'Skills (comma-separated)',
      type: 'text',
      placeholder: 'React, Node.js, MongoDB, AWS',
      required: true,
      fullWidth: true
    },
    {
      name: 'jobType',
      label: 'Job Type',
      type: 'select',
      options: [
        { value: 'full-time', label: 'Full-Time' },
        { value: 'part-time', label: 'Part-Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' }
      ],
      required: true
    },
    {
      name: 'experienceLevel',
      label: 'Experience Level',
      type: 'select',
      options: [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'lead', label: 'Lead/Principal' }
      ],
      required: true
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'e.g., Remote, New York, NY',
      required: true
    },
    {
      name: 'salaryMin',
      label: 'Minimum Salary',
      type: 'number',
      placeholder: '50000'
    },
    {
      name: 'salaryMax',
      label: 'Maximum Salary',
      type: 'number',
      placeholder: '80000'
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      options: [
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' }
      ],
      required: true
    },
    {
      name: 'applicationDeadline',
      label: 'Application Deadline',
      type: 'date',
      required: true
    }
  ];

  const renderField = (field, index) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: onChange,
      required: field.required,
      placeholder: field.placeholder
    };

    return (
      <motion.div
        key={field.name}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={fieldVariants}
        className={field.fullWidth ? 'col-span-2' : ''}
      >
        <label htmlFor={field.name} className="block text-sm font-medium mb-2">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>

        {field.type === 'textarea' ? (
          <Textarea {...commonProps} rows={field.rows} />
        ) : field.type === 'select' ? (
          <Select
            value={formData[field.name]}
            onValueChange={(value) =>
              onChange({ target: { name: field.name, value } })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ) : (
          <Input {...commonProps} type={field.type} />
        )}
      </motion.div>
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit('active'); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => renderField(field, index))}
      </div>

      {/* Error Display */}
      {errors?.action && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {errors.action}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={loading?.action}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={loading?.action}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isEdit ? 'Update Job' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
}
