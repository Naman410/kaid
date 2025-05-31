
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LessonView from './LessonView';
import QuizView from './QuizView';

interface LearningTracksHubProps {
  onBack: () => void;
}

interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  completed: number;
  difficulty: 'Easy' | 'Medium';
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  hasQuiz: boolean;
  completed: boolean;
}

const LearningTracksHub = ({ onBack }: LearningTracksHubProps) => {
  const [currentView, setCurrentView] = useState<'hub' | 'lesson' | 'quiz'>('hub');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Mock data (will be fetched from Supabase in Phase 2)
  const tracks: Track[] = [
    {
      id: 'what-is-ai',
      title: 'What is AI?',
      description: 'Learn the basics of Artificial Intelligence in a fun way!',
      icon: '🤖',
      lessons: 3,
      completed: 1,
      difficulty: 'Easy'
    },
    {
      id: 'how-ai-learns',
      title: 'How AI Learns',
      description: 'Discover how computers can learn just like you!',
      icon: '🧠',
      lessons: 4,
      completed: 0,
      difficulty: 'Easy'
    },
    {
      id: 'ai-helpers',
      title: 'AI in Everyday Life',
      description: 'Find AI helpers all around us!',
      icon: '🏠',
      lessons: 3,
      completed: 0,
      difficulty: 'Medium'
    }
  ];

  const mockLessons: { [key: string]: Lesson[] } = {
    'what-is-ai': [
      {
        id: 'lesson-1',
        title: 'Meet AI!',
        content: `Hi there! 👋 Let's learn about AI together!

**What is AI?**
AI stands for "Artificial Intelligence." That's a big word, but it's actually pretty simple!

Think of AI like teaching a computer to be really smart. Just like how you learn to ride a bike or recognize different animals, we can teach computers to learn things too!

**Examples of AI:**
🤖 Robots that can talk and help people
🎵 Apps that recommend music you might like  
🎮 Video games with smart characters
📱 Phone assistants that answer questions

AI is everywhere, and it's here to help make life more fun and easier!`,
        hasQuiz: true,
        completed: true
      },
      {
        id: 'lesson-2', 
        title: 'AI vs Humans',
        content: `Let's see how AI and humans are different! 🤔

**What Humans Are Great At:**
❤️ Feeling emotions and caring for others
🎨 Being creative in unique ways
🤗 Understanding feelings and giving hugs
🎭 Telling jokes and being silly
🌈 Imagining new things

**What AI Is Great At:**
⚡ Doing math really, really fast
📚 Remembering lots of information
🔍 Finding patterns in data
⏰ Working without getting tired
🎯 Being very precise

**The Cool Part:**
Humans and AI work best as a team! We can use our creativity and kindness while AI helps with the heavy lifting. It's like having a super-smart study buddy!`,
        hasQuiz: true,
        completed: false
      },
      {
        id: 'lesson-3',
        title: 'AI Safety',
        content: `It's important to use AI safely and responsibly! 🛡️

**How to Be Safe with AI:**
👨‍👩‍👧‍👦 Always ask a grown-up before using new AI tools
🤝 Remember that AI is here to help, not replace human friends
🎯 Use AI for good things like learning and creating
💭 Think for yourself - don't believe everything AI says
🔒 Keep your personal information private

**Being Kind:**
Just like with people, we should be polite and kind when talking to AI. It's good practice for being nice to everyone!

**The Golden Rule:**
Use AI to help others and make the world a better place! 🌟`,
        hasQuiz: true,
        completed: false
      }
    ]
  };

  const handleLessonComplete = (lessonId: string) => {
    console.log('Lesson completed:', lessonId);
    // Mock progress update (will update Supabase in Phase 2)
    if (selectedLesson?.hasQuiz) {
      setCurrentView('quiz');
    } else {
      setCurrentView('hub');
      setSelectedTrack(null);
      setSelectedLesson(null);
    }
  };

  const handleQuizComplete = (score: number) => {
    console.log('Quiz completed with score:', score);
    // Mock progress update and milestone check
    setCurrentView('hub');
    setSelectedTrack(null);
    setSelectedLesson(null);
  };

  const renderTrackHub = () => (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold text-gray-800">🎓 Learning Adventures 🎓</h1>
          <p className="text-gray-600">Discover how AI works!</p>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-0 rounded-2xl shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-6xl">⭐</div>
          <h2 className="text-2xl font-bold text-gray-800">Your Learning Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold text-gray-800">2</div>
              <div className="text-sm text-gray-600">Lessons Complete</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-gray-800">150</div>
              <div className="text-sm text-gray-600">Learning Points</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-bold text-gray-800">1</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Tracks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Choose Your Adventure! 🚀
        </h2>
        
        {tracks.map((track) => (
          <Card key={track.id} className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{track.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{track.title}</h3>
                    <Badge variant={track.difficulty === 'Easy' ? 'secondary' : 'outline'}>
                      {track.difficulty}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{track.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📚 {track.lessons} lessons</span>
                    <span>✅ {track.completed} completed</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(track.completed / track.lessons) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setSelectedTrack(track.id);
                  const lessons = mockLessons[track.id];
                  if (lessons && lessons.length > 0) {
                    setSelectedLesson(lessons[0]);
                    setCurrentView('lesson');
                  }
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold transform hover:scale-105 transition-all duration-200"
              >
                {track.completed > 0 ? 'Continue!' : 'Start!'} 🚀
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Achievement Showcase */}
      <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🏆 Your Achievements 🏆
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🥇</div>
            <div className="text-sm font-semibold text-gray-700">First Lesson!</div>
            <div className="text-xs text-gray-500">Earned</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center opacity-50">
            <div className="text-4xl mb-2">🧠</div>
            <div className="text-sm font-semibold text-gray-700">AI Expert</div>
            <div className="text-xs text-gray-500">Locked</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center opacity-50">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-sm font-semibold text-gray-700">Speed Learner</div>
            <div className="text-xs text-gray-500">Locked</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center opacity-50">
            <div className="text-4xl mb-2">🌟</div>
            <div className="text-sm font-semibold text-gray-700">Master Creator</div>
            <div className="text-xs text-gray-500">Locked</div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (currentView === 'lesson' && selectedLesson) {
    return (
      <LessonView
        lesson={selectedLesson}
        onComplete={handleLessonComplete}
        onBack={() => setCurrentView('hub')}
      />
    );
  }

  if (currentView === 'quiz' && selectedLesson) {
    return (
      <QuizView
        lessonId={selectedLesson.id}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentView('lesson')}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {renderTrackHub()}
      </div>
    </div>
  );
};

export default LearningTracksHub;
