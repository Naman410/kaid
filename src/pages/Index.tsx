
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/auth/AuthScreen';
import MainHub from '@/components/hub/MainHub';
import FloatingDIAChat from '@/components/dia/FloatingDIAChat';

const AppContent = () => {
  const { user, profile, loading } = useAuth();

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

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      <MainHub userProfile={profile} />
      <FloatingDIAChat />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
