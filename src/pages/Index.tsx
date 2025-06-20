
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import AuthScreen from '@/components/auth/AuthScreen';
import MainHub from '@/components/hub/MainHub';
import FloatingDIAChat from '@/components/dia/FloatingDIAChat';
import DIAIntroModal from '@/components/onboarding/DIAIntroModal';
import ElevenLabsWidget from '@/components/shared/ElevenLabsWidget';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [showIntroModal, setShowIntroModal] = useState(false);

  useEffect(() => {
    // Show intro modal for authenticated users who haven't seen it
    if (user && profile && !profile.has_seen_intro) {
      setShowIntroModal(true);
    }
  }, [user, profile]);

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">🤖</div>
          <div className="text-2xl font-bold text-white">Loading KaiD...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth screen
  if (!user) {
    return <AuthScreen />;
  }

  // Show loading while profile is being fetched (but user is authenticated)
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">🤖</div>
          <div className="text-2xl font-bold text-white">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      {/* ElevenLabs Widget - Only show for authenticated users */}
      {user && <ElevenLabsWidget />}
      
      <MainHub userProfile={profile} />
      {/* <FloatingDIAChat /> */}

      {/* DIA Intro Modal for first-time users */}
      {/* <DIAIntroModal 
          isOpen={showIntroModal} 
          onClose={() => setShowIntroModal(false)} 
      /> */}
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
