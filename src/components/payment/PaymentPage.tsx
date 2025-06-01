
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PaymentPageProps {
  onBack: () => void;
}

const PaymentPage = ({ onBack }: PaymentPageProps) => {
  const freeFeatures = [
    "5 AI creations per day",
    "Basic music generation",
    "Simple image creation",
    "Short story writing",
    "Learning tracks access"
  ];

  const premiumFeatures = [
    "Unlimited AI creations",
    "Advanced music styles",
    "High-quality image generation",
    "Long story creation",
    "Priority support",
    "Early access to new features",
    "Download all your creations",
    "Advanced drawing tools"
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-xl"
          >
            ← Back to Hub
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">🌟 Unlock More Fun! 🌟</h1>
            <p className="text-gray-600">Choose your plan and start creating without limits!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Current Plan Status */}
        <Card className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 border-0 rounded-2xl shadow-lg">
          <div className="text-center space-y-3">
            <div className="text-4xl">🆓</div>
            <h2 className="text-2xl font-bold text-gray-800">You're currently on our Free Plan</h2>
            <p className="text-gray-600 text-lg">
              You have limited access to AI models and can create up to 5 AI creations per day.
            </p>
          </div>
        </Card>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌟</div>
              <h3 className="text-2xl font-bold text-gray-800">Free Plan</h3>
              <div className="text-4xl font-bold text-gray-600">$0</div>
              <div className="text-gray-500">per month</div>
              
              <div className="space-y-3 pt-4">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                disabled 
                className="w-full mt-6 bg-gray-400 text-white rounded-xl py-3"
              >
                Current Plan ✓
              </Button>
            </div>
          </Card>

          {/* Premium Plan */}
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl shadow-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR! 🚀
              </div>
            </div>
            
            <div className="text-center space-y-4 mt-4">
              <div className="text-6xl">👑</div>
              <h3 className="text-2xl font-bold text-gray-800">Premium Plan</h3>
              <div className="text-4xl font-bold text-purple-600">$10</div>
              <div className="text-gray-500">per month</div>
              
              <div className="space-y-3 pt-4">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-3 text-lg font-bold transform hover:scale-105 transition-all duration-200"
                onClick={() => console.log('Redirect to payment processing - Phase 2')}
              >
                Upgrade Now! ✨
              </Button>
            </div>
          </Card>
        </div>

        {/* Benefits Highlight */}
        <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎉 Why Choose Premium? 🎉
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">🚀</div>
              <h3 className="text-lg font-bold text-gray-800">Unlimited Creativity</h3>
              <p className="text-gray-600">Create as much as you want without daily limits!</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-4xl">🎨</div>
              <h3 className="text-lg font-bold text-gray-800">Better Quality</h3>
              <p className="text-gray-600">Access to premium AI models for better results!</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-4xl">💾</div>
              <h3 className="text-lg font-bold text-gray-800">Keep Everything</h3>
              <p className="text-gray-600">Download and save all your amazing creations!</p>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            ❓ Frequently Asked Questions ❓
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes! You can cancel your subscription at any time from your parent dashboard.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2">Is my data safe?</h3>
              <p className="text-gray-600">Absolutely! We follow strict child safety guidelines and never share your data.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2">What happens to my creations?</h3>
              <p className="text-gray-600">All your creations are saved and you can download them anytime with Premium!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
