
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoryTreehouseProps {
  onBack: () => void;
}

interface StoryPart {
  id: string;
  text: string;
  illustration?: string;
  timestamp: Date;
}

const StoryTreehouse = ({ onBack }: StoryTreehouseProps) => {
  const [storyTitle, setStoryTitle] = useState('');
  const [storyGenre, setStoryGenre] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const genres = [
    { value: 'adventure', label: '🏴‍☠️ Adventure' },
    { value: 'fantasy', label: '🧙‍♂️ Fantasy' },
    { value: 'space', label: '🚀 Space Adventure' },
    { value: 'animals', label: '🐾 Animal Friends' },
    { value: 'magic', label: '✨ Magic & Wonder' }
  ];

  const storyStarters = [
    "Once upon a time, in a land where robots and animals were best friends...",
    "In a magical treehouse high above the clouds...",
    "On a distant planet made entirely of candy...",
    "Deep in an enchanted forest where trees could talk...",
    "In a world where children could fly with special wings..."
  ];

  const mockIllustrations = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=300&h=200&fit=crop"
  ];

  const handleAddStoryPart = () => {
    if (!currentInput.trim()) return;

    setIsGenerating(true);

    // Simulate AI story generation and illustration (placeholder for Phase 3 GPT + DALL-E)
    setTimeout(() => {
      const aiContinuation = generateAIContinuation(currentInput);
      const randomIllustration = mockIllustrations[Math.floor(Math.random() * mockIllustrations.length)];

      const newPart: StoryPart = {
        id: Date.now().toString(),
        text: `${currentInput} ${aiContinuation}`,
        illustration: randomIllustration,
        timestamp: new Date()
      };

      setStoryParts(prev => [...prev, newPart]);
      setCurrentInput('');
      setIsGenerating(false);

      // Mock save to creations
      console.log('Saving story part:', newPart);
    }, 2500);
  };

  const generateAIContinuation = (userInput: string): string => {
    // Placeholder AI responses (will be replaced with GPT in Phase 3)
    const continuations = [
      "Suddenly, a friendly dragon appeared with sparkling scales that shimmered in the sunlight! 🐉✨",
      "The magical door opened to reveal a garden where flowers sang beautiful songs! 🌺🎵",
      "A wise owl flew down and whispered a secret that would change everything! 🦉💫",
      "The ground began to glow with rainbow colors, leading the way to an amazing discovery! 🌈✨",
      "A gentle breeze carried the sound of laughter from somewhere beyond the misty mountains! 🌬️😊"
    ];

    return continuations[Math.floor(Math.random() * continuations.length)];
  };

  const startNewStory = () => {
    setStoryParts([]);
    setStoryTitle('');
    setCurrentInput('');
  };

  const useStoryStarter = (starter: string) => {
    setCurrentInput(starter);
  };

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
            <h1 className="text-3xl font-bold text-gray-800">📚 Story Treehouse 📚</h1>
            <p className="text-gray-600">Write magical stories with AI!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Story Setup */}
        {storyParts.length === 0 && (
          <Card className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🌟 Start Your Story! 🌟
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Story Title 📖
                </label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Give your story an awesome title!"
                  className="rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Story Type 🎭
                </label>
                <Select value={storyGenre} onValueChange={setStoryGenre}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white">
                    <SelectValue placeholder="What kind of story?" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.value} value={genre.value}>
                        {genre.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Story Starters (only show if no story started) */}
        {storyParts.length === 0 && (
          <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              💡 Need a Story Starter? 💡
            </h2>
            
            <div className="space-y-3">
              {storyStarters.map((starter, index) => (
                <Button
                  key={index}
                  onClick={() => useStoryStarter(starter)}
                  variant="outline"
                  className="w-full p-4 h-auto text-left rounded-xl bg-white hover:bg-orange-50 transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-sm">{starter}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Story Display */}
        {storyParts.length > 0 && (
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {storyTitle || 'My Amazing Story'} ✨
              </h2>
              <Button
                onClick={startNewStory}
                variant="outline"
                className="rounded-xl"
              >
                🔄 New Story
              </Button>
            </div>

            <div className="space-y-6">
              {storyParts.map((part, index) => (
                <div key={part.id} className="border-l-4 border-purple-300 pl-6 space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <p className="text-gray-800 leading-relaxed">{part.text}</p>
                      </div>
                    </div>
                    {part.illustration && (
                      <div className="w-32 h-24 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={part.illustration}
                          alt={`Story illustration ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Story Input */}
        <Card className="p-6 bg-gradient-to-br from-green-100 to-teal-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            ✍️ Continue Your Story! ✍️
          </h2>
          
          <div className="space-y-4">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="What happens next in your story? Write a few sentences and I'll help continue it!"
              className="min-h-24 rounded-xl border-2 border-teal-200 focus:border-teal-400 bg-white resize-none"
              maxLength={200}
            />
            <div className="text-xs text-gray-500">
              {currentInput.length}/200 characters
            </div>

            <Button
              onClick={handleAddStoryPart}
              disabled={!currentInput.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Writing Magic... ✨</span>
                </div>
              ) : (
                'Continue Story! 📖'
              )}
            </Button>
          </div>
        </Card>

        {/* Plan B: Mad Libs Style */}
        <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🎯 Quick Story Game! 🎯
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Fill in the blanks to create a silly story!
          </p>
          
          <div className="bg-white rounded-xl p-4 space-y-2">
            <p className="text-gray-800">
              Once upon a time, there was a <span className="bg-yellow-200 px-2 rounded">brave</span> robot
              who loved to <span className="bg-blue-200 px-2 rounded">dance</span> with
              <span className="bg-green-200 px-2 rounded">unicorns</span> in the
              <span className="bg-pink-200 px-2 rounded">magical forest</span>! 
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full mt-4 rounded-xl bg-white hover:bg-purple-50"
            onClick={() => console.log('Starting Mad Libs game')}
          >
            Play Mad Libs! 🎪
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default StoryTreehouse;
