
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface ImageZoneProps {
  onBack: () => void;
}

const ImageZone = ({ onBack }: ImageZoneProps) => {
  const { user } = useAuth();
  const { useSaveCreation } = useSupabaseData();
  const { toast } = useToast();
  const saveCreation = useSaveCreation();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const styles = [
    { value: 'cartoon', label: '🎨 Cartoon Fun' },
    { value: 'realistic', label: '📸 Realistic' },
    { value: 'fantasy', label: '✨ Fantasy Magic' },
    { value: 'space', label: '🚀 Space Adventure' },
    { value: 'underwater', label: '🌊 Underwater World' }
  ];

  const promptSuggestions = [
    "A friendly robot playing in a garden 🤖🌺",
    "A magical castle floating in the clouds ✨🏰",
    "Cute animals having a tea party 🐻☕",
    "A rocket ship exploring colorful planets 🚀🪐",
    "A treehouse in an enchanted forest 🏠🌳"
  ];

  const handleGenerateImage = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create images!",
        variant: "destructive"
      });
      return;
    }

    const finalPrompt = prompt.trim() || "A happy robot in a beautiful garden";
    
    setIsGenerating(true);

    try {
      // Check usage limits first
      const { data: usageData, error: usageError } = await supabase.functions.invoke('track-usage', {
        body: { userId: user.id, actionType: 'image_generation' }
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

      // Generate image with real AI
      const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: finalPrompt,
          style: selectedStyle
        }
      });

      if (imageError || !imageData.success) {
        throw new Error(imageData?.error || 'Failed to generate image');
      }

      setGeneratedImage(imageData.imageUrl);

      // Save to database
      saveCreation.mutate({
        type: 'image',
        data: {
          prompt: finalPrompt,
          style: selectedStyle,
          image_url: imageData.imageUrl,
          system_prompt: `Create a ${selectedStyle} style image that is completely safe and appropriate for children aged 5-10. ${finalPrompt}`
        }
      });

      toast({
        title: "Image Created! 🎨",
        description: `${usageData.remainingUses} creations left today`,
      });

    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Try again with a different image idea!",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion.replace(/[🎨📸✨🚀🌊🤖🌺🏰🐻☕🪐🏠🌳]/g, '').trim());
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'my-ai-artwork.png';
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Art Studio Card */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            🎨 Art Studio 🎨
          </CardTitle>
          <p className="text-gray-600">Create beautiful pictures with AI!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to create? 💭
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your amazing picture..."
                  className="min-h-24 resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {prompt.length}/1000 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose an art style! 🎭
                </label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Art... 🎨</span>
                  </div>
                ) : (
                  'Generate My Image! 🖼️'
                )}
              </Button>
            </div>

            {/* Generated Image Display */}
            <div className="space-y-4">
              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="AI Generated artwork"
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-gray-800">Your Creation:</h4>
                    <p className="text-sm text-gray-600 italic">"{prompt || 'A happy robot in a beautiful garden'}"</p>
                    <p className="text-xs text-gray-500">Style: {selectedStyle}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleDownload}
                      variant="outline" 
                      className="flex-1"
                    >
                      💾 Download
                    </Button>
                    <Button 
                      onClick={() => setGeneratedImage(null)}
                      variant="outline" 
                      className="flex-1"
                    >
                      🔄 Create New
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl">🎨</div>
                  <p className="text-gray-600">Your beautiful AI artwork will appear here!</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">💡 Need Ideas?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  onClick={() => handlePromptSuggestion(suggestion)}
                  variant="outline"
                  className="text-left h-auto p-3 text-sm"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageZone;
