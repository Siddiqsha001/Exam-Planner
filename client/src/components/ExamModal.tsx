'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { examAPI, subjectAPI } from '@/lib/api';
import { X } from 'lucide-react';

const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface Subject {
  _id: string;
  name: string;
  color: string;
}

interface ExamModalProps {
  exam?: {
    _id: string;
    title: string;
    subject: string | { _id: string; name: string };
    date: string;
    description?: string;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ExamModal({ exam, onClose, onSave }: Readonly<ExamModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectAPI.getSubjects();
        setSubjects(response.data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
    };
    
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (exam) {
      const subjectId = typeof exam.subject === 'string' ? exam.subject : exam.subject._id;
      reset({
        title: exam.title,
        subject: subjectId,
        date: exam.date.split('T')[0], // Format date for input
        description: exam.description || '',
      });
    } else {
      reset({
        title: '',
        subject: '',
        date: '',
        description: '',
      });
    }
  }, [exam, reset]);

  const onSubmit = async (data: ExamFormData) => {
    setLoading(true);
    setError('');
    
    // Debug logging
    if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
      console.log('ExamModal: Submitting data:', data);
    }
    
    try {
      if (exam) {
        await examAPI.updateExam(exam._id, data);
      } else {
        await examAPI.createExam(data);
      }
      onSave();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save exam';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-modal rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {exam ? 'Edit Exam' : 'Add New Exam'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exam Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-field"
              placeholder="e.g., Final Exam - Mathematics"
            />
            {errors.title && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              {...register('subject')}
              className="input-field"
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exam Date
            </label>
            <input
              {...register('date')}
              type="date"
              className="input-field"
            />
            {errors.date && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="input-field resize-none min-h-[80px]"
              placeholder="Additional notes about the exam..."
            />
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
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(() => {
                if (loading) return 'Saving...';
                if (exam) return 'Update';
                return 'Create';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
