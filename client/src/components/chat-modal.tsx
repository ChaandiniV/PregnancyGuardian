import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AssessmentFormData, AssessmentResponse } from "@/lib/types";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUESTIONS = [
  "Are you currently experiencing any unusual bleeding or discharge?",
  "Do you have any persistent headaches, blurry vision, or swelling?",
  "How has your baby's movement been today compared to yesterday?",
  "Have you had a fever or noticed any foul-smelling discharge?",
  "Are you feeling any pressure or pain in your pelvis or lower back?"
];

export default function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const assessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json() as Promise<AssessmentResponse>;
    },
  });

  const addMessage = (type: "ai" | "user", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const initializeChat = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResult(null);
    setCurrentInput("");
    
    // Start with proactive questioning
    simulateTyping(() => {
      addMessage("ai", "Hello! I'm Dr. AI, your pregnancy health assistant. I'll ask you 5 important questions about your current symptoms to provide a personalized risk assessment. Let's begin:");
      
      setTimeout(() => {
        simulateTyping(() => {
          addMessage("ai", QUESTIONS[0]);
        }, 800);
      }, 500);
    });
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      initializeChat();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    // Add user's answer
    addMessage("user", currentInput);
    const newAnswers = [...userAnswers, currentInput];
    setUserAnswers(newAnswers);
    setCurrentInput("");

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < QUESTIONS.length) {
      // Ask next question
      setCurrentQuestionIndex(nextQuestionIndex);
      simulateTyping(() => {
        addMessage("ai", QUESTIONS[nextQuestionIndex]);
      });
    } else {
      // All questions answered, process assessment
      simulateTyping(() => {
        addMessage("ai", "Thank you for your answers. Let me analyze your responses and provide a health assessment...");
        processAssessment(newAnswers);
      });
    }
  };

  const processAssessment = (answers: string[]) => {
    // Convert answers to symptoms list with severity assessment
    const symptoms: string[] = [];
    
    answers.forEach((answer, index) => {
      const lowerAnswer = answer.toLowerCase();
      
      switch (index) {
        case 0: // Bleeding or discharge
          if (lowerAnswer.includes('yes') || lowerAnswer.includes('bleeding') || lowerAnswer.includes('discharge')) {
            if (lowerAnswer.includes('heavy') || lowerAnswer.includes('severe') || lowerAnswer.includes('lot')) {
              symptoms.push('Heavy bleeding');
            } else {
              symptoms.push('Light bleeding or spotting');
            }
          }
          break;
        case 1: // Headaches, vision, swelling
          if (lowerAnswer.includes('headache')) {
            if (lowerAnswer.includes('mild') || lowerAnswer.includes('slight') || lowerAnswer.includes('little')) {
              symptoms.push('Mild headaches');
            } else if (lowerAnswer.includes('severe') || lowerAnswer.includes('intense') || lowerAnswer.includes('bad')) {
              symptoms.push('Severe headaches');
            } else {
              symptoms.push('Headaches');
            }
          }
          if (lowerAnswer.includes('blurry') || lowerAnswer.includes('vision') || lowerAnswer.includes('see')) {
            symptoms.push('Vision changes');
          }
          if (lowerAnswer.includes('swelling') || lowerAnswer.includes('swollen')) {
            if (lowerAnswer.includes('severe') || lowerAnswer.includes('sudden') || lowerAnswer.includes('extreme')) {
              symptoms.push('Severe swelling');
            } else {
              symptoms.push('Mild swelling');
            }
          }
          break;
        case 2: // Baby movement
          if (lowerAnswer.includes('less') || lowerAnswer.includes('decreased') || lowerAnswer.includes('not') || lowerAnswer.includes('reduced') || lowerAnswer.includes('stopped')) {
            symptoms.push('Decreased fetal movement');
          } else if (lowerAnswer.includes('same') || lowerAnswer.includes('normal') || lowerAnswer.includes('fine')) {
            // Normal movement - no symptom added
          }
          break;
        case 3: // Fever or discharge
          if (lowerAnswer.includes('yes') || lowerAnswer.includes('fever') || lowerAnswer.includes('hot') || lowerAnswer.includes('temperature')) {
            symptoms.push('Fever');
          }
          if (lowerAnswer.includes('foul') || lowerAnswer.includes('smell') || lowerAnswer.includes('odor')) {
            symptoms.push('Foul-smelling discharge');
          }
          break;
        case 4: // Pelvic pain
          if (lowerAnswer.includes('pain') || lowerAnswer.includes('pressure')) {
            if (lowerAnswer.includes('mild') || lowerAnswer.includes('slight') || lowerAnswer.includes('little')) {
              symptoms.push('Mild back pain');
            } else if (lowerAnswer.includes('severe') || lowerAnswer.includes('intense') || lowerAnswer.includes('sharp')) {
              symptoms.push('Severe pelvic pain');
            } else {
              symptoms.push('Back pain');
            }
          }
          break;
      }
    });

    // If no specific symptoms detected, add general assessment
    if (symptoms.length === 0) {
      symptoms.push('General wellness check');
    }

    const assessmentData: AssessmentFormData = {
      symptoms,
      gestationalWeek: undefined,
      previousComplications: undefined,
      additionalSymptoms: answers.join('; ')
    };

    assessmentMutation.mutate(assessmentData, {
      onSuccess: (result: AssessmentResponse) => {
        setAssessmentResult(result);
        simulateTyping(() => {
          addMessage("ai", "Based on your responses, here's your health assessment:");
        }, 1000);
      },
      onError: () => {
        simulateTyping(() => {
          addMessage("ai", "I'm sorry, there was an error processing your assessment. Please try again or contact your healthcare provider.");
        });
      }
    });
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskEmoji = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return '🔴';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'immediate': return 'text-red-600 bg-red-50 border-red-200';
      case 'within_24_hours': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'within_week': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'routine': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-medical-blue" />
            Chat with Dr. AI
          </DialogTitle>
          <DialogDescription>
            Interactive health assessment through conversation with your virtual healthcare assistant.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-medical-blue text-white ml-2'
                        : 'bg-gray-100 text-gray-800 mr-2'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && (
                        <Bot className="h-4 w-4 mt-0.5 text-medical-blue" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-white" />
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Assessment Result */}
            {assessmentResult && (
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRiskColor(assessmentResult.riskLevel)} border`}>
                      {getRiskEmoji(assessmentResult.riskLevel)} {assessmentResult.riskLevel?.toUpperCase() || 'UNKNOWN'} RISK
                    </Badge>
                    <Badge className={`${getUrgencyColor(assessmentResult.urgency)} border`}>
                      {assessmentResult.urgency?.replace(/_/g, ' ').toUpperCase() || 'ROUTINE'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {assessmentResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-medical-blue mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">AI Analysis:</h4>
                    <p className="text-sm text-gray-600">{assessmentResult.aiAnalysis}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3 mr-2 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-medical-blue" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          {!assessmentResult && currentQuestionIndex < QUESTIONS.length && (
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!currentInput.trim() || isTyping}
                  className="bg-medical-blue hover:bg-blue-700"
                >
                  {assessmentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}