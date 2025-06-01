
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, Image, BookOpen, Users, Award, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MusicZone from '@/components/creative/MusicZone';
import ImageZone from '@/components/creative/ImageZone';
import StoryTreehouse from '@/components/creative/StoryTreehouse';
import LearningTracksHub from '@/components/learning/LearningTracksHub';
import ParentDashboard from '@/components/parent/ParentDashboard';
import ProgressTracker from '@/components/shared/ProgressTracker';
import UsageControl from '@/components/shared/UsageControl';
import PaymentPage from '@/components/payment/PaymentPage';

interface MainHubProps {
  userProfile: any;
}

const MainHub = ({ userProfile }: MainHubProps) => {
  const { signOut } = useAuth();
  const [activeZone, setActiveZone] = useState<'music' | 'image' | 'story' | 'learning' | 'parent' | 'payment'>('music');

  const handleSignOut = async () => {
    await signOut();
  };

  const renderActiveZone = () => {
    switch (activeZone) {
      case 'music':
        return <MusicZone />;
      case 'image':
        return <ImageZone />;
      case 'story':
        return <StoryTreehouse />;
      case 'learning':
        return <LearningTracksHub onBack={() => setActiveZone('music')} />;
      case 'parent':
        return <ParentDashboard onBack={() => setActiveZone('music')} />;
      case 'payment':
        return <PaymentPage onClose={() => setActiveZone('music')} />;
      default:
        return <MusicZone />;
    }
  };

  const username = userProfile?.username || 'Young Creator';

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Hi {username}! 👋
          </h1>
          <p className="text-white/80 text-lg">Ready to create something amazing today?</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {userProfile?.subscription_status === 'premium' ? '👑 Pro Creator' : '🌟 Free Creator'}
          </Badge>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-4 text-center">🎨 Creative Zones</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveZone('music')}
                  variant={activeZone === 'music' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Music Studio
                </Button>
                <Button
                  onClick={() => setActiveZone('image')}
                  variant={activeZone === 'image' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Art Gallery
                </Button>
                <Button
                  onClick={() => setActiveZone('story')}
                  variant={activeZone === 'story' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Story Treehouse
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-4 text-center">📚 Learning & More</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveZone('learning')}
                  variant={activeZone === 'learning' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Learning Hub
                </Button>
                <Button
                  onClick={() => setActiveZone('parent')}
                  variant={activeZone === 'parent' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Parent Zone
                </Button>
              </div>
            </CardContent>
          </Card>

          <UsageControl onUpgrade={() => setActiveZone('payment')} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {renderActiveZone()}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
};

export default MainHub;
