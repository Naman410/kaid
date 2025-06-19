
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import B2BLoginScreen from '@/components/auth/B2BLoginScreen';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const B2BLoginContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to main hub
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">🤖</div>
          <div className="text-2xl font-bold text-white">Loading KaiD...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return <B2BLoginScreen />;
};

const B2BLogin = () => {
  return (
    <AuthProvider>
      <B2BLoginContent />
    </AuthProvider>
  );
};

export default B2BLogin;
