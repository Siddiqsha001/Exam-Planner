'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subjectAPI } from '@/lib/api';
import { Check, Palette, X } from 'lucide-react';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectModalProps {
  subject?: {
    _id: string;
    name: string;
    description?: string;
    color?: string;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

const colorOptions = [
  '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
  '#10B981', '#F97316', '#EC4899', '#06B6D4',
  '#84CC16', '#6366F1', '#14B8A6', '#F43F5E'
];

export default function SubjectModal({ subject, onClose, onSave }: Readonly<SubjectModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        description: subject.description || '',
        color: subject.color || '#3B82F6',
      });
      setSelectedColor(subject.color || '#3B82F6');
    } else {
      reset({
        name: '',
        description: '',
        color: '#3B82F6',
      });
      setSelectedColor('#3B82F6');
    }
  }, [subject, reset]);

  const onSubmit = async (data: SubjectFormData) => {
    setLoading(true);
    setError('');
    
    try {
      const submitData = { ...data, color: selectedColor };
      if (subject) {
        await subjectAPI.updateSubject(subject._id, submitData);
      } else {
        await subjectAPI.createSubject(submitData);
      }
      onSave();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save subject';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-modal rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {subject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="input-field"
              placeholder="e.g., Mathematics"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Brief description about this subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Palette className="inline h-4 w-4 mr-2" />
              Subject Color
            </label>
            <div className="grid grid-cols-6 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 relative ${
                    selectedColor === color 
                      ? 'border-gray-800 dark:border-white shadow-lg scale-110' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {(() => {
                if (loading) return 'Saving...';
                if (subject) return 'Update';
                return 'Create';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
