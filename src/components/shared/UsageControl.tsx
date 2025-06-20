
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface UsageControlProps {
  onUpgrade: () => void;
}

const UsageControl = ({ onUpgrade }: UsageControlProps) => {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { useCheckUserLimits } = useSupabaseData();
  const checkLimitsMutation = useCheckUserLimits();

  // For B2B users, fetch limits on component mount
  useEffect(() => {
    if (profile?.user_type === 'b2b_student' && profile?.organization_id) {
      checkLimitsMutation.mutate();
    }
  }, [profile?.user_type, profile?.organization_id]);

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 border-0 rounded-2xl shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">🤖</div>
          <div className="text-lg font-semibold text-gray-600">Loading your progress...</div>
        </div>
      </Card>
    );
  }

  // If no profile data, show a friendly message
  if (!profile) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-100 to-yellow-100 border-0 rounded-2xl shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <div className="text-lg font-semibold text-gray-600">Unable to load usage data</div>
        </div>
      </Card>
    );
  }

  // For B2C users or users without organization
  if (profile.user_type === 'b2c_student' || !profile.organization_id) {
    const totalLimit = profile.subscription_status === 'premium' ? 999999 : 10;
    const used = profile.total_creations_used || 0;
    const remainingCreations = totalLimit - used;
    const usagePercentage = (used / totalLimit) * 100;

    return (
      <Card className="p-6 bg-gradient-to-br from-orange-100 to-yellow-100 border-0 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          ⚡ AI Creations Left ⚡
        </h2>
        
        <div className="space-y-4">
          {/* Usage Counter */}
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {profile.subscription_status === 'premium' ? '∞' : remainingCreations}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {profile.subscription_status === 'premium' ? 'Unlimited Creations!' : 'Creations Left!'}
            </div>
            {profile.subscription_status !== 'premium' && (
              <div className="text-sm text-gray-600">
                Lifetime limit of {totalLimit}
              </div>
            )}
          </div>

          {/* Usage Bar */}
          {profile.subscription_status !== 'premium' && (
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Lifetime Usage</span>
                <span className="text-sm text-gray-600">{used}/{totalLimit}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Subscription Status */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700">Plan</div>
                <div className="text-lg font-bold text-gray-800 capitalize">
                  {profile.subscription_status} 
                  <span className="ml-2">
                    {profile.subscription_status === 'free' ? '🌟' : '👑'}
                  </span>
                </div>
              </div>
              {profile.subscription_status === 'free' && (
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 text-sm font-bold transform hover:scale-105 transition-all duration-200"
                  onClick={onUpgrade}
                >
                  Unlock More Fun! ✨
                </Button>
              )}
            </div>
          </div>

          {/* Fun Encouragement */}
          {remainingCreations > 0 || profile.subscription_status === 'premium' ? (
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-semibold text-green-800">
                You're doing great! Keep creating!
              </div>
            </div>
          ) : (
            <div className="bg-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-sm font-semibold text-blue-800">
                You've reached your creation limit! Upgrade for unlimited AI fun!
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // For B2B users, show daily/monthly limits
  const dailyRemaining = checkLimitsMutation.data?.dailyRemaining ?? null;
  const monthlyRemaining = checkLimitsMutation.data?.monthlyRemaining ?? null;
  const organizationName = checkLimitsMutation.data?.organizationName ?? null;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        ⚡ Daily AI Creations ⚡
      </h2>
      
      <div className="space-y-4">
        {/* Daily Usage Counter */}
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {dailyRemaining ?? '...'}
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Creations Left Today!
          </div>
          <div className="text-sm text-gray-600">
            Resets daily at midnight
          </div>
        </div>

        {/* Monthly Usage Counter */}
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {monthlyRemaining ?? '...'}
          </div>
          <div className="text-md font-semibold text-gray-700">
            Monthly Creations Left
          </div>
          <div className="text-sm text-gray-600">
            Resets monthly
          </div>
        </div>

        {/* School Info */}
        {organizationName && (
          <div className="bg-white rounded-xl p-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700">School</div>
              <div className="text-lg font-bold text-gray-800">
                {organizationName} 🏫
              </div>
            </div>
          </div>
        )}

        {/* Fun Encouragement */}
        {(dailyRemaining ?? 0) > 0 ? (
          <div className="bg-green-100 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <div className="text-sm font-semibold text-green-800">
              You're doing great! Keep creating!
            </div>
          </div>
        ) : (
          <div className="bg-orange-100 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-sm font-semibold text-orange-800">
              Daily limit reached! Come back tomorrow for more creations!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UsageControl;
