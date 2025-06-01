
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface DIAIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIAIntroModal = ({ isOpen, onClose }: DIAIntroModalProps) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const { useMarkIntroSeen } = useSupabaseData();
  const markIntroSeenMutation = useMarkIntroSeen();
  const { toast } = useToast();

  const handleClose = async () => {
    try {
      await markIntroSeenMutation.mutateAsync();
      onClose();
    } catch (error) {
      console.error('Error marking intro as seen:', error);
      toast({
        title: "Error",
        description: "There was an issue saving your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId('https://www.youtube.com/watch?v=0obvshAQHVE');

  // Handle YouTube iframe API
  useEffect(() => {
    if (!isOpen || !videoId) return;

    // Load YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Create player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player('dia-intro-player', {
        height: '400',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          cc_load_policy: 1
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setVideoEnded(true);
            }
          }
        }
      });
    };

    return () => {
      // Cleanup
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [isOpen, videoId]);

  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl w-full h-auto p-0 bg-white rounded-2xl border-0 shadow-2xl"
        onPointerDownOutside={handleClose}
      >
        <div className="relative">
          {/* Close button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
            <div className="text-center space-y-2">
              <div className="text-6xl">🤖</div>
              <h2 className="text-3xl font-bold">Meet Your AI Assistant!</h2>
              <p className="text-lg opacity-90">
                Welcome to KaiD! Let's introduce you to D.I.A., your creative companion
              </p>
            </div>
          </div>

          {/* Video container */}
          <div className="p-6">
            <div className="relative bg-black rounded-xl overflow-hidden">
              <div id="dia-intro-player" className="w-full aspect-video"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                {videoEnded 
                  ? "🎉 Welcome aboard! You're ready to start creating amazing things with D.I.A.!" 
                  : "Watch this quick introduction to get started with your AI journey!"
                }
              </p>
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold"
                disabled={markIntroSeenMutation.isPending}
              >
                {videoEnded ? "Let's Start Creating! 🚀" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DIAIntroModal;
