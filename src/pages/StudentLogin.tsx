
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import StudentLoginScreen from '@/components/auth/StudentLoginScreen';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentLoginContent = () => {
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

  return <StudentLoginScreen />;
};

const StudentLogin = () => {
  return (
    <AuthProvider>
      <StudentLoginContent />
    </AuthProvider>
  );
};

export default StudentLogin;
