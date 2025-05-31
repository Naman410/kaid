
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageZoneProps {
  onBack: () => void;
}

const ImageZone = ({ onBack }: ImageZoneProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
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

  const mockImages = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop"
  ];

  const handleGenerateImage = () => {
    if (!prompt.trim() || !selectedStyle) return;

    setIsGenerating(true);
    
    // Simulate API call (placeholder for Phase 3 DALL-E integration)
    setTimeout(() => {
      const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      setGeneratedImage(randomImage);
      setIsGenerating(false);
      
      // Mock save to creations
      console.log('Saving image creation:', {
        type: 'image',
        prompt: prompt,
        style: selectedStyle,
        image_url: randomImage
      });
    }, 4000);
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion.replace(/[🎨📸✨🚀🌊🤖🌺🏰🐻☕🪐🏠🌳]/g, '').trim());
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
            <h1 className="text-3xl font-bold text-gray-800">🎨 Art Studio 🎨</h1>
            <p className="text-gray-600">Create beautiful pictures with AI!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Image Generation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="p-6 bg-gradient-to-br from-green-100 to-blue-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🖼️ Image Creator 🖼️
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  What do you want to create? 💭
                </label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your amazing picture..."
                  className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-400 bg-white p-4 text-lg"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {prompt.length}/100 characters
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
                disabled={!prompt.trim() || !selectedStyle || isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Art... 🎨</span>
                  </div>
                ) : (
                  'Generate My Image! 🖼️'
                )}
              </Button>
            </div>
          </Card>

          {/* Generated Image Display */}
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🖼️ Your Artwork 🖼️
            </h2>

            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated artwork"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <span className="text-lg">✨</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-800">Your Creation:</h3>
                  <p className="text-sm text-gray-600 italic">"{prompt}"</p>
                  <p className="text-sm text-gray-500">Style: {selectedStyle}</p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    💾 Save
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    🔄 Try Again
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
                  Your beautiful artwork will appear here! ✨
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

        {/* Plan B: Drawing Tools */}
        <Card className="p-6 bg-gradient-to-r from-pink-100 to-rose-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            ✏️ Drawing Tools ✏️
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Create your own masterpiece with these tools!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🖍️ Crayon', '✏️ Pencil', '🖌️ Brush', '🖊️ Pen', '🌈 Rainbow', '⭐ Stickers', '🔺 Shapes', '📐 Lines'].map((tool) => (
              <Button
                key={tool}
                variant="outline"
                className="p-4 h-auto flex flex-col space-y-2 rounded-xl bg-white hover:bg-pink-50 transform hover:scale-105 transition-all duration-200"
                onClick={() => console.log(`Selected ${tool}`)}
              >
                <span className="text-2xl">{tool.split(' ')[0]}</span>
                <span className="text-sm font-medium">{tool.split(' ')[1]}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImageZone;
