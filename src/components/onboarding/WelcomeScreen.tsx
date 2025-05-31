
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <div className="text-center space-y-6">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              KaiD
            </h1>
            <div className="text-2xl font-medium text-gray-700">
              Your AI Adventure Starts Here! 🚀
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
            <div className="text-8xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Meet D.I.A., Your AI Friend!
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to a magical world where you can create music, make art, 
              write stories, and learn about AI in the most fun way possible!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <div className="bg-yellow-100 rounded-xl p-4 text-center">
              <div className="text-4xl mb-2">🎵</div>
              <div className="font-semibold text-gray-700">Make Music</div>
            </div>
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="font-semibold text-gray-700">Create Art</div>
            </div>
            <div className="bg-blue-100 rounded-xl p-4 text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="font-semibold text-gray-700">Tell Stories</div>
            </div>
          </div>

          <Button 
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Let's Start the Adventure! ✨
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
