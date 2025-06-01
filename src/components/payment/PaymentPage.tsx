
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentPageProps {
  onClose: () => void;
}

const PaymentPage = ({ onClose }: PaymentPageProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const plans = {
    free: {
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-400 to-purple-500',
      features: [
        '10 total AI creations',
        '50 DIA chat messages per day',
        'Basic templates',
        'Standard quality',
        'Community support'
      ],
      limitations: [
        'Limited creations',
        'No priority support',
        'Basic features only'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: '$9.99',
      period: 'per month',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited AI creations',
        'Unlimited DIA chat messages',
        'Premium templates',
        'High quality outputs',
        'Priority support',
        'Advanced AI features',
        'Custom settings',
        'Early access to new features'
      ],
      limitations: []
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upgrade Successful! 🎉",
        description: "Welcome to Pro! You now have unlimited AI creations.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
        <p className="text-white/80 text-lg">Unlock unlimited creativity with our Pro plan!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(plans).map(([key, plan]) => (
          <Card 
            key={key}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedPlan === key ? 'ring-4 ring-white shadow-2xl' : 'shadow-lg hover:shadow-xl'
            } ${key === 'pro' ? 'border-2 border-yellow-400' : ''}`}
            onClick={() => setSelectedPlan(key as 'free' | 'pro')}
          >
            {key === 'pro' && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                POPULAR
              </div>
            )}
            
            <CardHeader className={`bg-gradient-to-r ${plan.color} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {plan.icon}
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                </div>
                {selectedPlan === key && <Check className="w-6 h-6" />}
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">{plan.price}</div>
                <CardDescription className="text-white/90 text-lg">
                  {plan.period}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                  What's Included
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <X className="w-4 h-4 mr-2 text-red-500" />
                    Limitations
                  </h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="px-8 py-3 text-lg"
        >
          Maybe Later
        </Button>
        
        {selectedPlan === 'pro' ? (
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Upgrade to Pro! 👑'}
          </Button>
        ) : (
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
          >
            Continue with Free
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
