
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MusicZoneProps {
  onBack: () => void;
}

const MusicZone = ({ onBack }: MusicZoneProps) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

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

  const handleGenerateMusic = () => {
    if (!selectedGenre || !selectedMood) return;

    setIsGenerating(true);
    
    // Simulate API call (placeholder for Phase 3 Suno API integration)
    setTimeout(() => {
      const randomTrack = mockTracks[Math.floor(Math.random() * mockTracks.length)];
      setCurrentTrack(randomTrack);
      setIsGenerating(false);
      
      // Mock save to creations
      console.log('Saving music creation:', {
        type: 'music',
        genre: selectedGenre,
        mood: selectedMood,
        track: randomTrack
      });
    }, 3000);
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
            <h1 className="text-3xl font-bold text-gray-800">🎵 Sound Cave 🎵</h1>
            <p className="text-gray-600">Create amazing music with AI!</p>
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
                  What kind of music? 🎭
                </label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-400 bg-white">
                    <SelectValue placeholder="Choose a style..." />
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
                    <SelectValue placeholder="Pick a mood..." />
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

              <Button
                onClick={handleGenerateMusic}
                disabled={!selectedGenre || !selectedMood || isGenerating}
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
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    💾 Save
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl bg-white hover:bg-gray-50"
                  >
                    🔄 Remix
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
              </div>
            )}
          </Card>
        </div>

        {/* Plan B: Simple Soundboard */}
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
                onClick={() => console.log(`Playing ${sound}`)}
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
