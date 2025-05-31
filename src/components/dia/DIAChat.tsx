
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DIAChatProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'dia';
  content: string;
  timestamp: Date;
}

const DIAChat = ({ onBack }: DIAChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'dia',
      content: "Hi there! I'm D.I.A., your AI friend! 🤖 I'm here to help you learn about AI and answer any questions you have. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conversationStarters = [
    "What is AI? 🤔",
    "How do computers learn? 💻", 
    "Can you help me create something? 🎨",
    "Tell me a fun fact about robots! 🤖",
    "What can AI do? ✨"
  ];

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call D.I.A. AI function
      const { data: diaData, error: diaError } = await supabase.functions.invoke('dia-chat', {
        body: {
          message: messageToSend,
          conversationHistory
        }
      });

      if (diaError || !diaData.success) {
        throw new Error(diaData?.error || 'Failed to get D.I.A. response');
      }

      // Add D.I.A. response
      const diaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'dia',
        content: diaData.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, diaResponse]);

    } catch (error) {
      console.error('D.I.A. chat error:', error);
      
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'dia',
        content: "Oops! I'm having trouble connecting right now. But I'm still here to help! Try asking me something about AI and creativity! 🤖✨",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackResponse]);
      
      if (user) {
        toast({
          title: "Connection issue",
          description: "D.I.A. is having trouble connecting, but you can still chat!",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-xl"
          >
            ← Back to Hub
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🤖</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Chat with D.I.A.</h1>
              <p className="text-gray-600">Your AI-powered companion</p>
            </div>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Chat Interface */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          {/* Messages */}
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-800'
                    }`}
                  >
                    {message.type === 'dia' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🤖</span>
                        <span className="font-bold text-sm">D.I.A.</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-800 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🤖</span>
                      <span className="font-bold text-sm">D.I.A.</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"></div>
                      <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                      <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Conversation Starters */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-3">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {conversationStarters.map((starter, index) => (
                <Button
                  key={index}
                  onClick={() => handleSendMessage(starter)}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs hover:bg-purple-100"
                  disabled={isLoading}
                >
                  {starter}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question here..."
                className="rounded-xl border-purple-200 focus:border-purple-400"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
              >
                Send! 📤
              </Button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              ✨ Powered by real AI - D.I.A. learns and grows with every chat!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DIAChat;
