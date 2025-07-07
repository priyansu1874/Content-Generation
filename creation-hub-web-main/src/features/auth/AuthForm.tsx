import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Shield, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup' | 'forgot';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    designation: '',
    department: '',
    location: '',
    bio: '',
    role: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'login') {
        // Simulate login
        if (formData.email && formData.password) {
          localStorage.setItem('user', JSON.stringify({ 
            email: formData.email, 
            name: formData.email.split('@')[0] 
          }));
          toast({ title: 'Welcome back!', description: 'Login successful' });
          navigate('/dashboard');
        } else {
          throw new Error('Please fill in all fields');
        }
      } else if (type === 'signup') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        // Simulate signup
        if (formData.email && formData.password && formData.fullName) {
          localStorage.setItem('user', JSON.stringify({ 
            email: formData.email, 
            name: formData.fullName 
          }));
          toast({ title: 'Account created!', description: 'Welcome to Content Creation Hub' });
          navigate('/dashboard');
        } else {
          throw new Error('Please fill in all required fields');
        }
      } else if (type === 'forgot') {
        // Simulate forgot password
        if (formData.email) {
          toast({ title: 'Reset link sent!', description: 'Check your email for password reset instructions' });
          navigate('/login');
        } else {
          throw new Error('Please enter your email');
        }
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Your Account';
      case 'forgot': return 'Reset Password';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'login': return 'Sign in to access your content creation hub';
      case 'signup': return 'Join thousands of creators building amazing content';
      case 'forgot': return 'Enter your email to reset your password';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (type) {
      case 'login': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Link';
    }
  };

  const validatePassword = (password: string) => {
    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /\d/.test(password), text: 'One number' }
    ];
    return requirements;
  };

  const passwordRequirements = type === 'signup' ? validatePassword(formData.password) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Creation Hub</h1>
          <p className="text-gray-600 text-sm">Professional content creation platform</p>
        </div>

        {/* Main Form Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
              <p className="text-gray-600">{getDescription()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field - Signup Only */}
              {type === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      placeholder="Enter your full name" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              {type !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="password" 
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements - Signup Only */}
                  {type === 'signup' && formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {req.met ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Field - Signup Only */}
              {type === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password" 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bio Field - Signup Only */}
              {type === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                    Bio <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Textarea 
                    id="bio" 
                    name="bio"
                    placeholder="Tell us a bit about yourself and your content goals..." 
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {getButtonText()}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                {type === 'login' && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      >
                        Sign up for free
                      </button>
                    </div>
                  </div>
                )}
                
                {type === 'signup' && (
                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Sign in here
                    </button>
                  </div>
                )}
                
                {type === 'forgot' && (
                  <div className="text-center text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Sign in here
                    </button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2025 Content Creation Hub. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <button className="hover:text-gray-700">Privacy Policy</button>
            <button className="hover:text-gray-700">Terms of Service</button>
            <button className="hover:text-gray-700">Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
