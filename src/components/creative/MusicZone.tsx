import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MusicGenerator from './music/MusicGenerator';
import MusicPlayer from './music/MusicPlayer';
import MusicLibrary from './music/MusicLibrary';

interface MusicZoneProps {
  onBack: () => void;
}

const MusicZone = ({ onBack }: MusicZoneProps) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { toast } = useToast();
  const { useGenerateMusic, useUserMusicCreations } = useSupabaseData();
  const generateMusicMutation = useGenerateMusic();
  const { data: musicCreations, refetch: refetchMusic } = useUserMusicCreations();

  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // Check usage limits on component mount
  useEffect(() => {
    checkUsageLimits();
  }, [profile]);

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

  const checkUsageLimits = () => {
    if (profile) {
      const totalLimit = profile.subscription_status === 'premium' ? 999999 : 10;
      const used = profile.total_creations_used || 0;
      setIsBlocked(used >= totalLimit);
    }
  };

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

    if (isBlocked) {
      toast({
        title: "Creation limit reached! 🔒",
        description: "Upgrade to Pro Plan for unlimited creations!",
        variant: "destructive"
      });
      return;
    }

    try {
      // Track usage before generating
      const { data: usageResult } = await supabase.functions.invoke('track-usage', {
        body: { userId: user.id, actionType: 'music_creation' }
      });

      if (!usageResult?.canProceed) {
        setIsBlocked(true);
        toast({
          title: "Creation limit reached! 🔒",
          description: usageResult?.message || "Upgrade to Pro Plan for unlimited creations!",
          variant: "destructive"
        });
        return;
      }

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
            <h1 className="text-4xl font-bold text-gray-800">🎵 Sound Cave 🎵</h1>
            <p className="text-lg text-gray-600">Create amazing music with AI!</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Music Creation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Music Generator */}
          <MusicGenerator 
            onGenerateMusic={handleGenerateMusic}
            isGenerating={generateMusicMutation.isPending}
            isBlocked={isBlocked}
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
      </div>
    </div>
  );
};

export default MusicZone;
