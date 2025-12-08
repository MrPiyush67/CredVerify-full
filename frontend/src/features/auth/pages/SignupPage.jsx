import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectItem, Label } from '@common';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuthLoading } from '@features/auth/redux/authSlice.js';
import { sanitizeInput, sanitizeEmail, sanitizePassword } from '../utils/sanitize.js';
import { validateEmail, validatePassword, validateName, validateMatch } from '../utils/validation.js';
import { useAuthForm } from '../hooks/useAuthForm.js';
import { useRoleTheme } from '../hooks/useRoleTheme.js';
import { authPageContainer, authPageItem } from '../constants/animations.js';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);

  // Custom hooks for shared auth logic
  const { authError } = useAuthForm({ showErrorToast: true });
  const { bgClass, textClass, roleTextClasses } = useRoleTheme(searchParams.get('role') ?? 'learner');

  // Component state
  const [role, setRole] = useState(searchParams.get('role') ?? 'learner');
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

  // Update theme when role changes
  const currentTheme = useRoleTheme(role);

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
    }
  }, [authError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNameError('');
    setConfirmNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    // Validate name using shared validator
    const nameValidationError = validateName(name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      toast.error(nameValidationError);
      hasError = true;
    }

    // Validate confirm name using shared validator
    const confirmNameError = validateMatch(name, confirmName, 'Names');
    if (confirmNameError) {
      setConfirmNameError(confirmNameError);
      toast.error(confirmNameError);
      hasError = true;
    }

    // Validate email using shared validator
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      toast.error(emailValidationError);
      hasError = true;
    }

    // Validate password with complexity check
    const passwordValidationError = validatePassword(password, true);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast.error(passwordValidationError);
      hasError = true;
    }

    // Validate confirm password using shared validator
    const confirmPasswordValidationError = validateMatch(password, confirmPassword, 'Passwords');
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
      toast.error(confirmPasswordValidationError);
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

  return (
    <motion.main
      className={`min-h-screen flex items-center justify-center px-6 py-12 transition-colors duration-500 ${currentTheme.bgClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        variants={authPageContainer}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card">
          <CardHeader className="space-y-1">
            <motion.div variants={authPageItem}>
              <CardTitle className="text-2xl font-bold">Create account</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Choose your role and create your account to get started.</p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                {/* Critical Name Warning */}
                <motion.div variants={authPageItem} className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
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
                  <motion.div variants={authPageItem} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <motion.div variants={authPageItem} className="space-y-2">
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

                <motion.div variants={authPageItem} className="space-y-2">
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

                <motion.div variants={authPageItem} className="space-y-2">
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

                <motion.div variants={authPageItem} className="space-y-2">
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

                <motion.div variants={authPageItem} className="space-y-2">
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
                <motion.div variants={authPageItem} className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="regulator">Regulator</SelectItem>
                  </Select>
                </motion.div>
                <motion.div variants={authPageItem}>
                  <Button
                    type="submit"
                    className={`w-full text-white ${currentTheme.bgClass}`}
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </motion.div>
              </div>
            </form>
            <motion.div className="mt-4 text-center" variants={authPageItem}>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/login?role=${role}`)}
                  className={`hover:underline font-medium ${currentTheme.textClass}`}
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
