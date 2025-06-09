import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import LessonView from './LessonView';

interface LearningTracksHubProps {
  onBack: () => void;
}

const LearningTracksHub = ({ onBack }: LearningTracksHubProps) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  
  const { useLearningTracks, useLessons, useUserProgress } = useSupabaseData();
  
  const { data: tracks, isLoading: tracksLoading } = useLearningTracks();
  const { data: lessons, isLoading: lessonsLoading } = useLessons(selectedTrack || '');
  const { data: userProgress } = useUserProgress();

  const getTrackProgress = (trackId: string) => {
    if (!lessons || !userProgress) return 0;
    
    const trackLessons = lessons.filter(l => l.track_id === trackId);
    const completedLessons = trackLessons.filter(lesson => 
      userProgress.some(p => p.lesson_id === lesson.id && p.status === 'completed')
    );
    
    return trackLessons.length > 0 ? (completedLessons.length / trackLessons.length) * 100 : 0;
  };

  const handleLessonComplete = (lessonId: string) => {
    // Handle lesson completion
    setSelectedLesson(null);
    setSelectedTrack(null);
  };

  if (selectedLesson) {
    return (
      <LessonView
        lesson={selectedLesson}
        onComplete={handleLessonComplete}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  if (selectedTrack && lessons) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <Button
              onClick={() => setSelectedTrack(null)}
              variant="outline"
              className="rounded-xl"
            >
              ← Back to Tracks
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              {tracks?.find(t => t.id === selectedTrack)?.title}
            </h1>
            <div></div>
          </div>

          {/* Lessons Grid */}
          <div className="grid gap-4">
            {lessonsLoading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-lg text-gray-600">Loading lessons...</div>
              </div>
            ) : (
              lessons.map((lesson, index) => {
                const isCompleted = userProgress?.some(
                  p => p.lesson_id === lesson.id && p.status === 'completed'
                );
                
                return (
                  <Card 
                    key={lesson.id}
                    className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        isCompleted ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {isCompleted ? '✅' : '📖'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {lesson.title}
                        </h3>
                        <div className="text-sm text-gray-600">
                          Lesson {index + 1} • {lesson.content_type}
                        </div>
                      </div>
                      <div className="text-purple-600 font-semibold">
                        {isCompleted ? 'Completed!' : 'Start Learning →'}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800">🎓 Learning Center 🎓</h1>
          <div></div>
        </div>

        {/* Tracks Grid */}
        <div className="grid gap-6">
          {tracksLoading ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <div className="text-xl text-gray-600">Loading learning tracks...</div>
            </div>
          ) : (
            tracks?.map((track) => {
              const progress = getTrackProgress(track.id);
              
              return (
                <Card 
                  key={track.id}
                  className="p-8 bg-gradient-to-r from-blue-100 to-purple-100 border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {track.title}
                      </h2>
                      <div className="text-4xl">🎯</div>
                    </div>
                    
                    <p className="text-lg text-gray-700">
                      {track.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Progress</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="text-purple-600 font-semibold">
                        {progress === 100 ? 'Review Lessons' : 'Continue Learning'} →
                      </div>
                      {progress === 100 && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <span>🏆</span>
                          <span className="font-semibold">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningTracksHub;
