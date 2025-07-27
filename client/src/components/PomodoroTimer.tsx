'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      if (isBreak) {
        setTimeLeft(25 * 60); // Back to work session
        setIsBreak(false);
      } else {
        setTimeLeft(5 * 60); // 5 minute break
        setIsBreak(true);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </h3>
        
        <div className="text-6xl font-mono font-bold text-indigo-600 mb-8">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p>Focus: 25 minutes • Break: 5 minutes</p>
        </div>

        {timeLeft === 0 && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-medium">
              {isBreak ? 'Break time is over! Ready to focus?' : 'Great work! Time for a break!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
