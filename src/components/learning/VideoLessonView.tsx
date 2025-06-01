
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface VideoLessonViewProps {
  lesson: any;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
}

const VideoLessonView = ({ lesson, onComplete, onBack }: VideoLessonViewProps) => {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const { useUpdateProgress } = useSupabaseData();
  const updateProgressMutation = useUpdateProgress();
  const { toast } = useToast();

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = lesson.video_url ? getYouTubeId(lesson.video_url) : null;

  const handleCompleteLesson = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        lessonId: lesson.id,
        status: 'completed'
      });
      
      toast({
        title: "Lesson Complete! 🎉",
        description: "Great job! You've completed this lesson.",
      });
      
      onComplete(lesson.id);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "There was an issue saving your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle YouTube iframe API
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag?.parentNode && !window.YT) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Create player when API is ready
    const createPlayer = () => {
      if (window.YT && window.YT.Player) {
        new window.YT.Player('lesson-video-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            cc_load_policy: 1,
            disablekb: 1,
            playsinline: 1
          },
          events: {
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setVideoCompleted(true);
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      // Cleanup is handled by YouTube API
    };
  }, [videoId]);

  if (!videoId) {
    // Fallback for lessons without video URLs
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <Button
              onClick={onBack}
              variant="outline"
              className="rounded-xl"
            >
              ← Back to Lessons
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            <div></div>
          </div>
          
          <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg text-center">
            <div className="space-y-4">
              <div className="text-6xl">📹</div>
              <h2 className="text-2xl font-bold text-gray-800">Video Coming Soon</h2>
              <p className="text-gray-600">This lesson will be available as a video soon!</p>
              <Button onClick={onBack} className="mt-4">
                Back to Lessons
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
            ← Back to Lessons
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            {videoCompleted && (
              <div className="text-sm text-green-600 font-semibold mt-1">
                ✅ Video Completed!
              </div>
            )}
          </div>
          <div></div>
        </div>

        {/* Video Container */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-black relative">
            <div id="lesson-video-player" className="w-full h-full"></div>
          </div>
          
          {/* Video Info */}
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h2>
                <p className="text-gray-600">
                  Watch this video to learn about AI and complete the lesson!
                </p>
              </div>
              
              <Button
                onClick={handleCompleteLesson}
                disabled={!videoCompleted || updateProgressMutation.isPending}
                className={`px-8 py-3 rounded-xl font-semibold ${
                  videoCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {videoCompleted ? 'Complete Lesson! ✅' : 'Watch Video to Continue'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Fun Facts */}
        <Card className="p-6 bg-gradient-to-r from-cyan-100 to-blue-100 border-0 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            💡 Learning Tip! 💡
          </h3>
          <div className="text-center space-y-2">
            <p className="text-gray-700">
              {videoCompleted 
                ? "Great job watching the video! You're one step closer to becoming an AI expert!" 
                : "Take your time watching the video. You can pause, rewind, and adjust the speed as needed!"
              }
            </p>
            <div className="text-4xl">{videoCompleted ? '🎉' : '📚'}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VideoLessonView;
