
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('robot');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupMessage, setShowSignupMessage] = useState(false);
  
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const avatars = [
    { id: 'space', emoji: '🚀', name: 'Space Explorer' },
    { id: 'artist', emoji: '🎨', name: 'Creative Artist' },
    { id: 'scientist', emoji: '🔬', name: 'Mad Scientist' },
    { id: 'musician', emoji: '🎵', name: 'Music Maker' },
    { id: 'wizard', emoji: '🧙‍♀️', name: 'AI Wizard' },
    { id: 'robot', emoji: '🤖', name: 'Robot Friend' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, {
          username: name,
          avatar: selectedAvatar
        });
        setShowSignupMessage(true);
        toast({
          title: "Account created! 🎉",
          description: "Please check your email and click the verification link to complete your registration.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back! 👋",
          description: "You're now signed in to KaiD!",
        });
      }
    } catch (error: any) {
      if (error.message?.includes('Email already registered') && !isSignUp) {
        // Redirect to signup with pre-filled email
        setIsSignUp(true);
        toast({
          title: "Email not found",
          description: "This email isn't in our system. Please sign up instead!",
        });
      } else if (error.message?.includes('Email already registered') && isSignUp) {
        toast({
          title: "Email already exists",
          description: "Please log in instead or use a different email address.",
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Please verify your email",
          description: "Check your inbox and click the verification link before signing in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Oops! Something went wrong",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSignupMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center p-4">
        <Card className="max-w-xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email!</h1>
          <p className="text-lg text-gray-600 mb-6">
            We've sent a verification link to <strong>{email}</strong>. 
            Click the link in your email to complete your registration and start creating with KaiD!
          </p>
          <Button
            onClick={() => setShowSignupMessage(false)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center p-4">
      <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <div className="text-center space-y-6">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              KaiD
            </h1>
            <div className="text-2xl font-medium text-gray-700">
              {isSignUp ? 'Join the AI Adventure! 🚀' : 'Welcome Back! 👋'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="space-y-3">
                  <label className="text-xl font-bold text-gray-700">
                    What's your name?
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your awesome name!"
                    className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400 text-center"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xl font-bold text-gray-700">
                    Choose Your Avatar!
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={`p-4 rounded-2xl border-3 transition-all duration-200 transform hover:scale-105 ${
                          selectedAvatar === avatar.id
                            ? 'border-purple-500 bg-purple-100 scale-105'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">{avatar.emoji}</div>
                        <div className="text-sm font-semibold text-gray-700">
                          {avatar.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Choose a strong password" : "Enter your password"}
                  className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || (isSignUp && (!name.trim() || !selectedAvatar))}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Start My Adventure! ✨' : 'Sign In! 🚀')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign in!' : 'New here? Create your account!'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthScreen;
