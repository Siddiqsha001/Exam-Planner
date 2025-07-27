'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Eye, EyeOff, GraduationCap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Helper functions
const handleLogin = async (
  data: LoginFormData, 
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  login: (token: string, user: { id: string; name: string; email: string }) => void
) => {
  setLoading(true);
  setError('');
  try {
    const response = await authAPI.login(data);
    login(response.data.token, response.data.user);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Login failed';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

const handleRegister = async (
  data: RegisterFormData, 
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  login: (token: string, user: { id: string; name: string; email: string }) => void
) => {
  setLoading(true);
  setError('');
  try {
    const response = await authAPI.register(data);
    login(response.data.token, response.data.user);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Registration failed';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = (data: LoginFormData) => handleLogin(data, setLoading, setError, login);
  const onRegister = (data: RegisterFormData) => handleRegister(data, setLoading, setError, login);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.5),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(147,51,234,0.5),transparent_50%)]"></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full glass-effect hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-500" />
        )}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            ExamPlanner Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your intelligent exam preparation companion
          </p>
        </div>

        {/* Auth Form */}
        <div className="glass-modal rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {isLogin ? 'Welcome back!' : 'Get started'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to begin'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={
              isLogin
                ? loginForm.handleSubmit(onLogin)
                : registerForm.handleSubmit(onRegister)
            }
            className="space-y-6"
          >
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...(isLogin ? loginForm.register('email') : registerForm.register('email'))}
                type="email"
                className="input-field"
                placeholder="Enter your email"
              />
              {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
                <p className="text-red-500 text-sm mt-1">
                  {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email)?.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...(isLogin ? loginForm.register('password') : registerForm.register('password'))}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
                <p className="text-red-500 text-sm mt-1">
                  {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password)?.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                (() => {
                  return isLogin ? 'Sign In' : 'Create Account';
                })()
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-500 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 text-sm">📚</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Smart Planning</p>
          </div>
          <div className="p-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-indigo-600 dark:text-indigo-400 text-sm">⏰</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Time Tracking</p>
          </div>
          <div className="p-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 dark:text-purple-400 text-sm">📊</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Progress Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
