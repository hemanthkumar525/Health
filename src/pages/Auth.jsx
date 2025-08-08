import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import bcrypt from 'bcryptjs'; // ✅ browser-safe bcrypt

const { FiUser, FiLock, FiMail, FiArrowRight, FiUserPlus, FiLogIn } = FiIcons;

const Auth = ({ setUserProfile }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN FLOW
        const { data: user, error: fetchError } = await supabase
          .from('health_profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (fetchError || !user) {
          throw new Error('Invalid email or password');
        }

        // ✅ Compare entered password with stored bcrypt hash
        const match = await bcrypt.compare(password, user.password_hash || '');
        if (!match) {
          throw new Error('Invalid email or password');
        }

        // Login successful
        setUserProfile(user);
        localStorage.setItem('healthProfile', JSON.stringify(user));
        navigate('/dashboard');

      } else {
        // SIGN-UP FLOW

        // Check if email already exists
        const { data: existingUser } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Email already registered');
        }

        // ✅ Hash password before storing
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new profile with minimal fields
        const { data: newUser, error: insertError } = await supabase
          .from('health_profiles')
          .insert([
            {
              email,
              name,
              password_hash: passwordHash,
              created_at: new Date()
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        setUserProfile(newUser);
        localStorage.setItem('healthProfile', JSON.stringify(newUser));
        navigate('/profile');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">HealthAI</h1>
          <p className="text-blue-100">
            {isLogin
              ? 'Welcome back! Log in to access your health dashboard'
              : 'Create an account to start your health journey'}
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <SafeIcon
                icon={isLogin ? FiLogIn : FiUserPlus}
                className="text-blue-600 text-2xl"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
            {isLogin ? 'Log In to Your Account' : 'Create New Account'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                  <SafeIcon icon={FiArrowRight} className="text-lg" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
