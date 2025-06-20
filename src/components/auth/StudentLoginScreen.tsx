
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StudentLoginScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    avatar: 'robot'
  });

  const avatarOptions = [
    { value: 'robot', label: '🤖 Robot', emoji: '🤖' },
    { value: 'cat', label: '🐱 Cat', emoji: '🐱' },
    { value: 'dog', label: '🐶 Dog', emoji: '🐶' },
    { value: 'unicorn', label: '🦄 Unicorn', emoji: '🦄' },
    { value: 'dragon', label: '🐉 Dragon', emoji: '🐉' },
    { value: 'alien', label: '👽 Alien', emoji: '👽' },
    { value: 'wizard', label: '🧙 Wizard', emoji: '🧙' },
    { value: 'ninja', label: '🥷 Ninja', emoji: '🥷' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkEmailExists = async (email: string) => {
    try {
      // Check if email exists in auth.users through sign in attempt
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy_password_for_check'
      });
      
      // If error is "Invalid login credentials", email might exist
      // If error is "Email not confirmed", email definitely exists
      if (error?.message?.includes('Email not confirmed') || 
          error?.message?.includes('Invalid login credentials')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSignUp && !formData.username) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Check if email already exists
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setIsSignUp(false);
          setIsLoading(false);
          return;
        }

        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              avatar: formData.avatar,
              user_type: 'b2c_student'
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
            setIsSignUp(false);
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user && !data.session) {
          toast.success('Please check your email to verify your account before signing in!');
          setIsSignUp(false);
        } else if (data.session) {
          toast.success(`Welcome to KaiD, ${formData.username}! 🎉`);
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            toast.error('Please check your email and verify your account before signing in.');
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Welcome back to KaiD! 🎉');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Join KaiD!' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Create your account to start your AI adventure!' 
              : 'Sign in to continue your creative journey!'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg font-semibold text-gray-700">
                  What should we call you? 😊
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="text-lg p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-lg font-semibold text-gray-700">
                  Choose your avatar! 🎭
                </Label>
                <Select 
                  value={formData.avatar} 
                  onValueChange={(value) => handleInputChange('avatar', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="text-lg p-3 rounded-xl border-2 border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {avatarOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{option.emoji}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-semibold text-gray-700">
              Email Address 📧
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="text-lg p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg font-semibold text-gray-700">
              Password 🔒
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="text-lg p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              isSignUp ? '🚀 Create My Account!' : '✨ Sign Me In!'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in!' 
              : "Don't have an account? Sign up!"
            }
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Your data is safe and secure with us</p>
        </div>
      </Card>
    </div>
  );
};

export default StudentLoginScreen;
