
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

interface MusicGeneratorProps {
  onGenerateMusic: (params: {
    prompt: string;
    style: string;
    title: string;
    instrumental: boolean;
  }) => Promise<void>;
  isGenerating: boolean;
  isBlocked?: boolean;
}

const MusicGenerator = ({ onGenerateMusic, isGenerating, isBlocked = false }: MusicGeneratorProps) => {
  const { toast } = useToast();
  const [selectedGenre, setSelectedGenre] = useState('happy');
  const [selectedMood, setSelectedMood] = useState('play');
  const [userPrompt, setUserPrompt] = useState('');
  const [musicName, setMusicName] = useState('');
  const [instrumental, setInstrumental] = useState(false);

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
    if (isBlocked) {
      toast({
        title: "Get Pro Plan! 🔒",
        description: "Upgrade to unlock unlimited music creation!",
        variant: "destructive"
      });
      return;
    }

    const finalPrompt = userPrompt.trim() || "Create a fun and happy tune";
    const finalName = musicName.trim() || generateRandomName();

    try {
      await onGenerateMusic({
        prompt: `${finalPrompt} with ${selectedGenre} style and ${selectedMood} mood`,
        style: selectedGenre,
        title: finalName,
        instrumental: instrumental
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

  return (
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
            disabled={isBlocked}
          />
          <div className="text-xs text-gray-500 mt-1">
            {userPrompt.length}/500 characters
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            What kind of music? 🎭
          </label>
          <Select value={selectedGenre} onValueChange={setSelectedGenre} disabled={isBlocked}>
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
          <Select value={selectedMood} onValueChange={setSelectedMood} disabled={isBlocked}>
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
              disabled={isBlocked}
            />
            <Button
              onClick={() => setMusicName(generateRandomName())}
              variant="outline"
              className="rounded-xl"
              disabled={isBlocked}
            >
              🎲 Random
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Switch
            checked={instrumental}
            onCheckedChange={setInstrumental}
            disabled={isBlocked}
          />
          <label className="text-lg font-semibold text-gray-700">
            Instrumental only (no lyrics)
          </label>
        </div>

        <Button
          onClick={handleGenerateMusic}
          disabled={isGenerating || isBlocked}
          className={`w-full py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200 ${
            isBlocked 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
          }`}
        >
          {isBlocked ? (
            <div className="flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>🔒 Get Pro Plan!</span>
            </div>
          ) : isGenerating ? (
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
  );
};

export default MusicGenerator;
