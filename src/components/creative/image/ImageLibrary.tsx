
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImageCreation {
  id: string;
  creation_data: {
    prompt: string;
    style: string;
    image_url: string;
  };
  created_at: string;
}

interface ImageLibraryProps {
  imageCreations: ImageCreation[];
  onSelectImage: (image: ImageCreation) => void;
}

const ImageLibrary = ({ imageCreations, onSelectImage }: ImageLibraryProps) => {
  if (!imageCreations || imageCreations.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 border-0 rounded-2xl shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎨</div>
          <h3 className="text-2xl font-bold text-gray-700">No Artwork Yet</h3>
          <p className="text-gray-600">Start creating some amazing AI art to see it here!</p>
        </div>
      </Card>
    );
  }

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-artwork-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.click();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🖼️ Your Art Gallery 🖼️
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageCreations.map((creation) => (
          <div key={creation.id} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="relative mb-3">
              <img
                src={creation.creation_data.image_url}
                alt={creation.creation_data.prompt}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onSelectImage(creation)}
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                <span className="text-sm">✨</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium line-clamp-2">
                "{creation.creation_data.prompt}"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{creation.creation_data.style}</span>
                <span>{new Date(creation.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2 mt-3">
              <Button
                onClick={() => onSelectImage(creation)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                👁️ View
              </Button>
              <Button
                onClick={() => handleDownload(creation.creation_data.image_url, creation.creation_data.prompt)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                💾 Save
              </Button>
            </div>
          </div>
        ))}
      </div>

      {imageCreations.length > 6 && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Showing {Math.min(imageCreations.length, 6)} of {imageCreations.length} artworks
          </p>
        </div>
      )}
    </Card>
  );
};

export default ImageLibrary;
