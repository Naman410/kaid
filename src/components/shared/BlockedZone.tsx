
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface BlockedZoneProps {
  title: string;
  description: string;
  onUpgrade: () => void;
}

const BlockedZone = ({ title, description, onUpgrade }: BlockedZoneProps) => {
  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-8 text-center space-y-6">
        <div className="space-y-4">
          <Lock className="w-16 h-16 text-gray-400 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transform hover:scale-105 transition-all duration-200"
        >
          Get Pro Plan! ✨
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlockedZone;
