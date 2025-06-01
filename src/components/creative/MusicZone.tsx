
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MusicGenerator from './music/MusicGenerator';
import MusicPlayer from './music/MusicPlayer';
import MusicLibrary from './music/MusicLibrary';

interface MusicZoneProps {
  onBack: () => void;
}

const MusicZone = ({ onBack }: MusicZoneProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useGenerateMusic, useUserMusicCreations } = useSupabaseData();
  const generateMusicMutation = useGenerateMusic();
  const { data: musicCreations, refetch: refetchMusic } = useUserMusicCreations();

  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Set the latest completed track as current track on load
  useEffect(() => {
    if (musicCreations && musicCreations.length > 0 && !currentTrack) {
      const latestCompleted = musicCreations.find(creation => creation.status === 'completed');
      if (latestCompleted) {
        setCurrentTrack(latestCompleted);
      }
    }
  }, [musicCreations, currentTrack]);

  // Poll for music creation updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (musicCreations?.some(creation => creation.status === 'pending' || creation.status === 'processing')) {
        refetchMusic();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [musicCreations, refetchMusic]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    };
  }, [currentAudio]);

  const handleGenerateMusic = async (params: {
    prompt: string;
    style: string;
    title: string;
    instrumental: boolean;
  }) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to create music",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateMusicMutation.mutateAsync(params);

      toast({
        title: "Music generation started! 🎵",
        description: "We're creating your music! Please come back in a few minutes and reload the page to see your creation.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start music generation",
        variant: "destructive"
      });
    }
  };

  const handlePlayPause = (track: any) => {
    if (!track.audio_url) return;

    if (currentAudio && currentTrack?.id === track.id) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
    } else {
      if (currentAudio) {
        currentAudio.pause();
      }
      
      const audio = new Audio(track.audio_url);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });
      
      audio.addEventListener('error', () => {
        toast({
          title: "Error",
          description: "Failed to load audio",
          variant: "destructive"
        });
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      setCurrentAudio(audio);
      setCurrentTrack(track);
      setIsPlaying(true);
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Music Zone Card */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            🎵 Music Studio 🎵
          </CardTitle>
          <p className="text-gray-600">Create amazing music with AI!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Music Creation Interface */}
          <div className="grid grid-cols-1 gap-6">
            {/* Music Generator */}
            <MusicGenerator 
              onGenerateMusic={handleGenerateMusic}
              isGenerating={generateMusicMutation.isPending}
            />

            {/* Music Player */}
            <MusicPlayer 
              currentTrack={currentTrack}
              onClearTrack={() => setCurrentTrack(null)}
            />
          </div>

          {/* Music Library */}
          <MusicLibrary 
            musicCreations={musicCreations || []}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={setCurrentTrack}
            onPlayPause={handlePlayPause}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicZone;
