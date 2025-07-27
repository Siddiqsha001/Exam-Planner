'use client';

import { useState, useEffect } from 'react';
import { pomodoroAPI } from '@/lib/api';
import { Clock, Calendar, TrendingUp, BarChart2, Target, Trophy } from 'lucide-react';

interface PomodoroSession {
  _id: string;
  duration: number;
  type: string;
  studySession?: {
    title: string;
  };
  subject?: {
    name: string;
    color: string;
  };
  exam?: {
    title: string;
  };
  completedAt: string;
}

interface PomodoroStats {
  today: {
    totalSessions: number;
    totalMinutes: number;
  };
  weekly: Array<{
    _id: string;
    sessions: number;
    minutes: number;
  }>;
}

export default function PomodoroRecords() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResponse, statsResponse] = await Promise.all([
        pomodoroAPI.getSessions(),
        pomodoroAPI.getStats(),
      ]);
      setSessions(sessionsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch pomodoro data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupSessionsByDate = (sessions: PomodoroSession[]) => {
    const grouped: { [key: string]: PomodoroSession[] } = {};
    sessions.forEach(session => {
      const date = new Date(session.completedAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedSessions = groupSessionsByDate(sessions.filter(s => s.type === 'focus'));
  const totalSessions = sessions.filter(s => s.type === 'focus').length;
  const totalMinutes = sessions
    .filter(s => s.type === 'focus')
    .reduce((acc, session) => acc + session.duration / 60, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pomodoro Records
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your focused study sessions and productivity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.today.totalSessions || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Focus Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats?.today.totalMinutes || 0)}m
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSessions}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Focus Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(totalMinutes)}m
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      {stats?.weekly && stats.weekly.length > 0 && (
        <div className="card-gradient rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
          </div>
          <div className="space-y-4">
            {stats.weekly.map((day) => (
              <div key={day._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(day._id).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {day.sessions} sessions
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(day.minutes)}m
                  </span>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((day.minutes / 240) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="card-gradient rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session History</h3>
        </div>
        <div className="p-6">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pomodoro sessions recorded yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Start a pomodoro session to see your progress here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, daySessions]) => (
                  <div key={date}>
                    <div className="flex items-center mb-3">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h4>
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                        {daySessions.length} sessions
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                      {daySessions.map((session) => (
                        <div
                          key={session._id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {session.subject && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: session.subject.color }}
                                ></div>
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {session.subject?.name || 'General'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDuration(session.duration)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {session.studySession && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                📚 {session.studySession.title}
                              </p>
                            )}
                            {session.exam && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                🎯 {session.exam.title}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatDate(session.completedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
