
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizViewProps {
  lessonId: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const QuizView = ({ lessonId, onComplete, onBack }: QuizViewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Mock quiz data (will be fetched from Supabase in Phase 2)
  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What does AI stand for?',
      options: [
        'Amazing Intelligence',
        'Artificial Intelligence', 
        'Animal Intelligence',
        'Awesome Ideas'
      ],
      correctAnswer: 1,
      explanation: 'Great job! AI stands for Artificial Intelligence - it means making computers smart!'
    },
    {
      id: 'q2',
      question: 'Which of these is an example of AI helping us?',
      options: [
        'A regular calculator',
        'A music app that suggests songs you might like',
        'A paper book',
        'A bicycle'
      ],
      correctAnswer: 1,
      explanation: 'Correct! Music apps use AI to learn what you like and suggest new songs!'
    },
    {
      id: 'q3',
      question: 'How should we use AI?',
      options: [
        'To replace all human friends',
        'To help us learn and create cool things',
        'To do all our homework for us',
        'To never ask questions'
      ],
      correctAnswer: 1,
      explanation: 'Perfect! AI is best when it helps us learn, create, and discover new things!'
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    setShowResults(true);
  };

  const getScoreMessage = () => {
    const percentage = (quizScore / quizQuestions.length) * 100;
    if (percentage === 100) {
      return { message: "Perfect! You're an AI superstar! 🌟", emoji: "🏆", color: "from-yellow-400 to-orange-400" };
    } else if (percentage >= 70) {
      return { message: "Great job! You really understand AI! 🎉", emoji: "🥇", color: "from-green-400 to-blue-400" };
    } else {
      return { message: "Good try! Want to review the lesson? 💪", emoji: "🎯", color: "from-purple-400 to-pink-400" };
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizScore(0);
  };

  if (showResults) {
    const scoreInfo = getScoreMessage();
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800">Quiz Complete! 🎉</h1>
          </div>

          {/* Results */}
          <Card className={`p-8 bg-gradient-to-br ${scoreInfo.color} border-0 rounded-2xl shadow-lg text-center text-white`}>
            <div className="space-y-6">
              <div className="text-8xl">{scoreInfo.emoji}</div>
              <h2 className="text-3xl font-bold">{scoreInfo.message}</h2>
              <div className="text-6xl font-bold">
                {quizScore}/{quizQuestions.length}
              </div>
              <p className="text-xl opacity-90">
                You got {Math.round((quizScore / quizQuestions.length) * 100)}% correct!
              </p>
            </div>
          </Card>

          {/* Answer Review */}
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              📝 Review Your Answers 📝
            </h3>
            <div className="space-y-4">
              {quizQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <div key={question.id} className="border rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${isCorrect ? '✅' : '❌'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <p className="text-sm text-gray-600">
                          Your answer: {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mt-2 italic">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={restartQuiz}
              variant="outline"
              className="flex-1 rounded-xl py-3"
            >
              🔄 Try Again
            </Button>
            <Button
              onClick={() => onComplete(quizScore)}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl py-3"
            >
              Continue Learning! 🚀
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-xl"
          >
            ← Back to Lesson
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">🧠 Quiz Time! 🧠</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentQuestion ? 'bg-purple-500 w-6' : 
                    selectedAnswers[index] !== undefined ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {currentQuestion + 1} of {quizQuestions.length}
            </div>
          </div>
        </div>

        {/* Question */}
        <Card className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 border-0 rounded-2xl shadow-lg">
          <div className="text-center space-y-6">
            <div className="text-6xl">🤔</div>
            <h2 className="text-2xl font-bold text-gray-800">
              {question.question}
            </h2>
          </div>
        </Card>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              variant={selectedAnswer === index ? "default" : "outline"}
              className={`w-full p-6 h-auto text-left rounded-xl text-lg transition-all duration-200 transform hover:scale-105 ${
                selectedAnswer === index 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'bg-white hover:bg-purple-50 border-2 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index 
                    ? 'border-white bg-white text-purple-500' 
                    : 'border-purple-300'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="rounded-xl"
          >
            ← Previous
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              {Object.keys(selectedAnswers).length} of {quizQuestions.length} answered
            </div>
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswer === undefined}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl px-6"
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz! 🎯' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
