
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface UsageControlProps {
  onUpgrade: () => void;
}

const UsageControl = ({ onUpgrade }: UsageControlProps) => {
  const { profile } = useAuth();
  
  // Show lifetime usage data instead of daily
  const [usageData] = useState({
    totalLimit: profile?.subscription_status === 'premium' ? 50 : 10,
    used: profile?.total_creations_used || 0,
    subscriptionStatus: profile?.subscription_status || 'free'
  });

  const remainingCreations = Math.max(0, usageData.totalLimit - usageData.used);
  const usagePercentage = (usageData.used / usageData.totalLimit) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-100 to-yellow-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        ⚡ AI Creations Left ⚡
      </h2>
      
      <div className="space-y-4">
        {/* Usage Counter */}
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {remainingCreations}
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Creations Left Total!
          </div>
          <div className="text-sm text-gray-600">
            Lifetime limit
          </div>
        </div>

        {/* Usage Bar */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Total Usage</span>
            <span className="text-sm text-gray-600">{usageData.used}/{usageData.totalLimit}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-700">Plan</div>
              <div className="text-lg font-bold text-gray-800 capitalize">
                {usageData.subscriptionStatus} 
                <span className="ml-2">
                  {usageData.subscriptionStatus === 'free' ? '🌟' : '👑'}
                </span>
              </div>
            </div>
            {usageData.subscriptionStatus === 'free' && (
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
        {remainingCreations > 0 ? (
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
              {usageData.subscriptionStatus === 'premium' 
                ? 'Wow! You\'ve used all your creations!' 
                : 'Upgrade for unlimited AI fun!'}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UsageControl;
