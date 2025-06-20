
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ImageLibrary from './image/ImageLibrary';

interface ImageCreation {
  id: string;
  creation_data: {
    prompt: string;
    style: string;
    image_url: string;
  };
  created_at: string;
}

const ImageZone = () => {
  const { user } = useAuth();
  const { useUserCreations, useSaveCreation, useCheckUserLimits } = useSupabaseData();
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cartoon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageCreation | null>(null);
  
  const { data: creations, isLoading: creationsLoading, refetch } = useUserCreations();
  const saveCreationMutation = useSaveCreation();
  const checkLimitsMutation = useCheckUserLimits();

  // Filter and transform creations to match ImageCreation interface
  const imageCreations: ImageCreation[] = creations
    ?.filter(creation => creation.creation_type === 'image')
    ?.map(creation => ({
      id: creation.id,
      creation_data: creation.creation_data as {
        prompt: string;
        style: string;
        image_url: string;
      },
      created_at: creation.created_at
    })) || [];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for your image!');
      return;
    }

    if (!user) {
      toast.error('Please log in to generate images');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Check usage limits
      const limitsResult = await checkLimitsMutation.mutateAsync();
      if (!limitsResult.canProceed) {
        toast.error('You have reached your daily creation limit. Please try again tomorrow!');
        return;
      }

      // Generate image
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      
      if (result.imageUrl) {
        // Save the creation
        await saveCreationMutation.mutateAsync({
          type: 'image',
          data: {
            prompt: prompt.trim(),
            style,
            image_url: result.imageUrl
          }
        });

        // Refresh the creations list
        refetch();
        
        // Clear the form
        setPrompt('');
        setStyle('cartoon');
        
        toast.success('Image generated successfully! 🎨');
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = (image: ImageCreation) => {
    setSelectedImage(image);
  };

  if (selectedImage) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <Button
              onClick={() => setSelectedImage(null)}
              variant="outline"
              className="rounded-xl"
            >
              ← Back to Gallery
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">AI Artwork</h1>
            <div></div>
          </div>

          {/* Selected Image Display */}
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <div className="text-center space-y-4">
              <img
                src={selectedImage.creation_data.image_url}
                alt={selectedImage.creation_data.prompt}
                className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
              />
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  "{selectedImage.creation_data.prompt}"
                </h2>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <span className="capitalize">{selectedImage.creation_data.style} style</span>
                  <span>•</span>
                  <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎨 AI Art Studio 🎨</h1>
          <p className="text-lg text-gray-600">Create amazing artwork with the power of AI!</p>
        </div>

        {/* Image Generator */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-lg font-semibold text-gray-700">
                What would you like to create? ✨
              </Label>
              <Input
                id="prompt"
                placeholder="A magical castle in the clouds, a friendly robot, a colorful butterfly..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-lg p-3 rounded-xl border-2 border-purple-200 focus:border-purple-400"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style" className="text-lg font-semibold text-gray-700">
                Choose your art style 🎭
              </Label>
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger className="text-lg p-3 rounded-xl border-2 border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoon">🎨 Cartoon</SelectItem>
                  <SelectItem value="realistic">📸 Realistic</SelectItem>
                  <SelectItem value="anime">🌟 Anime</SelectItem>
                  <SelectItem value="watercolor">🖌️ Watercolor</SelectItem>
                  <SelectItem value="sketch">✏️ Sketch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating your masterpiece...</span>
                </div>
              ) : (
                '🎨 Create My Artwork!'
              )}
            </Button>
          </div>
        </Card>

        {/* Image Library */}
        <ImageLibrary 
          imageCreations={imageCreations}
          onSelectImage={handleSelectImage}
        />
      </div>
    </div>
  );
};

export default ImageZone;
