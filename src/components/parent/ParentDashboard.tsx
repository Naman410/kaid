
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParentDashboardProps {
  onBack: () => void;
}

const ParentDashboard = ({ onBack }: ParentDashboardProps) => {
  // Mock data (will be fetched from Supabase in Phase 2)
  const childData = {
    name: 'Alex',
    joinDate: '2025-05-01',
    spentTime: '4h 32m',
    lessonsCompleted: 3,
    creativationsCreated: 12,
    badges: [
      { id: 1, name: 'First Lesson', icon: '🥇', earned: true },
      { id: 2, name: 'Creative Explorer', icon: '🎨', earned: true },
      { id: 3, name: 'AI Expert', icon: '🧠', earned: false },
      { id: 4, name: 'Story Master', icon: '📚', earned: false }
    ],
    recentActivity: [
      { id: 1, type: 'lesson', title: 'Completed "What is AI?"', date: '2025-05-30', icon: '📚' },
      { id: 2, type: 'creation', title: 'Created music: "Happy Adventure"', date: '2025-05-29', icon: '🎵' },
      { id: 3, type: 'creation', title: 'Generated image: "Robot in garden"', date: '2025-05-29', icon: '🎨' },
      { id: 4, type: 'quiz', title: 'Scored 100% on AI Basics Quiz', date: '2025-05-28', icon: '🏆' }
    ],
    learningProgress: {
      'What is AI?': { completed: true, score: 100 },
      'How AI Learns': { completed: false, score: 0 },
      'AI in Everyday Life': { completed: false, score: 0 }
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-xl"
          >
            ← Back to Hub
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">👨‍👩‍👧‍👦 Parent Dashboard</h1>
            <p className="text-gray-600">Track {childData.name}'s learning journey</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-2xl font-bold text-gray-800">{childData.lessonsCompleted}</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-2xl font-bold text-gray-800">{childData.creativationsCreated}</div>
              <div className="text-sm text-gray-600">AI Creations</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-gray-800">{childData.spentTime}</div>
              <div className="text-sm text-gray-600">Spent Time</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 border-0 rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-800">
                {childData.badges.filter(b => b.earned).length}
              </div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </Card>
        </div>

        {/* Learning Progress */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Learning Progress</h2>
          
          <div className="space-y-4">
            {Object.entries(childData.learningProgress).map(([track, progress]) => (
              <div key={track} className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{track}</h3>
                  <Badge variant={progress.completed ? 'default' : 'secondary'}>
                    {progress.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.completed ? 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {progress.completed ? `${progress.score}% score` : 'Not started'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🕐 Recent Activity</h2>
            
            <div className="space-y-4">
              {childData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Badges */}
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Achievements</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {childData.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`p-4 rounded-xl text-center transition-all duration-200 ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg' 
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="text-sm font-semibold text-gray-700">{badge.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {badge.earned ? 'Earned!' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Safety & Settings */}
        <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Safety & Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Content Safety</h3>
              <p className="text-sm text-gray-600">All AI interactions are filtered for age-appropriate content</p>
              <Badge className="mt-2" variant="default">Active</Badge>
            </div>
            
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Usage Limits</h3>
              <p className="text-sm text-gray-600">Daily AI creation limit: 10 per day</p>
              <Button size="sm" variant="outline" className="mt-2">
                Adjust
              </Button>
            </div>
            
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Privacy</h3>
              <p className="text-sm text-gray-600">COPPA compliant with minimal data collection</p>
              <Button size="sm" variant="outline" className="mt-2">
                Learn More
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggested Activities */}
        <Card className="p-6 bg-gradient-to-r from-green-100 to-teal-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Suggested Next Activities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">🧠</div>
                <h3 className="font-semibold text-gray-800">Continue AI Learning</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your child is ready for "How AI Learns" - the next lesson in their learning journey!
              </p>
              <Badge variant="secondary">Recommended</Badge>
            </div>
            
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">🎵</div>
                <h3 className="font-semibold text-gray-800">Music Creation</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {childData.name} loves making music! Try creating different styles together.
              </p>
              <Badge variant="outline">Fun Activity</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
