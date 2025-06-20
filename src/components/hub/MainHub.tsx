
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import ImageZone from '@/components/creative/ImageZone';
import MusicZone from '@/components/creative/MusicZone';
import StoryTreehouse from '@/components/creative/StoryTreehouse';
import LearningTracksHub from '@/components/learning/LearningTracksHub';
import DIAChat from '@/components/dia/DIAChat';
import FloatingDIAChat from '@/components/dia/FloatingDIAChat';
import IntroToKaiD from '@/components/onboarding/IntroToKaiD';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface MainHubProps {
  onShowPayment?: () => void;
}

const MainHub = ({ onShowPayment }: MainHubProps) => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'hub' | 'image' | 'music' | 'story' | 'learning' | 'dia'>('hub');
  const [showIntro, setShowIntro] = useState(false);
  const { useUserCreations, useMarkIntroSeen } = useSupabaseData();
  
  const { data: creations } = useUserCreations();
  const markIntroSeenMutation = useMarkIntroSeen();

  // Check if user should see intro
  useEffect(() => {
    if (user && !user.has_seen_intro) {
      setShowIntro(true);
    }
  }, [user]);

  const handleIntroComplete = async () => {
    try {
      await markIntroSeenMutation.mutateAsync();
      setShowIntro(false);
    } catch (error) {
      console.error('Error marking intro as seen:', error);
      setShowIntro(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // For B2B users, redirect to student login
      if (user?.user_type?.startsWith('b2b_')) {
        window.location.href = '/student-login';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (showIntro) {
    return <IntroToKaiD onComplete={handleIntroComplete} />;
  }

  if (currentView === 'image') {
    return <ImageZone onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'music') {
    return <MusicZone onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'story') {
    return <StoryTreehouse onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'learning') {
    return <LearningTracksHub onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'dia') {
    return <DIAChat onBack={() => setCurrentView('hub')} />;
  }

  const totalCreations = creations?.length || 0;
  const imageCreations = creations?.filter(c => c.creation_type === 'image').length || 0;
  const storyCreations = creations?.filter(c => c.creation_type === 'story').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {user?.username || 'Young Creator'}! 👋
              </h1>
              <p className="text-gray-600">Ready to create something amazing today?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🎨 {totalCreations} Creations
            </Badge>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="rounded-xl"
            >
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🖼️</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{imageCreations}</p>
                <p className="text-sm text-gray-600">AI Artworks</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📚</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{storyCreations}</p>
                <p className="text-sm text-gray-600">Stories Written</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎵</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-sm text-gray-600">Songs Created</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning Adventures Section - Moved Higher */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 bg-gradient-to-r from-green-100 to-blue-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-5xl">🎓</div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Learning Adventures</h2>
                    <p className="text-lg text-gray-600">Discover AI through fun lessons and activities!</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-600">Learning Progress</span>
                    <Badge variant="secondary">Grade 1-10 Available!</Badge>
                  </div>
                  <Progress value={15} className="h-3" />
                  <p className="text-xs text-gray-500">Complete lessons to unlock new grades and earn certificates!</p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView('learning')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Learning! 🚀
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Creative Zones */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* AI Art Studio */}
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">🎨</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">AI Art Studio</h3>
                  <p className="text-gray-600">Create beautiful artwork with AI magic!</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Artworks Created</span>
                  <span className="font-semibold">{imageCreations}</span>
                </div>
                <Progress value={Math.min((imageCreations / 10) * 100, 100)} className="h-2" />
              </div>
              
              <Button
                onClick={() => setCurrentView('image')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold py-3"
              >
                Create Art! 🖌️
              </Button>
            </div>
          </Card>

          {/* Story Treehouse */}
          <Card className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">📚</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Story Treehouse</h3>
                  <p className="text-gray-600">Write amazing stories with AI help!</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stories Written</span>
                  <span className="font-semibold">{storyCreations}</span>
                </div>
                <Progress value={Math.min((storyCreations / 10) * 100, 100)} className="h-2" />
              </div>
              
              <Button
                onClick={() => setCurrentView('story')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold py-3"
              >
                Write Stories! ✍️
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Music Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-r from-cyan-100 to-blue-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">🎵</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Music Studio</h3>
                  <p className="text-gray-600">Compose magical melodies with AI!</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon!</Badge>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView('music')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg px-6 py-3 rounded-xl font-semibold"
              >
                Make Music! 🎼
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* DIA Chat Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">🤖</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Chat with DIA</h3>
                  <p className="text-gray-600">Your friendly AI assistant is here to help!</p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView('dia')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-lg px-6 py-3 rounded-xl font-semibold"
              >
                Chat Now! 💬
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Floating DIA Chat */}
      <FloatingDIAChat />
    </div>
  );
};

export default MainHub;
