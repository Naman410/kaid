
import { Card } from '@/components/ui/card';

const ProgressTracker = () => {
  // Mock progress data (will be fetched from Supabase in Phase 2)
  const progressData = {
    totalPoints: 475,
    dailyGoal: 100,
    todayPoints: 85,
    streak: 3,
    level: 2,
    nextLevelPoints: 500
  };

  const progressToNextLevel = (progressData.totalPoints / progressData.nextLevelPoints) * 100;
  const dailyProgress = (progressData.todayPoints / progressData.dailyGoal) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        📊 Your Progress 📊
      </h2>
      
      <div className="space-y-4">
        {/* Level Progress */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Level {progressData.level}</span>
            <span className="text-sm text-gray-600">{progressData.totalPoints}/{progressData.nextLevelPoints}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl">⭐</span>
            <span className="text-sm text-gray-600 ml-1">
              {progressData.nextLevelPoints - progressData.totalPoints} points to level up!
            </span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Today's Goal</span>
            <span className="text-sm text-gray-600">{progressData.todayPoints}/{progressData.dailyGoal}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(dailyProgress, 100)}%` }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm text-gray-600 ml-1">
              {progressData.dailyGoal - progressData.todayPoints > 0 
                ? `${progressData.dailyGoal - progressData.todayPoints} more to go!`
                : 'Goal reached! Great job!'}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-lg font-bold text-gray-800">{progressData.streak} Day Streak!</div>
          <div className="text-sm text-gray-600">Keep learning every day!</div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressTracker;
