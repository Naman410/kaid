
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface MusicZoneProps {
  onBack: () => void;
}

const MusicZone = ({ onBack }: MusicZoneProps) => {
  const [selectedGenre, setSelectedGenre] = useState('happy');
  const [selectedMood, setSelectedMood] = useState('play');
  const [userPrompt, setUserPrompt] = useState('');
  const [musicName, setMusicName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  // Default values pre-selected
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

  const mockTracks = [
    "🎵 Sunny Day Adventure",
    "🎶 Magical Forest Dance", 
    "🎼 Robot's Lullaby",
    "🎹 Space Explorer Theme",
    "🥁 Happy Playground Beat"
  ];

  const generateRandomName = () => {
    const adjectives = ['Happy', 'Magical', 'Sunny', 'Dancing', 'Dreamy', 'Bouncy', 'Sparkly'];
    const nouns = ['Adventure', 'Song', 'Melody', 'Beat', 'Tune', 'Rhythm', 'Music'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj} ${randomNoun}`;
  };

  const handleGenerateMusic = () => {
    const finalPrompt = userPrompt.trim() || "Create a fun and happy tune";
    const finalName = musicName.trim() || generateRandomName();

    setIsGenerating(true);
    
    // Phase 3: SUNO AI integration with concatenated system prompt
    // System prompt will include: selectedGenre + selectedMood + userPrompt + child safety guidelines
    setTimeout(() => {
      const randomTrack = mockTracks[Math.floor(Math.random() * mockTracks.length)];
      setCurrentTrack(finalName);
      setIsGenerating(false);
      
      // Mock save to creations (Phase 2 Supabase integration)
      console.log('Saving music creation:', {
        type: 'music',
        genre: selectedGenre,
        mood: selectedMood,
        user_prompt: finalPrompt,
        track_name: finalName,
        // Phase 3: Complete system prompt for SUNO AI
        system_prompt: `Create a ${selectedGenre} style music with ${selectedMood} mood. ${finalPrompt}. Ensure content is appropriate for children aged 5-10.`
      });
    }, 3000);
  };

  const handleDownload = () => {
    // Phase 3: Implement actual download functionality
    console.log('Download music feature - coming in Phase 3');
  };

  const handleQuickSound = (soundType: string) => {
    // Phase 3: Fetch pre-fed sounds from database
    console.log(`Playing quick sound: ${soundType}`);
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

              <Button
                onClick={handleGenerateMusic}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Magic... 🎵</span>
                  </div>
                ) : (
                  'Create My Music! 🎶'
                )}
              </Button>
              
              <p className="text-xs text-gray-400 text-center">
                Tip: You can use default settings and click create right away!
              </p>
            </div>
          </Card>

          {/* Player */}
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎧 Music Player 🎧
            </h2>

            {currentTrack ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Now Playing:
                  </h3>
                  <p className="text-lg text-gray-600">{currentTrack}</p>
                </div>

                {/* Mock Player Controls */}
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <Button variant="outline" size="lg" className="rounded-full">
                      ⏮️
                    </Button>
                    <Button size="lg" className="rounded-full bg-purple-500 hover:bg-purple-600">
                      ▶️
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full">
                      ⏭️
                    </Button>
                  </div>
                  
                  {/* Mock Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-1/3"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0:45</span>
                    <span>2:30</span>
                  </div>
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
                    onClick={() => setCurrentTrack(null)}
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    🔄 Create New
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-12">
                <div className="text-6xl">🎼</div>
                <p className="text-lg text-gray-600">
                  Choose your style and mood, then hit create!
                </p>
                <p className="text-sm text-gray-500">
                  Your amazing music will appear here! 🎶
                </p>
                <p className="text-xs text-gray-400">
                  Tip: You can use the default settings and create right away!
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Sounds */}
        <Card className="p-6 bg-gradient-to-r from-cyan-100 to-blue-100 border-0 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎹 Quick Sounds 🎹
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Tap these buttons to play fun sounds!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🥁 Drum', '🎺 Trumpet', '🎸 Guitar', '🎹 Piano', '🎷 Sax', '🎻 Violin', '🔔 Bell', '🎵 Melody'].map((sound) => (
              <Button
                key={sound}
                variant="outline"
                className="p-4 h-auto flex flex-col space-y-2 rounded-xl bg-white hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
                onClick={() => handleQuickSound(sound)}
              >
                <span className="text-2xl">{sound.split(' ')[0]}</span>
                <span className="text-sm font-medium">{sound.split(' ')[1]}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MusicZone;
