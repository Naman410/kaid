import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import DrawingCanvas from './drawing/DrawingCanvas';

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

  // Default style is now pre-selected
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
            <h1 className="text-4xl font-bold text-gray-800">🎨 Art Studio 🎨</h1>
            <p className="text-lg text-gray-600">Create beautiful pictures with AI!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Image Generation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="p-6 bg-gradient-to-br from-green-100 to-blue-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🖼️ AI Image Creator 🖼️
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  What do you want to create? 💭
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your amazing picture in detail..."
                  className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-400 bg-white p-4 text-lg min-h-32 resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {prompt.length}/1000 characters
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Choose an art style! 🎭
                </label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-400 bg-white">
                    <SelectValue placeholder="Pick a style..." />
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
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Art... 🎨</span>
                  </div>
                ) : (
                  'Generate My Image with AI! 🖼️'
                )}
              </Button>
            </div>
          </Card>

          {/* Generated Image Display */}
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🖼️ Your AI Artwork 🖼️
            </h2>

            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="AI Generated artwork"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <span className="text-lg">✨</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-800">Your AI Creation:</h3>
                  <p className="text-sm text-gray-600 italic">"{prompt || 'A happy robot in a beautiful garden'}"</p>
                  <p className="text-sm text-gray-500">Style: {selectedStyle}</p>
                  <p className="text-xs text-green-600">✨ Created with real AI magic!</p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={handleDownload}
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    💾 Download
                  </Button>
                  <Button 
                    onClick={() => setGeneratedImage(null)}
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    🔄 Create New
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-12">
                <div className="text-6xl">🎨</div>
                <p className="text-lg text-gray-600">
                  Describe what you want to create!
                </p>
                <p className="text-sm text-gray-500">
                  Your beautiful AI artwork will appear here! ✨
                </p>
                <p className="text-xs text-gray-400">
                  Powered by real AI - each image is unique!
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Prompt Suggestions */}
        <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            💡 Need Ideas? Try These! 💡
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {promptSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => handlePromptSuggestion(suggestion)}
                variant="outline"
                className="p-4 h-auto text-left rounded-xl bg-white hover:bg-orange-50 transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Drawing Canvas Section */}
        <DrawingCanvas />
      </div>
    </div>
  );
};

export default ImageZone;
