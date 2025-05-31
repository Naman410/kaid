import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { useSaveCreation } = useSupabaseData();
  const { toast } = useToast();
  const saveCreation = useSaveCreation();

  const [storyTitle, setStoryTitle] = useState('');
  const [storyGenre, setStoryGenre] = useState('adventure');
  const [storyLength, setStoryLength] = useState('short');
  const [currentInput, setCurrentInput] = useState('');
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default values pre-selected
  const genres = [
    { value: 'adventure', label: '🏴‍☠️ Adventure' },
    { value: 'fantasy', label: '🧙‍♂️ Fantasy' },
    { value: 'space', label: '🚀 Space Adventure' },
    { value: 'animals', label: '🐾 Animal Friends' },
    { value: 'magic', label: '✨ Magic & Wonder' }
  ];

  const storyLengths = [
    { value: 'short', label: '📄 Short (1000 characters)', chars: 1000 },
    { value: 'medium', label: '📋 Medium (3000 characters)', chars: 3000 },
    { value: 'long', label: '📚 Long (5000 characters)', chars: 5000 }
  ];

  const storyStarters = [
    "Once upon a time, in a land where robots and animals were best friends...",
    "In a magical treehouse high above the clouds...",
    "On a distant planet made entirely of candy...",
    "Deep in an enchanted forest where trees could talk...",
    "In a world where children could fly with special wings..."
  ];

  const handleAddStoryPart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create stories!",
        variant: "destructive"
      });
      return;
    }

    const finalInput = currentInput.trim() || "A magical adventure begins";
    
    setIsGenerating(true);

    try {
      // Check usage limits first
      const { data: usageData, error: usageError } = await supabase.functions.invoke('track-usage', {
        body: { userId: user.id, actionType: 'story_generation' }
      });

      if (usageError || !usageData.canProceed) {
        toast({
          title: "Usage Limit Reached",
          description: usageData?.message || "Please try again later",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Generate story with real AI
      const { data: storyData, error: storyError } = await supabase.functions.invoke('generate-story', {
        body: {
          prompt: storyParts.map(part => part.text).join(' '),
          genre: storyGenre,
          length: storyLength,
          userInput: finalInput
        }
      });

      if (storyError || !storyData.success) {
        throw new Error(storyData?.error || 'Failed to generate story');
      }

      const newPart: StoryPart = {
        id: Date.now().toString(),
        text: `${finalInput}\n\n${storyData.story}`,
        timestamp: new Date()
      };

      setStoryParts(prev => [...prev, newPart]);
      setCurrentInput('');

      // Save to database
      saveCreation.mutate({
        type: 'story',
        data: {
          title: storyTitle || 'My Amazing Story',
          genre: storyGenre,
          length: storyLength,
          parts: [...storyParts, newPart],
          user_input: finalInput,
          ai_generated: storyData.story
        }
      });

      toast({
        title: "Story Created! ✨",
        description: `${usageData.remainingUses} creations left today`,
      });

    } catch (error) {
      console.error('Story generation error:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Try again with a different story idea!",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewStory = () => {
    setStoryParts([]);
    setStoryTitle('');
    setCurrentInput('');
  };

  const useStoryStarter = (starter: string) => {
    setCurrentInput(starter);
  };

  const handleDownload = () => {
    console.log('Download story feature - coming soon!');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-4xl font-bold text-gray-800">📚 Story Treehouse 📚</h1>
            <p className="text-lg text-gray-600">Write magical stories with AI!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Story Setup */}
        {storyParts.length === 0 && (
          <Card className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🌟 Start Your Story! 🌟
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Story Title 📖
                </label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="My Amazing Adventure"
                  className="rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Story Type 🎭
                </label>
                <Select value={storyGenre} onValueChange={setStoryGenre}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white">
                    <SelectValue />
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

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Story Length 📏
                </label>
                <Select value={storyLength} onValueChange={setStoryLength}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-purple-200 focus:border-purple-400 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storyLengths.map((length) => (
                      <SelectItem key={length.value} value={length.value}>
                        {length.label}
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
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="rounded-xl"
                >
                  💾 Download
                </Button>
                <Button
                  onClick={startNewStory}
                  variant="outline"
                  className="rounded-xl"
                >
                  🔄 New Story
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {storyParts.map((part, index) => (
                <div key={part.id} className="border-l-4 border-purple-300 pl-6 space-y-4">
                  {/* Image positioned between title and story text */}
                  {part.illustration && (
                    <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={part.illustration}
                        alt={`Story illustration ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">{part.text}</p>
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
              className="min-h-32 rounded-xl border-2 border-teal-200 focus:border-teal-400 bg-white resize-none text-lg"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500">
              {currentInput.length}/1000 characters
            </div>

            <Button
              onClick={handleAddStoryPart}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating Magic... ✨</span>
                </div>
              ) : (
                'Continue Story with AI! 📖'
              )}
            </Button>
            
            <p className="text-xs text-gray-400 text-center">
              Powered by real AI! Each story is unique and created just for you! ✨
            </p>
          </div>
        </Card>

        {/* Future Features */}
        <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🚀 Coming Soon Features! 🚀
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              disabled
              variant="outline"
              className="p-4 h-auto flex flex-col space-y-2 rounded-xl bg-white opacity-75"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-sm font-medium">Create using image</span>
              <span className="text-xs text-gray-500">Coming Soon!</span>
            </Button>
            
            <Button
              disabled
              variant="outline"
              className="p-4 h-auto flex flex-col space-y-2 rounded-xl bg-white opacity-75"
            >
              <span className="text-2xl">🎤</span>
              <span className="text-sm font-medium">Create using voice</span>
              <span className="text-xs text-gray-500">Coming Soon!</span>
            </Button>
            
            <Button
              disabled
              variant="outline"
              className="p-4 h-auto flex flex-col space-y-2 rounded-xl bg-white opacity-75"
            >
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium">Comic creation</span>
              <span className="text-xs text-gray-500">Coming Soon!</span>
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
