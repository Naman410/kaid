
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import VideoLessonView from './VideoLessonView';

interface LessonViewProps {
  lesson: any;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
}

const LessonView = ({ lesson, onComplete, onBack }: LessonViewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { useUpdateProgress } = useSupabaseData();
  const updateProgressMutation = useUpdateProgress();
  const { toast } = useToast();
  
  // If lesson has a video URL and content type is video, use VideoLessonView
  if (lesson.content_type === 'video' && lesson.video_url) {
    return (
      <VideoLessonView 
        lesson={lesson} 
        onComplete={onComplete} 
        onBack={onBack} 
      />
    );
  }
  
  // Fallback to text-based lesson for backward compatibility
  const contentPages = lesson.content_text?.split('\n\n').filter((page: string) => page.trim()) || [''];
  const totalPages = contentPages.length;

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Mark lesson as complete
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
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatContent = (content: string) => {
    // Simple formatting for content
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('❤️') || line.startsWith('🤖') || line.startsWith('⚡') || line.startsWith('👨‍👩‍👧‍👦')) {
          return `<div key="${index}" class="flex items-start space-x-2 mb-2"><span class="text-xl">${line.charAt(0)}</span><span class="text-gray-700">${line.slice(2)}</span></div>`;
        }
        return `<p key="${index}" class="mb-2 text-gray-700 leading-relaxed">${line}</p>`;
      })
      .join('');
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
            ← Back to Lessons
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentPage ? 'bg-purple-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="min-h-96 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <ScrollArea className="h-96 p-6">
            <div className="space-y-4">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(contentPages[currentPage] || '') 
                }}
              />
            </div>
          </ScrollArea>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <Button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              variant="outline"
              className="rounded-xl"
            >
              ← Previous
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentPage + 1} / {totalPages}
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={updateProgressMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
            >
              {currentPage === totalPages - 1 ? 'Complete! ✅' : 'Next →'}
            </Button>
          </div>
        </Card>

        {/* Fun Facts Sidebar */}
        <Card className="p-6 bg-gradient-to-r from-cyan-100 to-blue-100 border-0 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            💡 Did You Know? 💡
          </h3>
          <div className="text-center space-y-2">
            <p className="text-gray-700">
              The word "robot" comes from a Czech word meaning "forced work"!
            </p>
            <div className="text-4xl">🤖</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LessonView;
