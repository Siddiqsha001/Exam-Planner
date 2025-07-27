'use client';

import { useState, useEffect } from 'react';
import { examAPI, subjectAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ExamModal from './ExamModal';
import SubjectModal from './SubjectModal';
import PomodoroTimer from './PomodoroTimer';
import { Calendar, Plus, BookOpen, LogOut } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  description?: string;
  color: string;
  completed: boolean;
}

interface Exam {
  _id: string;
  title: string;
  date: string;
  description?: string;
  subject?: Subject;
  completed: boolean;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsResponse, examsResponse] = await Promise.all([
        subjectAPI.getSubjects(),
        examAPI.getExams()
      ]);
      
      setSubjects(subjectsResponse.data);
      setExams(examsResponse.data);
      
      // Debug logging
      if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
        console.log('Dashboard: Fetched data - Subjects:', subjectsResponse.data.length, 'Exams:', examsResponse.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowSubjectModal(true);
  };

  const handleCreateExam = () => {
    setSelectedExam(null);
    setShowExamModal(true);
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowExamModal(true);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await subjectAPI.deleteSubject(subjectId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  // Convert exam data for modal
  const convertExamForModal = (exam: Exam | null) => {
    if (!exam) return null;
    return {
      _id: exam._id,
      title: exam.title,
      subject: exam.subject?._id || '',
      date: exam.date,
      description: exam.description
    };
  };

  // Filter data - show all subjects and non-completed exams
  const filteredSubjects = subjects;
  const filteredExams = exams.filter(e => !e.completed && (!e.subject?.completed));

  // Debug logging for filtering
  if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
    console.log('Dashboard Filter Debug:', {
      totalExams: exams.length,
      filteredExams: filteredExams.length,
      examsData: exams
    });
  }

  const upcomingExams = filteredExams
    .filter(exam => {
      const examDate = new Date(exam.date);
      const today = new Date();
      // Reset time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      
      const isUpcoming = examDate >= today;
      
      // Debug logging
      if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
        console.log('Exam Filter Debug:', {
          title: exam.title,
          originalDate: exam.date,
          parsedDate: examDate,
          today: today,
          isUpcoming: isUpcoming,
          daysDiff: Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
      
      return isUpcoming;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Debug the final result
  if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
    console.log('Dashboard: Final upcomingExams array:', upcomingExams);
    console.log('Dashboard: upcomingExams.length:', upcomingExams.length);
    if (upcomingExams.length > 0) {
      console.log('Dashboard: First exam structure:', JSON.stringify(upcomingExams[0], null, 2));
    }
  }

  // Debug logging right before render
  if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
    console.log('Dashboard Render State:', {
      exams: exams.length,
      filteredExams: filteredExams.length,
      upcomingExams: upcomingExams.length,
      upcomingExamsData: upcomingExams
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Study Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your exam preparation and study progress
          </p>
        </div>
        
        {/* Header Controls */}
        <div className="flex items-center space-x-3">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSubjects.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingExams.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={handleCreateSubject}
          className="glass-card flex items-center justify-center p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Add New Subject</span>
        </button>

        <button
          onClick={handleCreateExam}
          className="glass-card flex items-center justify-center p-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
        >
          <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-blue-600 dark:text-blue-400 font-medium">Add New Exam</span>
        </button>
      </div>

      {/* Subjects Overview */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full h-fit">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Subjects</h3>
        </div>
        <div className="p-6">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No subjects added yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add your first subject to get started with your study plan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4 border-2 rounded-xl transition-all hover:shadow-md cursor-pointer border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  onClick={() => handleEditSubject(subject)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEditSubject(subject);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject._id);
                      }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-red-300 dark:border-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white"
                      title="Delete subject"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subject.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {exams.filter(e => e.subject?._id === subject._id).length} exams
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full h-fit">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
        </div>
        <div className="p-6">
          {(() => {
            // Debug UI rendering
            if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
              console.log('UI Render Check: upcomingExams.length =', upcomingExams.length);
              console.log('UI Render Check: upcomingExams =', upcomingExams);
              console.log('UI Render Check: upcomingExams.length === 0 ?', upcomingExams.length === 0);
              console.log('UI Render Check: Will render empty state?', upcomingExams.length === 0);
            }
            
            if (upcomingExams.length === 0) {
              if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
                console.log('UI: Rendering empty state for upcoming exams');
              }
              return (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming exams scheduled</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Add your first exam to start planning your study timeline
                  </p>
                </div>
              );
            } else {
              if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
                console.log('UI: Rendering exam list with', upcomingExams.length, 'exams');
                console.log('UI: First exam data:', upcomingExams[0]);
              }
              return (
                <div className="space-y-3">
                  {upcomingExams.map((exam, index) => {
                    if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
                      console.log(`UI: Rendering exam ${index}:`, exam.title, exam._id);
                    }
                    return (
                      <button
                        key={exam._id}
                        onClick={() => handleEditExam(exam)}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          {exam.subject && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: exam.subject.color }}
                            ></div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{exam.title}</h4>
                            {exam.subject && (
                              <p className="text-xs text-gray-500">{exam.subject.name}</p>
                            )}
                            {exam.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{exam.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {new Date(exam.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pomodoro Timer</h3>
        <PomodoroTimer />
      </div>

      {/* Modals */}
      {showSubjectModal && (
        <SubjectModal
          subject={selectedSubject}
          onClose={() => setShowSubjectModal(false)}
          onSave={() => {
            fetchData();
            setShowSubjectModal(false);
          }}
        />
      )}

      {showExamModal && (
        <ExamModal
          exam={convertExamForModal(selectedExam)}
          onClose={() => setShowExamModal(false)}
          onSave={() => {
            fetchData();
            setShowExamModal(false);
          }}
        />
      )}
    </div>
  );
}
