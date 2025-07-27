'use client';

import { useState, useEffect } from 'react';
import { examAPI, studySessionAPI, subjectAPI } from '@/lib/api';
import ExamModal from '@/components/ExamModal';
import StudySessionModal from '@/components/StudySessionModal';
import SubjectModal from '@/components/SubjectModal';
import PomodoroTimer from '@/components/PomodoroTimer';
import { Calendar, Clock, Target, Plus, BookOpen, Eye, EyeOff } from 'lucide-react';

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

interface StudySession {
  _id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  completed: boolean;
  exam?: Exam;
  subject?: Subject;
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showStudySessionModal, setShowStudySessionModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedStudySession, setSelectedStudySession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsResponse, examsResponse, sessionsResponse] = await Promise.all([
        subjectAPI.getSubjects(),
        examAPI.getExams(),
        studySessionAPI.getStudySessions()
      ]);
      setSubjects(subjectsResponse.data);
      setExams(examsResponse.data);
      setStudySessions(sessionsResponse.data);
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

  const handleCreateStudySession = () => {
    setSelectedStudySession(null);
    setShowStudySessionModal(true);
  };

  const handleEditStudySession = (session: StudySession) => {
    setSelectedStudySession(session);
    setShowStudySessionModal(true);
  };

  const handleToggleSession = async (sessionId: string) => {
    try {
      await studySessionAPI.toggleSession(sessionId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle session:', error);
    }
  };

  const handleToggleSubject = async (subjectId: string) => {
    try {
      await subjectAPI.toggleSubject(subjectId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle subject:', error);
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

  // Convert session data for modal
  const convertSessionForModal = (session: StudySession | null) => {
    if (!session) return null;
    return {
      _id: session._id,
      title: session.title,
      subject: session.subject?._id || '',
      startTime: session.date,
      endTime: new Date(new Date(session.date).getTime() + session.duration * 60000).toISOString(),
      completed: session.completed
    };
  };

  // Filter data based on hideCompleted setting
  const filteredSubjects = hideCompleted ? subjects.filter(s => !s.completed) : subjects;
  const filteredExams = hideCompleted 
    ? exams.filter(e => !e.completed && (!e.subject?.completed))
    : exams;

  const upcomingExams = filteredExams
    .filter(exam => new Date(exam.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const todaySessions = studySessions.filter(session => {
    const sessionDate = new Date(session.date).toDateString();
    const today = new Date().toDateString();
    const shouldShow = sessionDate === today;
    if (hideCompleted && session.completed) return false;
    if (hideCompleted && session.subject?.completed) return false;
    return shouldShow;
  });

  const completedSessions = studySessions.filter(session => session.completed).length;
  const totalSessions = studySessions.length;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

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
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={hideCompleted ? "Show completed items" : "Hide completed items"}
        >
          {hideCompleted ? (
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {hideCompleted ? 'Show All' : 'Hide Completed'}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaySessions.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(completionRate)}%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <button
          onClick={handleCreateStudySession}
          className="glass-card flex items-center justify-center p-6 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl hover:border-green-400 dark:hover:border-green-600 transition-all group"
        >
          <Plus className="h-6 w-6 text-green-600 dark:text-green-400 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-green-600 dark:text-green-400 font-medium">Add Study Session</span>
        </button>
      </div>

      {/* Subjects Overview */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
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
                  role="button"
                  tabIndex={0}
                  className={`p-4 border-2 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                    subject.completed 
                      ? 'border-gray-200 dark:border-gray-700 opacity-75' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${hideCompleted && subject.completed ? 'blur-sm' : ''}`}
                  onClick={() => handleEditSubject(subject)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEditSubject(subject);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <h4 className={`font-medium ${subject.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {subject.name}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSubject(subject._id);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        subject.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                      }`}
                    >
                      {subject.completed && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {subject.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{subject.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {exams.filter(e => e.subject?._id === subject._id).length} exams
                    </span>
                    <span>
                      {studySessions.filter(s => s.subject?._id === subject._id).length} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pomodoro Timer</h3>
        <PomodoroTimer />
      </div>

      {/* Upcoming Exams */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
        </div>
        <div className="p-6">
          {upcomingExams.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No upcoming exams scheduled</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add your first exam to start planning your study timeline
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEditExam(exam)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEditExam(exam);
                    }
                  }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Study Sessions */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s Study Sessions</h3>
        </div>
        <div className="p-6">
          {todaySessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No study sessions scheduled for today</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Plan your study sessions to stay on track with your exam preparation
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleSession(session._id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        session.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                      }`}
                    >
                      {session.completed && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {session.subject && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: session.subject.color }}
                      ></div>
                    )}
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => handleEditStudySession(session)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEditStudySession(session);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <h4 className={`font-medium ${session.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {session.title}
                      </h4>
                      {session.subject && (
                        <p className="text-xs text-gray-500">{session.subject.name}</p>
                      )}
                      {session.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{session.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.duration} minutes
                    </p>
                    {session.exam && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        For: {session.exam.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {showStudySessionModal && (
        <StudySessionModal
          session={convertSessionForModal(selectedStudySession)}
          onClose={() => setShowStudySessionModal(false)}
          onSave={() => {
            fetchData();
            setShowStudySessionModal(false);
          }}
        />
      )}
    </div>
  );
}
