import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectItem, Label } from '@common';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuthLoading, selectAuthError, clearError } from '@features/auth/redux/authSlice.js';
import { sanitizeInput, sanitizeEmail, sanitizePassword } from '../utils/sanitize.js';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Component state
  const [role, setRole] = useState(searchParams.get('role') ?? 'credentialist');
  const [name, setName] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific errors
  const [nameError, setNameError] = useState('');
  const [confirmNameError, setConfirmNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Clear role query param from URL on mount
  useEffect(() => {
    if (searchParams.get('role')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Handle auth errors from Redux
  useEffect(() => {
    if (authError) {
      setError(authError);
      toast.error(authError);
    }
  }, [authError]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Role-specific styling classes
  const roleBgClasses = {
    credentialist: 'bg-credentialist-primary hover:bg-credentialist-primary/90',
    curator: 'bg-curator-primary hover:bg-curator-primary/90',
    validant: 'bg-validant-primary hover:bg-validant-primary/90'
  };

  const roleTextClasses = {
    credentialist: 'text-credentialist-primary',
    curator: 'text-curator-primary',
    validant: 'text-validant-primary'
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNameError('');
    setConfirmNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    // Validate name
    if (!name.trim()) {
      setNameError('Full name is required');
      toast.error('Full name is required');
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      toast.error('Name must be at least 2 characters');
      hasError = true;
    }

    // Validate confirm name
    if (!confirmName.trim()) {
      setConfirmNameError('Please confirm your full name');
      hasError = true;
    } else if (name.trim() !== confirmName.trim()) {
      setConfirmNameError('Names do not match');
      toast.error('Names do not match');
      hasError = true;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Email does not match the format');
      toast.error('Email does not match the format');
      hasError = true;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      hasError = true;
    } else {
      // Password complexity check
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        setPasswordError('Password must contain uppercase, lowercase, and number');
        toast.error('Password must contain uppercase, lowercase, and number');
        hasError = true;
      }
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    try {
      // Dispatch Redux action with sanitized data
      const result = await dispatch(signup({
        name: sanitizedName,
        email: sanitizedEmail,
        password: sanitizedPassword,
        role
      }));

      if (signup.fulfilled.match(result)) {
        // Success - navigate to dashboard
        toast.success('Account created successfully!');
        navigate('/home');
      } else {
        // Error handled by Redux state
        const errorMsg = result.payload || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.main
      className={`min-h-screen flex items-center justify-center px-6 py-12 transition-colors duration-500 ${roleBgClasses[role] || roleBgClasses.credentialist}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card">
          <CardHeader className="space-y-1">
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold">Create account</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Choose your role and create your account to get started.</p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                {/* Critical Name Warning */}
                <motion.div variants={item} className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div className="text-sm">
                      <p className="font-bold text-red-900 mb-1">⚠️ CRITICAL: Official Name Required</p>
                      <p className="text-red-700">
                        Enter your <strong>full legal name</strong> exactly as it appears on your official certificates and documents.
                        This name will be used for credential verification and <strong>CANNOT BE CHANGED LATER</strong>.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div variants={item} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">
                    Official Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                      setError('');
                    }}
                    placeholder="Enter your full legal name (as on certificates)"
                    className={nameError ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                  <p className="text-xs text-muted-foreground">Must match your official documents exactly</p>
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="confirmName" className="font-semibold">
                    Confirm Official Full Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="confirmName"
                    value={confirmName}
                    onChange={(e) => {
                      setConfirmName(e.target.value);
                      setConfirmNameError('');
                      setError('');
                    }}
                    placeholder="Re-enter your full legal name"
                    className={confirmNameError ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {confirmNameError && <p className="text-sm text-red-600">{confirmNameError}</p>}
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setError('');
                    }}
                    placeholder="you@example.com"
                    className={emailError ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                        setError('');
                      }}
                      placeholder="At least 8 characters with uppercase, lowercase & number"
                      className={passwordError ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmPasswordError('');
                        setError('');
                      }}
                      placeholder="Re-enter your password"
                      className={confirmPasswordError ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPasswordError && <p className="text-sm text-red-600">{confirmPasswordError}</p>}
                </motion.div>
                <motion.div variants={item} className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectItem value="credentialist">Credentialist</SelectItem>
                    <SelectItem value="curator">Curator</SelectItem>
                    <SelectItem value="validant">Validant</SelectItem>
                  </Select>
                </motion.div>
                <motion.div variants={item}>
                  <Button
                    type="submit"
                    className={`w-full text-white ${roleBgClasses[role] || roleBgClasses.credentialist}`}
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </motion.div>
              </div>
            </form>
            <motion.div className="mt-4 text-center" variants={item}>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/login?role=${role}`)}
                  className={`hover:underline font-medium ${roleTextClasses[role] || roleTextClasses.credentialist}`}
                >
                  Log in
                </button>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  );
}
