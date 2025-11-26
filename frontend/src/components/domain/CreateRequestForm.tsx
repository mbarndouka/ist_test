import React from 'react';
import { FileText } from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { useCreateRequestForm } from '../../hooks';
import { showSuccess, showError } from '../../lib/toast';

interface CreateRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onSuccess, onCancel }) => {
  const {
    formData,
    isSubmitting,
    validationErrors,
    updateField,
    handleSubmit,
    resetForm
  } = useCreateRequestForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleSubmit(() => {
        showSuccess('Request created successfully!');
        onSuccess();
      });
    } catch (error) {
      showError('Failed to create request. Please try again.');
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <div className="mb-10 animate-in slide-in-from-top-4 fade-in duration-300">
      <Card title="New Purchase Request" className="border-l-4 border-l-[#ccff00]">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Request Title"
                placeholder="e.g. Q3 Marketing Software"
                required
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={validationErrors.title}
              />
            </div>
            <div>
              <Input
                label="Estimated Amount (RWF)"
                type="number"
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                error={validationErrors.amount}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Business Justification"
                placeholder="Why is this purchase needed?"
                className="h-full"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                error={validationErrors.description}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Proforma Invoice
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and
                      drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        updateField('proforma_file', e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              {formData.proforma_file && (
                <p className="text-sm text-[#ccff00] font-medium">
                  Selected: {formData.proforma_file.name}
                </p>
              )}
              {validationErrors.proforma_file && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.proforma_file}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-50">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateRequestForm;
