'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { studySessionAPI, subjectAPI } from '@/lib/api';
import { X } from 'lucide-react';

const studySessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type StudySessionFormData = z.infer<typeof studySessionSchema>;

interface Subject {
  _id: string;
  name: string;
  color: string;
}

interface StudySessionModalProps {
  session?: {
    _id: string;
    title: string;
    subject: string | { _id: string; name: string };
    startTime: string;
    endTime: string;
    completed: boolean;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

export default function StudySessionModal({ session, onClose, onSave }: Readonly<StudySessionModalProps>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudySessionFormData>({
    resolver: zodResolver(studySessionSchema),
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
    if (session) {
      // Format datetime for input fields
      const startTime = new Date(session.startTime).toISOString().slice(0, 16);
      const endTime = new Date(session.endTime).toISOString().slice(0, 16);
      const subjectId = typeof session.subject === 'string' ? session.subject : session.subject._id;
      
      reset({
        title: session.title,
        subject: subjectId,
        startTime,
        endTime,
      });
    } else {
      // Set default times
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      reset({
        title: '',
        subject: '',
        startTime: now.toISOString().slice(0, 16),
        endTime: oneHourLater.toISOString().slice(0, 16),
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: StudySessionFormData) => {
    setLoading(true);
    setError('');
    
    try {
      // Transform the data to match StudySessionData interface
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      const sessionData = {
        title: data.title,
        subject: data.subject,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: '', // Optional field
      };

      if (session) {
        await studySessionAPI.updateStudySession(session._id, sessionData);
      } else {
        await studySessionAPI.createStudySession(sessionData);
      }
      onSave();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to save study session';
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
            {session ? 'Edit Study Session' : 'Add Study Session'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-field"
              placeholder="e.g., Study Chapter 5 - Algebra"
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
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              {...register('startTime')}
              type="datetime-local"
              className="input-field"
            />
            {errors.startTime && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <input
              {...register('endTime')}
              type="datetime-local"
              className="input-field"
            />
            {errors.endTime && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.endTime.message}</p>
            )}
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
                if (session) return 'Update';
                return 'Create';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
