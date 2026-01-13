import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ChevronRight, XCircle, Clock } from 'lucide-react';
import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData, GameState, Scores } from '../types';
import { rounds } from '../questions';

const TriviaPage: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string | string[]>>({});
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [scores, setScores] = useState<Scores>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
      setCurrentTeam(savedTeam);
    } else {
      navigate('/');
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [navigate]);

  useEffect(() => {
    if (currentTeam) {
      const teamRef = ref(database, `teams/${currentTeam}`);
      onValue(teamRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as TeamData;
          setAnswers(data.answers || {});
        }
      });

      return () => off(teamRef);
    }
  }, [currentTeam]);

  // Listen to scores for real-time feedback
  useEffect(() => {
    const scoresRef = ref(database, 'scores');
    onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        setScores(snapshot.val());
      } else {
        setScores({});
      }
    });

    return () => off(scoresRef);
  }, []);

  // Listen to current round
  useEffect(() => {
    const gameStateRef = ref(database, 'gameState');
    onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val() as GameState;
        const newRound = gameState.currentRound || 1;
        
        // Reset question index when round changes
        if (newRound !== currentRound) {
          setCurrentQuestionIndex(0);
          // Scroll to top when round changes
          window.scrollTo(0, 0);
        }
        
        setCurrentRound(newRound);
        
        // If game hasn't started, redirect to lobby
        if (!gameState.hasStarted) {
          navigate('/lobby');
        }
      } else {
        // No game state, redirect to lobby
        navigate('/lobby');
      }
    });

    return () => off(gameStateRef);
  }, [navigate, currentRound]);

  const saveAnswer = async (questionId: number, answer: string | string[]) => {
    if (!currentTeam) return;
    
    // Validate answer based on whether it's array or string
    if (Array.isArray(answer)) {
      if (answer.every(a => !a.trim())) return;
    } else {
      if (!answer.trim()) return;
    }
    
    setLoading(true);
    try {
      const teamRef = ref(database, `teams/${currentTeam}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        const teamData = snapshot.val() as TeamData;
        const newAnswers = { ...teamData.answers, [questionId]: answer };
        
        await set(teamRef, {
          ...teamData,
          answers: newAnswers,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Error saving answer. Please try again.');
    }
    setLoading(false);
  };

  const leaveTeam = () => {
    sessionStorage.removeItem('currentTeam');
    setCurrentTeam(null);
    setAnswers({});
    setCurrentAnswers({});
    navigate('/');
  };

  if (!currentTeam) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentRoundData = rounds.find(r => r.number === currentRound);
  if (!currentRoundData) {
    return <div className="min-h-screen flex items-center justify-center">Invalid round</div>;
  }

  const currentQuestion = currentRoundData.questions[currentQuestionIndex];
  const totalQuestions = currentRoundData.questions.length;
  const isAnswered = !!answers[currentQuestion.id];
  const parts = currentQuestion.parts || 1;
  const isMultiPart = parts > 1;

  // Get score status for current question
  const getScoreStatus = (questionId: number, partIndex?: number) => {
    if (!currentTeam || !scores[currentTeam]) return null;
    const questionScore = scores[currentTeam][questionId];
    
    if (questionScore === undefined) return null;
    
    if (isMultiPart && Array.isArray(questionScore)) {
      if (partIndex !== undefined) {
        const partScore = questionScore[partIndex];
        if (partScore === 1) return 'correct';
        if (partScore === 0) return 'wrong';
        return null;
      }
      // Overall status for multi-part
      const allCorrect = questionScore.every(s => s === 1);
      const anyWrong = questionScore.some(s => s === 0);
      if (allCorrect) return 'correct';
      if (anyWrong) return 'partial';
      return null;
    }
    
    if (questionScore === 1) return 'correct';
    if (questionScore === 0) return 'wrong';
    return null;
  };

  const scoreStatus = getScoreStatus(currentQuestion.id);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative overflow-hidden">
      {/* Alternating Couch and MAAP Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 100px)',
            gridAutoRows: '100px',
            transform: 'rotate(-5deg) scale(1.2)',
            width: '120%',
            height: '120%',
            marginLeft: '-10%',
            marginTop: '-10%',
          }}
        >
          {[...Array(200)].map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <img 
                src={i % 2 === 0 ? '/couchIcon.png' : '/maap.png'} 
                alt="" 
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tighter">
          COUCH VIEW TRIVIA
        </h1>
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Header - Compact */}
        <div className="bg-white rounded-xl shadow-lg px-4 py-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentTeam}</h2>
              <p className="text-purple-600 font-semibold text-sm">{currentRoundData.name}</p>
            </div>
            <button
              onClick={leaveTeam}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-xs font-semibold"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Progress Indicator - Compact */}
        <div className="bg-white rounded-xl shadow-lg px-4 py-2 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">Progress</span>
            <span className="text-xs font-bold text-purple-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card - 70vh max height */}
        <div style={{ maxHeight: '70vh' }} className="flex flex-col">
          <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col">
            {/* Question Header - Compact */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    Question {currentQuestion.id}
                  </h3>
                  {isMultiPart && (
                    <span className="text-purple-600 font-semibold text-xs">
                      ({parts} parts)
                    </span>
                  )}
                </div>
              </div>
              {isAnswered && (
                <div className="flex items-center gap-1 ml-2">
                  {scoreStatus === 'correct' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-xs font-bold">Correct!</span>
                    </div>
                  )}
                  {scoreStatus === 'wrong' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-6 h-6" />
                      <span className="text-xs font-bold">Wrong</span>
                    </div>
                  )}
                  {scoreStatus === 'partial' && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-xs font-bold">Partial</span>
                    </div>
                  )}
                  {!scoreStatus && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span className="text-xs font-semibold">Grading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Answer Section - Scrollable if needed */}
            <div className="overflow-y-auto flex-1">
              {isAnswered ? (
                <div className={`border-2 rounded-xl p-4 ${
                  scoreStatus === 'correct' ? 'bg-green-50 border-green-300' :
                  scoreStatus === 'wrong' ? 'bg-red-50 border-red-300' :
                  scoreStatus === 'partial' ? 'bg-orange-50 border-orange-300' :
                  'bg-gray-100 border-gray-300'
                }`}>
                  {isMultiPart && Array.isArray(answers[currentQuestion.id]) ? (
                    <div className="space-y-3">
                      {(answers[currentQuestion.id] as string[]).map((ans, idx) => {
                        const label = currentQuestion.partLabels?.[idx] || `Part ${idx + 1}`;
                        const partStatus = getScoreStatus(currentQuestion.id, idx);
                        return (
                          <div key={idx} className={`p-2 rounded ${
                            partStatus === 'correct' ? 'bg-green-100' :
                            partStatus === 'wrong' ? 'bg-red-100' :
                            'bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-600 font-semibold">{label}:</p>
                              {partStatus === 'correct' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {partStatus === 'wrong' && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <p className="text-gray-800 font-medium">{ans}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">
                      {answers[currentQuestion.id] as string}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-semibold">
                      {scoreStatus === 'correct' && <span className="text-green-600">✓ Correct answer!</span>}
                      {scoreStatus === 'wrong' && <span className="text-red-600">✗ Incorrect</span>}
                      {scoreStatus === 'partial' && <span className="text-orange-600">Partially correct</span>}
                      {!scoreStatus && <span className="text-gray-500">⏳ Waiting for score...</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {isMultiPart ? (
                    <div className="space-y-3">
                      {[...Array(parts)].map((_, partIdx) => {
                        const currentPartAnswers = (currentAnswers[currentQuestion.id] as string[]) || [];
                        const label = currentQuestion.partLabels?.[partIdx] || `Part ${partIdx + 1}`;
                        return (
                          <div key={partIdx}>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              {label}:
                            </label>
                            <input
                              type="text"
                              value={currentPartAnswers[partIdx] || ''}
                              onChange={(e) => {
                                const newParts = [...(currentPartAnswers || [])];
                                newParts[partIdx] = e.target.value;
                                setCurrentAnswers({ ...currentAnswers, [currentQuestion.id]: newParts });
                              }}
                              placeholder={`Answer for ${label.toLowerCase()}...`}
                              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={(currentAnswers[currentQuestion.id] as string) || ''}
                      onChange={(e) => setCurrentAnswers({ ...currentAnswers, [currentQuestion.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const answer = currentAnswers[currentQuestion.id];
                          if (answer && (answer as string).trim()) {
                            saveAnswer(currentQuestion.id, answer);
                            setCurrentAnswers({ ...currentAnswers, [currentQuestion.id]: '' });
                          }
                        }
                      }}
                      placeholder="Your answer..."
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  )}
                  
                  <button
                    onClick={() => {
                      const answer = currentAnswers[currentQuestion.id];
                      if (answer) {
                        if (Array.isArray(answer) && answer.some(a => a.trim())) {
                          saveAnswer(currentQuestion.id, answer);
                          setCurrentAnswers({ ...currentAnswers, [currentQuestion.id]: [] });
                        } else if (!Array.isArray(answer) && answer.trim()) {
                          saveAnswer(currentQuestion.id, answer);
                          setCurrentAnswers({ ...currentAnswers, [currentQuestion.id]: '' });
                        }
                      }
                    }}
                    disabled={loading || !currentAnswers[currentQuestion.id] || 
                      (Array.isArray(currentAnswers[currentQuestion.id]) 
                        ? !(currentAnswers[currentQuestion.id] as string[]).some(a => a?.trim())
                        : !(currentAnswers[currentQuestion.id] as string)?.trim())}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? 'Saving...' : 'Submit Answer'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Buttons - Compact */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 bg-white text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* MAAP Logo Branding */}
          <div className="flex justify-center mt-4">
            <img 
              src="/couchIcon.png" 
              alt="MAAP" 
              className="h-12 object-contain opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriviaPage;