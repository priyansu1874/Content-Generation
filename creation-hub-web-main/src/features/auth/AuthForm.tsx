import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';

interface AuthFormProps {
  type: 'login' | 'signup' | 'forgot';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
          toast({ title: 'Login successful!' });
          navigate('/dashboard');
        } else {
          throw new Error('Please fill in all fields');
        }
      } else if (type === 'signup') {
        // Simulate signup
        if (formData.email && formData.password && formData.fullName) {
          localStorage.setItem('user', JSON.stringify({ 
            email: formData.email, 
            name: formData.fullName 
          }));
          toast({ title: 'Account created successfully!' });
          navigate('/dashboard');
        } else {
          throw new Error('Please fill in all required fields');
        }
      } else if (type === 'forgot') {
        // Simulate forgot password
        if (formData.email) {
          toast({ title: 'Password reset link sent to your email!' });
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
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'login': return 'Sign in to your account to continue';
      case 'signup': return 'Create a new account to get started';
      case 'forgot': return 'Enter your email to reset your password';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {type === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName"
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {type !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            
            {type === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio"
                    placeholder="Tell us a bit about yourself" 
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Processing...' : type === 'login' ? 'Sign In' : type === 'signup' ? 'Sign Up' : 'Reset Password'}
            </Button>
            
            {type === 'login' && (
              <div className="text-center text-sm">
                <a 
                  href="/forgot-password" 
                  className="text-blue-600 hover:underline"
                >
                  Forgot password?
                </a>
                <div className="mt-2">
                  Don't have an account?{' '}
                  <a 
                    href="/signup" 
                    className="text-blue-600 hover:underline"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            )}
            
            {type === 'signup' && (
              <div className="text-center text-sm">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </a>
              </div>
            )}
            
            {type === 'forgot' && (
              <div className="text-center text-sm">
                Remember your password?{' '}
                <a 
                  href="/login" 
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </a>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
