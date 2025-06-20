
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface ParentDashboardProps {
  onBack: () => void;
}

const ParentDashboard = ({ onBack }: ParentDashboardProps) => {
  const { signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { useUserCreations, useUserProgress } = useSupabaseData();
  
  const { data: creations } = useUserCreations();
  const { data: progress } = useUserProgress();

  // Calculate spent time (mock data for now)
  const spentTimeToday = "45 minutes";
  const spentTimeThisWeek = "3 hours 20 minutes";

  // Calculate completed lessons
  const completedLessons = progress?.filter(p => p.status === 'completed').length || 0;

  if (profileLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="text-8xl animate-bounce">🤖</div>
            <div className="text-2xl font-bold text-white">Loading Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-xl order-1 sm:order-none"
          >
            ← Back to Hub
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center order-2 sm:order-none">
            👨‍👩‍👧‍👦 Parent Dashboard 👨‍👩‍👧‍👦
          </h1>
          <Button
            onClick={signOut}
            variant="outline"
            className="rounded-xl order-3 sm:order-none"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-cyan-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl">⏰</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Spent Time Today</h3>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{spentTimeToday}</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-100 to-emerald-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl">📅</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Spent Time This Week</h3>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{spentTimeThisWeek}</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl">📚</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Lessons Completed</h3>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{completedLessons}</div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center space-y-3">
              <div className="text-3xl sm:text-4xl">🎨</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Creations Made</h3>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{creations?.length || 0}</div>
            </div>
          </Card>
        </div>

        {/* Child Profile */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            👤 Child Profile 👤
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="text-4xl sm:text-6xl">
              {profile?.avatar_url === 'space' && '🚀'}
              {profile?.avatar_url === 'artist' && '🎨'}
              {profile?.avatar_url === 'scientist' && '🔬'}
              {profile?.avatar_url === 'musician' && '🎵'}
              {profile?.avatar_url === 'wizard' && '🧙‍♀️'}
              {profile?.avatar_url === 'robot' && '🤖'}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{profile?.username}</h3>
              <div className="text-base sm:text-lg text-gray-600">
                Account Type: <span className="font-semibold capitalize">{profile?.subscription_status || 'Free'}</span>
              </div>
              <div className="text-base sm:text-lg text-gray-600">
                Member Since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            📊 Recent Activity 📊
          </h2>
          
          <div className="space-y-4">
            {creations && creations.length > 0 ? (
              creations.slice(0, 5).map((creation, index) => (
                <div key={creation.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl sm:text-2xl">
                      {creation.creation_type === 'music' && '🎵'}
                      {creation.creation_type === 'image' && '🎨'}
                      {creation.creation_type === 'story' && '📚'}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-gray-800 capitalize">
                        {creation.creation_type} Creation
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {new Date(creation.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm sm:text-base">
                    Completed ✅
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-4">🌟</div>
                <div className="text-base sm:text-lg text-gray-600">No creations yet!</div>
                <div className="text-sm text-gray-500">Encourage your child to start creating!</div>
              </div>
            )}
          </div>
        </Card>

        {/* Safety & Settings */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-red-100 to-pink-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            🛡️ Safety & Settings 🛡️
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Content Safety</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm sm:text-base text-gray-700">Child-safe AI content only</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm sm:text-base text-gray-700">No inappropriate content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm sm:text-base text-gray-700">Educational focus</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Usage Limits</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">ℹ️</span>
                  <span className="text-sm sm:text-base text-gray-700">Daily creation limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">ℹ️</span>
                  <span className="text-sm sm:text-base text-gray-700">Time tracking available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">ℹ️</span>
                  <span className="text-sm sm:text-base text-gray-700">Progress monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
