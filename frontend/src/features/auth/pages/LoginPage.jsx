import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectItem, Label } from '@common';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, clearError } from '@features/auth/redux/authSlice.js';
import { sanitizeEmail, sanitizePassword } from '../utils/sanitize.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Component state
  const [role, setRole] = useState(searchParams.get('role') ?? 'credentialist');
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
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    // Validate required fields
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
        // Error handled by Redux state
        setError(result.payload || 'Login failed. Please check your credentials.');
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
              <CardTitle className="text-2xl font-bold">Log in</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Choose a role to be redirected to the appropriate dashboard.</p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </motion.div>
                <motion.div variants={item} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
                    {loading ? 'Logging in...' : 'Continue'}
                  </Button>
                </motion.div>
              </div>
            </form>

            <motion.div className="mt-6 p-4 bg-muted/50 rounded-lg" variants={item}>
              <h3 className="text-sm font-medium mb-3 text-center">Demo Credentials</h3>
              <div className="space-y-2 text-xs">
                {role === 'credentialist' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Credentialist:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('priya.sharma@example.com');
                        setPassword('password123');
                        setRole('credentialist');
                      }}
                      className={`hover:underline font-medium ${roleTextClasses.credentialist}`}
                    >
                      priya.sharma@example.com / password123
                    </button>
                  </div>
                )}
                {role === 'validant' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Validant:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('kavita.rao@credverify.com');
                        setPassword('password123');
                        setRole('validant');
                      }}
                      className={`hover:underline font-medium ${roleTextClasses.validant}`}
                    >
                      kavita.rao@credverify.com / password123
                    </button>
                  </div>
                )}
                {role === 'curator' && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Curator:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('meera.krishnan@startupx.io');
                        setPassword('password123');
                        setRole('curator');
                      }}
                      className={`hover:underline font-medium ${roleTextClasses.curator}`}
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

            <motion.div className="mt-4 text-center" variants={item}>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/signup?role=${role}`)}
                  className={`hover:underline font-medium ${roleTextClasses[role] || roleTextClasses.credentialist}`}
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
