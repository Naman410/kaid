
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MusicPlayerProps {
  currentTrack: any;
  onClearTrack: () => void;
}

const MusicPlayer = ({ currentTrack, onClearTrack }: MusicPlayerProps) => {
  const { toast } = useToast();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDirectDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎧 Music Player 🎧
      </h2>

      {currentTrack && currentTrack.status === 'completed' ? (
        <div className="space-y-6">
          {/* Album Art and Track Info */}
          <div className="text-center">
            {currentTrack.image_url ? (
              <img 
                src={currentTrack.image_url} 
                alt={currentTrack.title}
                className="w-48 h-48 mx-auto rounded-2xl shadow-lg object-cover mb-4"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl shadow-lg flex items-center justify-center mb-4">
                <span className="text-6xl">🎵</span>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {currentTrack.title}
            </h3>
            
            {currentTrack.duration && (
              <p className="text-sm text-gray-600 mb-2">
                Duration: {formatDuration(currentTrack.duration)}
              </p>
            )}
            
            {currentTrack.tags && (
              <p className="text-xs text-gray-500 mb-4">
                {currentTrack.tags}
              </p>
            )}
          </div>

          {/* Enhanced Controls */}
          <div className="bg-white rounded-xl p-4 shadow-inner">
            <audio 
              controls 
              className="w-full"
              src={currentTrack.audio_url}
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Download Options */}
          <div className="flex space-x-3">
            <Button 
              onClick={() => handleDirectDownload(currentTrack.audio_url, `${currentTrack.title}.mp3`)}
              variant="outline" 
              className="flex-1 rounded-xl bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Audio
            </Button>
            
            {currentTrack.image_url && (
              <Button 
                onClick={() => handleDirectDownload(currentTrack.image_url, `${currentTrack.title}-cover.jpg`)}
                variant="outline" 
                className="flex-1 rounded-xl bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Cover
              </Button>
            )}
            
            <Button 
              onClick={onClearTrack}
              variant="outline" 
              className="flex-1 rounded-xl bg-white hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-12">
          <div className="text-6xl">🎼</div>
          <p className="text-lg text-gray-600">
            Your music creations will appear here!
          </p>
        </div>
      )}
    </Card>
  );
};

export default MusicPlayer;
