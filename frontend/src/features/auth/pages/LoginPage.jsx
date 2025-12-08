import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectItem, Label } from '@common';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading } from '@features/auth/redux/authSlice.js';
import { sanitizeEmail, sanitizePassword } from '../utils/sanitize.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { useAuthForm } from '../hooks/useAuthForm.js';
import { useRoleTheme } from '../hooks/useRoleTheme.js';
import { authPageContainer, authPageItem } from '../constants/animations.js';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);

  // Custom hooks for shared auth logic
  const { authError } = useAuthForm({ showErrorToast: false }); // Don't auto-show toast for login errors
  const { bgClass, textClass, roleTextClasses } = useRoleTheme(searchParams.get('role') ?? 'learner');

  // Component state
  const [role, setRole] = useState(searchParams.get('role') ?? 'learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      // Don't show toast for 401 errors (incorrect credentials)
    }
  }, [authError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validate email using shared validator
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      toast.error(emailValidationError);
      return;
    }

    // Validate password using shared validator
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast.error(passwordValidationError);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    // Final check after sanitization
    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Please enter valid email and password.');
      toast.error('Please enter valid email and password.');
      return;
    }

    try {
      // Dispatch Redux action with sanitized data
      const result = await dispatch(login({
        email: sanitizedEmail,
        password: sanitizedPassword,
        role
      }));

      if (login.fulfilled.match(result)) {
        toast.success('Login successful!');
        // PublicRoute will handle redirect to /home
      } else {
        // Error handled by Redux state - show specific error message
        const errorMsg = result.payload || 'Incorrect email or password';
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
              <CardTitle className="text-2xl font-bold">Log in</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Choose a role to be redirected to the appropriate dashboard.</p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                {error && (
                  <motion.div variants={authPageItem} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
                <motion.div variants={authPageItem} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
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
                    {loading ? 'Logging in...' : 'Continue'}
                  </Button>
                </motion.div>
              </div>
            </form>

            <motion.div className="mt-6 p-4 bg-muted/50 rounded-lg" variants={authPageItem}>
              <h3 className="text-sm font-medium mb-3 text-center">Demo Credentials</h3>
              <div className="space-y-2 text-xs">
                {role === 'learner' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Learner:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('priya.sharma@example.com');
                        setPassword('password123');
                        setRole('learner');
                      }}
                      className={`hover:underline font-medium ${currentTheme.roleTextClasses.learner}`}
                    >
                      priya.sharma@example.com / password123
                    </button>
                  </div>
                )}
                {role === 'regulator' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Regulator:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('kavita.rao@credverify.com');
                        setPassword('password123');
                        setRole('regulator');
                      }}
                      className={`hover:underline font-medium ${currentTheme.roleTextClasses.regulator}`}
                    >
                      kavita.rao@credverify.com / password123
                    </button>
                  </div>
                )}
                {role === 'employer' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Employer:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('meera.krishnan@startupx.io');
                        setPassword('password123');
                        setRole('employer');
                      }}
                      className={`hover:underline font-medium ${currentTheme.roleTextClasses.employer}`}
                    >
                      meera.krishnan@startupx.io / password123
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click the credential to auto-fill the form
              </p>
            </motion.div>

            <motion.div className="mt-4 text-center" variants={authPageItem}>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/signup?role=${role}`)}
                  className={`hover:underline font-medium ${currentTheme.textClass}`}
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.main>
  );
}
