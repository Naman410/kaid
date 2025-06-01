
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('robot');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
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
        toast({
          title: "Welcome to KaiD! 🎉",
          description: "Your account has been created successfully!",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back! 👋",
          description: "You're now signed in to KaiD!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Oops! Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={loading || (isSignUp && (!name.trim() || !selectedAvatar))}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Start My Adventure! ✨' : 'Sign In! 🚀')}
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
