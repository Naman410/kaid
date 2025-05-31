
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  hasQuiz: boolean;
  completed: boolean;
}

interface LessonViewProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
}

const LessonView = ({ lesson, onComplete, onBack }: LessonViewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Split content into manageable pages for better UX
  const contentPages = lesson.content.split('\n\n').filter(page => page.trim());
  const totalPages = contentPages.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Mark lesson as complete
      onComplete(lesson.id);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatContent = (content: string) => {
    // Simple formatting for markdown-like content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\*\*(.*?)$/gm, '<h3 class="text-lg font-bold text-gray-800 mb-3">$1</h3>')
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
            ← Back to Tracks
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

        {/* Video (if available) */}
        {lesson.videoUrl && currentPage === 0 && (
          <Card className="p-6 bg-gradient-to-r from-red-100 to-pink-100 border-0 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              📺 Watch and Learn! 📺
            </h2>
            <div className="bg-gray-800 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-white space-y-3">
                <div className="text-6xl">▶️</div>
                <p className="text-lg">Video Player</p>
                <p className="text-sm opacity-75">
                  (Video integration coming in Phase 3)
                </p>
              </div>
            </div>
          </Card>
        )}

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
              {lesson.hasQuiz && currentPage === totalPages - 1 && (
                <div className="flex items-center space-x-2 text-sm text-purple-600">
                  <span>🧠</span>
                  <span>Quiz next!</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
            >
              {currentPage === totalPages - 1 ? (
                lesson.hasQuiz ? 'Take Quiz! 🧠' : 'Complete! ✅'
              ) : (
                'Next →'
              )}
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
