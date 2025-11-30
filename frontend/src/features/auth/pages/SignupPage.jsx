import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectItem, Label } from '@common';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuthLoading, selectAuthError, clearError } from '@features/auth/redux/authSlice.js';
import { sanitizeInput, sanitizeEmail, sanitizePassword } from '../utils/sanitize.js';
import toast from 'react-hot-toast';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    // Validate required fields
    if (!sanitizedName || !sanitizedEmail || !sanitizedPassword) {
      setError('Please fill in all fields with valid data.');
      toast.error('Please fill in all fields with valid data.');
      return;
    }

    // Basic password validation
    if (sanitizedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(sanitizedPassword);
    const hasLowerCase = /[a-z]/.test(sanitizedPassword);
    const hasNumber = /\d/.test(sanitizedPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain uppercase, lowercase, and number.');
      toast.error('Password must contain uppercase, lowercase, and number.');
      return;
    }

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
        setError(result.payload || 'Registration failed. Please try again.');
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
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </motion.div>
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </motion.div>
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters with uppercase, lowercase & number"
                  />
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
