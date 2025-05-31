
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Download, Play, Pause, RotateCcw } from 'lucide-react';

interface MusicZoneProps {
  onBack: () => void;
}

const MusicZone = ({ onBack }: MusicZoneProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { useGenerateMusic, useUserMusicCreations } = useSupabaseData();
  const generateMusicMutation = useGenerateMusic();
  const { data: musicCreations, refetch: refetchMusic } = useUserMusicCreations();

  const [selectedGenre, setSelectedGenre] = useState('happy');
  const [selectedMood, setSelectedMood] = useState('play');
  const [userPrompt, setUserPrompt] = useState('');
  const [musicName, setMusicName] = useState('');
  const [instrumental, setInstrumental] = useState(false);
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

  const genres = [
    { value: 'happy', label: '😊 Happy & Upbeat' },
    { value: 'calm', label: '😌 Calm & Peaceful' },
    { value: 'adventure', label: '🚀 Adventure Time' },
    { value: 'magical', label: '✨ Magical Wonder' },
    { value: 'playful', label: '🎮 Playful Fun' }
  ];

  const moods = [
    { value: 'morning', label: '🌅 Morning Energy' },
    { value: 'study', label: '📚 Study Time' },
    { value: 'play', label: '🎯 Play Time' },
    { value: 'bedtime', label: '🌙 Bedtime Chill' },
    { value: 'party', label: '🎉 Party Mode' }
  ];

  const generateRandomName = () => {
    const adjectives = ['Happy', 'Magical', 'Sunny', 'Dancing', 'Dreamy', 'Bouncy', 'Sparkly'];
    const nouns = ['Adventure', 'Song', 'Melody', 'Beat', 'Tune', 'Rhythm', 'Music'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj} ${randomNoun}`;
  };

  const handleGenerateMusic = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to create music",
        variant: "destructive"
      });
      return;
    }

    const finalPrompt = userPrompt.trim() || "Create a fun and happy tune";
    const finalName = musicName.trim() || generateRandomName();

    try {
      await generateMusicMutation.mutateAsync({
        prompt: `${finalPrompt} with ${selectedGenre} style and ${selectedMood} mood`,
        style: selectedGenre,
        title: finalName,
        instrumental: instrumental
      });

      toast({
        title: "Music generation started! 🎵",
        description: "We're creating your music! Please come back in a few minutes and reload the page to see your creation.",
      });

      // Clear form
      setUserPrompt('');
      setMusicName('');
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
          {/* Controls */}
          <Card className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎼 Music Generator 🎼
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Describe your music! 🎵
                </label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Tell me what kind of music you want to create... (optional)"
                  className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-400 bg-white resize-none min-h-24"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {userPrompt.length}/500 characters
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  What kind of music? 🎭
                </label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-400 bg-white">
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
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  What's the vibe? 🌈
                </label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-400 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Name your song! 🏷️
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={musicName}
                    onChange={(e) => setMusicName(e.target.value)}
                    placeholder="My Amazing Song"
                    className="flex-1 rounded-xl border-2 border-orange-200 focus:border-orange-400 bg-white"
                  />
                  <Button
                    onClick={() => setMusicName(generateRandomName())}
                    variant="outline"
                    className="rounded-xl"
                  >
                    🎲 Random
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={instrumental}
                  onCheckedChange={setInstrumental}
                />
                <label className="text-lg font-semibold text-gray-700">
                  Instrumental only (no lyrics)
                </label>
              </div>

              <Button
                onClick={handleGenerateMusic}
                disabled={generateMusicMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                {generateMusicMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Starting Creation... 🎵</span>
                  </div>
                ) : (
                  '🎶 Create My Music! 🎶'
                )}
              </Button>
            </div>
          </Card>

          {/* Enhanced Player */}
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
                    onClick={() => setCurrentTrack(null)}
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
        </div>

        {/* Enhanced Music Library */}
        {sortedMusicCreations && sortedMusicCreations.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🎵 Your Music Library 🎵
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMusicCreations.map((creation) => (
                <div
                  key={creation.id}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
                  onClick={() => creation.status === 'completed' && setCurrentTrack(creation)}
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
                          handlePlayPause(creation);
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
        )}
      </div>
    </div>
  );
};

export default MusicZone;
