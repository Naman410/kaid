
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MusicZone from '@/components/creative/MusicZone';
import ImageZone from '@/components/creative/ImageZone';
import StoryTreehouse from '@/components/creative/StoryTreehouse';
import LearningTracksHub from '@/components/learning/LearningTracksHub';
import ProgressTracker from '@/components/shared/ProgressTracker';
import UsageControl from '@/components/shared/UsageControl';
import ParentDashboard from '@/components/parent/ParentDashboard';
import PaymentPage from '@/components/payment/PaymentPage';

interface MainHubProps {
  userProfile: { username: string; avatar_url: string } | null;
}

const MainHub = ({ userProfile }: MainHubProps) => {
  const [currentView, setCurrentView] = useState('hub');

  const avatarEmojis = {
    space: '🚀',
    artist: '🎨', 
    scientist: '🔬',
    musician: '🎵',
    wizard: '🧙‍♀️',
    robot: '🤖',
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'music':
        return <MusicZone onBack={() => setCurrentView('hub')} />;
      case 'image':
        return <ImageZone onBack={() => setCurrentView('hub')} />;
      case 'story':
        return <StoryTreehouse onBack={() => setCurrentView('hub')} />;
      case 'learning':
        return <LearningTracksHub onBack={() => setCurrentView('hub')} />;
      case 'parent':
        return <ParentDashboard onBack={() => setCurrentView('hub')} />;
      case 'payment':
        return <PaymentPage onBack={() => setCurrentView('hub')} />;
      default:
        return renderHubView();
    }
  };

  const renderHubView = () => (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg gap-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">
            {userProfile ? avatarEmojis[userProfile.avatar_url as keyof typeof avatarEmojis] : '🤖'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Hi {userProfile?.username || 'Friend'}! 👋
            </h1>
            <p className="text-gray-600">Ready for some AI fun?</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setCurrentView('parent')}
            variant="outline"
            className="rounded-xl text-sm sm:text-base"
          >
            👨‍👩‍👧‍👦 Parent
          </Button>
        </div>
      </div>

      {/* Progress and Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressTracker />
        <UsageControl onUpgrade={() => setCurrentView('payment')} />
      </div>

      {/* Learning Tracks */}
      <Card className="p-6 bg-gradient-to-r from-indigo-100 to-cyan-100 border-0 rounded-2xl shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="text-4xl sm:text-6xl">🎓</div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Learning Adventures</h3>
              <p className="text-sm sm:text-base text-gray-600">Discover how AI works through fun lessons!</p>
            </div>
          </div>
          <Button
            onClick={() => setCurrentView('learning')}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transform hover:scale-105 transition-all duration-200"
          >
            Start Learning! 🚀
          </Button>
        </div>
      </Card>
      
      {/* Creative Zones */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
          🎨 Creative AI Zones 🎨
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="p-6 sm:p-8 bg-gradient-to-br from-yellow-200 to-orange-200 border-0 rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={() => setCurrentView('music')}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl sm:text-8xl">🎵</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Sound Cave</h3>
              <p className="text-base sm:text-lg text-gray-600">Create amazing music with AI!</p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base sm:text-lg py-2 sm:py-3">
                Make Music! 🎶
              </Button>
            </div>
          </Card>

          <Card 
            className="p-6 sm:p-8 bg-gradient-to-br from-green-200 to-blue-200 border-0 rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={() => setCurrentView('image')}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl sm:text-8xl">🎨</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Art Studio</h3>
              <p className="text-base sm:text-lg text-gray-600">Generate beautiful pictures!</p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-base sm:text-lg py-2 sm:py-3">
                Create Art! 🖼️
              </Button>
            </div>
          </Card>

          <Card 
            className="p-6 sm:p-8 bg-gradient-to-br from-pink-200 to-purple-200 border-0 rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200"
            onClick={() => setCurrentView('story')}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl sm:text-8xl">📚</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Story Treehouse</h3>
              <p className="text-base sm:text-lg text-gray-600">Write magical stories together!</p>
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-base sm:text-lg py-2 sm:py-3">
                Tell Stories! 📖
              </Button>
            </div>
          </Card>
        </div>
      </div>

      
      {/* Future Features Placeholder */}
      <Card className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 border-0 rounded-2xl shadow-lg opacity-75">
        <div className="text-center space-y-3">
          <div className="text-4xl sm:text-6xl">🐾</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-600">Train-a-Pet</h3>
          <p className="text-sm sm:text-base text-gray-500">Coming Soon! 💤</p>
          <Button disabled className="bg-gray-400 text-white rounded-xl text-sm sm:text-base">
            Under Construction 🚧
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
      {renderCurrentView()}
    </div>
  );
};

export default MainHub;
