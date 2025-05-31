
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProfileSetupProps {
  onComplete: (profile: { name: string; avatar: string }) => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const avatars = [
    { id: 'space', emoji: '🚀', name: 'Space Explorer' },
    { id: 'artist', emoji: '🎨', name: 'Creative Artist' },
    { id: 'scientist', emoji: '🔬', name: 'Mad Scientist' },
    { id: 'musician', emoji: '🎵', name: 'Music Maker' },
    { id: 'wizard', emoji: '🧙‍♀️', name: 'AI Wizard' },
    { id: 'robot', emoji: '🤖', name: 'Robot Friend' },
  ];

  const handleSubmit = () => {
    if (name.trim() && selectedAvatar) {
      onComplete({ name: name.trim(), avatar: selectedAvatar });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Let's Create Your Profile! 🌟
          </h1>
          <p className="text-lg text-gray-600">
            Tell us your name and pick your favorite avatar!
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xl font-bold text-gray-700">
                What's your name?
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your awesome name!"
                className="text-lg p-4 rounded-xl border-2 border-purple-200 focus:border-purple-400 text-center"
                maxLength={20}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xl font-bold text-gray-700">
                Choose Your Avatar!
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-4 rounded-2xl border-3 transition-all duration-200 transform hover:scale-105 ${
                      selectedAvatar === avatar.id
                        ? 'border-purple-500 bg-purple-100 scale-105'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{avatar.emoji}</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {avatar.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !selectedAvatar}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Create My Profile! 🎉
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetup;
