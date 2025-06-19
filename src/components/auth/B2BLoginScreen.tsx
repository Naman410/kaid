
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const B2BLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back! 👋",
        description: "You're now signed in to KaiD!",
      });
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Please verify your email",
          description: "Check your inbox and click the verification link before signing in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign-in failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
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
              School Login 🏫
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your school email address"
                className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing In...' : 'Sign In to School Account 🚀'}
            </Button>
          </form>

          <div className="text-center text-gray-600">
            <p className="text-sm">
              Need help? Contact your teacher or school administrator.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default B2BLoginScreen;
