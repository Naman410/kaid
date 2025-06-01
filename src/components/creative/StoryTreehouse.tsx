
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const genres = [
    { value: 'adventure', label: '🏴‍☠️ Adventure' },
    { value: 'fantasy', label: '🧙‍♂️ Fantasy' },
    { value: 'space', label: '🚀 Space Adventure' },
    { value: 'animals', label: '🐾 Animal Friends' },
    { value: 'magic', label: '✨ Magic & Wonder' }
  ];

  const storyLengths = [
    { value: 'short', label: '📄 Short Story' },
    { value: 'medium', label: '📋 Medium Story' },
    { value: 'long', label: '📚 Long Story' }
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

  return (
    <div className="space-y-6">
      {/* Main Story Treehouse Card */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            📚 Story Treehouse 📚
          </CardTitle>
          <p className="text-gray-600">Write magical stories with AI!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Story Setup */}
          {storyParts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title 📖
                </label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="My Amazing Adventure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Type 🎭
                </label>
                <Select value={storyGenre} onValueChange={setStoryGenre}>
                  <SelectTrigger>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Length 📏
                </label>
                <Select value={storyLength} onValueChange={setStoryLength}>
                  <SelectTrigger>
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
          )}

          {/* Story Starters */}
          {storyParts.length === 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">💡 Story Starters</h3>
              <div className="space-y-2">
                {storyStarters.map((starter, index) => (
                  <Button
                    key={index}
                    onClick={() => useStoryStarter(starter)}
                    variant="outline"
                    className="w-full text-left h-auto p-3 text-sm"
                  >
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Story Display */}
          {storyParts.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {storyTitle || 'My Amazing Story'} ✨
                </h3>
                <Button
                  onClick={startNewStory}
                  variant="outline"
                  size="sm"
                >
                  🔄 New Story
                </Button>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
                {storyParts.map((part, index) => (
                  <div key={part.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{part.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story Input */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">✍️ Continue Your Story</h3>
            <div className="space-y-4">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="What happens next in your story?"
                className="min-h-24 resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500">
                {currentInput.length}/1000 characters
              </div>

              <Button
                onClick={handleAddStoryPart}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Magic... ✨</span>
                  </div>
                ) : (
                  'Continue Story with AI! 📖'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryTreehouse;
