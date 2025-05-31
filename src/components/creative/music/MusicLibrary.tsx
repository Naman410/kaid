
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';

interface MusicLibraryProps {
  musicCreations: any[];
  currentTrack: any;
  isPlaying: boolean;
  onSelectTrack: (track: any) => void;
  onPlayPause: (track: any) => void;
}

const MusicLibrary = ({ 
  musicCreations, 
  currentTrack, 
  isPlaying, 
  onSelectTrack, 
  onPlayPause 
}: MusicLibraryProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting in queue... 🎵';
      case 'processing': return 'Creating your music... 🎶';
      case 'completed': return 'Ready to play! 🎸';
      case 'failed': return 'Generation failed 😔';
      default: return 'Processing... 🎼';
    }
  };

  // Sort music creations to show latest completed first
  const sortedMusicCreations = musicCreations ? [...musicCreations].sort((a, b) => {
    // Completed tracks first
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (b.status === 'completed' && a.status !== 'completed') return 1;
    // Then by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  if (!sortedMusicCreations || sortedMusicCreations.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🎵 Your Music Library 🎵
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMusicCreations.map((creation) => (
          <div
            key={creation.id}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
            onClick={() => creation.status === 'completed' && onSelectTrack(creation)}
          >
            {/* Album Art Thumbnail */}
            <div className="relative mb-3">
              {creation.image_url ? (
                <img 
                  src={creation.image_url} 
                  alt={creation.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🎵</span>
                </div>
              )}
              
              {creation.status === 'completed' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPause(creation);
                  }}
                  size="sm"
                  className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 bg-white/80 hover:bg-white text-gray-800"
                >
                  {isPlaying && currentTrack?.id === creation.id ? 
                    <Pause className="w-4 h-4" /> : 
                    <Play className="w-4 h-4" />
                  }
                </Button>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-2 truncate">{creation.title}</h3>
            
            {creation.duration && (
              <p className="text-xs text-gray-500 mb-1">
                {formatDuration(creation.duration)}
              </p>
            )}
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{creation.prompt}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {creation.instrumental ? '🎹 Instrumental' : '🎤 With Lyrics'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                creation.status === 'completed' ? 'bg-green-100 text-green-700' :
                creation.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {getStatusMessage(creation.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MusicLibrary;
