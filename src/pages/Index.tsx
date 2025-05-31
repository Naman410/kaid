
import { useState } from 'react';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import IntroToKaiD from '@/components/onboarding/IntroToKaiD';
import MainHub from '@/components/hub/MainHub';

const Index = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userProfile, setUserProfile] = useState(null);

  const handleStepComplete = (step: string, data?: any) => {
    console.log(`Completed step: ${step}`, data);
    
    if (step === 'welcome') {
      setCurrentStep('profile');
    } else if (step === 'profile') {
      setUserProfile(data);
      setCurrentStep('intro');
    } else if (step === 'intro') {
      setCurrentStep('hub');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      {currentStep === 'welcome' && (
        <WelcomeScreen onComplete={() => handleStepComplete('welcome')} />
      )}
      {currentStep === 'profile' && (
        <ProfileSetup onComplete={(data) => handleStepComplete('profile', data)} />
      )}
      {currentStep === 'intro' && (
        <IntroToKaiD onComplete={() => handleStepComplete('intro')} />
      )}
      {currentStep === 'hub' && (
        <MainHub userProfile={userProfile} />
      )}
    </div>
  );
};

export default Index;
