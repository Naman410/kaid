
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface IntroToKaiDProps {
  onComplete: () => void;
}

const IntroToKaiD = ({ onComplete }: IntroToKaiDProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "What is AI? 🤖",
      content: "AI helps computers learn and create, just like how you learn new things every day!",
      visual: "🧠💡",
      bgColor: "from-blue-200 to-purple-200"
    },
    {
      title: "AI is Your Creative Helper! 🎨",
      content: "With AI, you can make amazing music, beautiful pictures, and exciting stories!",
      visual: "🎵🖼️📖",
      bgColor: "from-green-200 to-blue-200"
    },
    {
      title: "Meet D.I.A.! 👋",
      content: "D.I.A. is your friendly AI companion who will help you explore and create amazing things!",
      visual: "🤖✨",
      bgColor: "from-yellow-200 to-pink-200"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <div className="text-center space-y-8">
          <div className="flex justify-center space-x-2 mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-purple-500 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className={`bg-gradient-to-r ${currentSlideData.bgColor} rounded-3xl p-8 space-y-6`}>
            <div className="text-8xl">{currentSlideData.visual}</div>
            <h2 className="text-3xl font-bold text-gray-800">
              {currentSlideData.title}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              {currentSlideData.content}
            </p>
          </div>

          <Button 
            onClick={nextSlide}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {currentSlide < slides.length - 1 ? 'Next! 👉' : 'Let\'s Go! 🚀'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default IntroToKaiD;
