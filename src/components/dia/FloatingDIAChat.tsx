
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'dia';
  content: string;
  timestamp: Date;
}

const FloatingDIAChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'dia',
      content: "Hi there! I'm D.I.A., your AI friend! 🤖 I'm here to help you learn about AI and answer any questions you have. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const conversationStarters = [
    "What is AI? 🤔",
    "How do computers learn? 💻", 
    "Can you help me create something? 🎨",
    "Tell me a fun fact about robots! 🤖",
    "What can AI do? ✨"
  ];

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate D.I.A. response (placeholder for Phase 3 GPT integration)
    setTimeout(() => {
      const diaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'dia',
        content: getDIAResponse(messageToSend),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, diaResponse]);
    }, 1000);
  };

  const getDIAResponse = (userMessage: string): string => {
    // Placeholder responses for MVP (will be replaced with GPT in Phase 3)
    const responses = {
      "what is ai": "AI stands for Artificial Intelligence! It's like teaching computers to think and learn, just like how you learn new things every day! 🧠✨",
      "how do computers learn": "Computers learn by looking at lots of examples, just like how you learn to recognize animals by seeing many different cats and dogs! 🐱🐶",
      "can you help me create": "Absolutely! I love helping create amazing things! You can make music in the Sound Cave, draw pictures in the Art Studio, or write stories in the Story Treehouse! 🎨🎵📚",
      "tell me a fun fact": "Here's a cool fact: Some AI can recognize your voice just like how you recognize your friend's voice on the phone! Isn't that amazing? 🎤🤖",
      "what can ai do": "AI can do so many wonderful things! It can help doctors, create art, play games, translate languages, and even help you learn new things! The possibilities are endless! 🌟"
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key.replace(/ /g, '')) || lowerMessage.includes(key)) {
        return response;
      }
    }

    return "That's a great question! 🤔 I'm still learning too. Why don't we explore the Creative Zones together to discover more about AI? You might find the answer while creating something amazing! ✨";
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
          size="icon"
        >
          <div className="text-2xl">🤖</div>
        </Button>
      </div>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">🤖</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Chat with D.I.A.</h2>
                  <p className="text-gray-600">Your friendly AI companion</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
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
              </div>
            </ScrollArea>

            {/* Conversation Starters */}
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-3">Quick Questions:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {conversationStarters.map((starter, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSendMessage(starter)}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs hover:bg-purple-100"
                  >
                    {starter}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your question here..."
                  className="rounded-xl border-purple-200 focus:border-purple-400"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6"
                >
                  Send! 📤
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingDIAChat;
