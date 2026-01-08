import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData, GameState } from '../types';
import { rounds } from '../questions';

const TriviaPage: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string | string[]>>({});
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
      setCurrentTeam(savedTeam);
    } else {
      navigate('/');
    }
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

  // Listen to current round
  useEffect(() => {
    const gameStateRef = ref(database, 'gameState');
    onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val() as GameState;
        setCurrentRound(gameState.currentRound || 1);
      }
    });

    return () => off(gameStateRef);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{currentTeam}</h2>
              <p className="text-purple-600 font-semibold text-lg mt-1">{currentRoundData.name}</p>
            </div>
            <button
              onClick={leaveTeam}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Leave Team
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {currentRoundData.questions.map((question) => {
            const isAnswered = !!answers[question.id];
            const parts = question.parts || 1;
            const isMultiPart = parts > 1;
            
            return (
              <div key={question.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Question {question.id}
                      {isMultiPart && <span className="text-purple-600 ml-2">({parts} parts)</span>}
                    </h3>
                    <p className="text-gray-700 text-lg">{question.text}</p>
                  </div>
                  {isAnswered && (
                    <div className="flex items-center gap-2 text-green-600 ml-4">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Submitted</span>
                    </div>
                  )}
                </div>

                {isAnswered ? (
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
                    {isMultiPart && Array.isArray(answers[question.id]) ? (
                      <div className="space-y-2">
                        {(answers[question.id] as string[]).map((ans, idx) => {
                          const label = question.partLabels?.[idx] || `Part ${idx + 1}`;
                          return (
                            <div key={idx}>
                              <p className="text-sm text-gray-600 font-semibold">{label}:</p>
                              <p className="text-gray-700 font-medium">{ans}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium">{answers[question.id] as string}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">✓ Answer locked</p>
                  </div>
                ) : (
                  <>
                    {isMultiPart ? (
                      <div className="space-y-3 mb-3">
                        {[...Array(parts)].map((_, partIdx) => {
                          const currentPartAnswers = (currentAnswers[question.id] as string[]) || [];
                          const label = question.partLabels?.[partIdx] || `Part ${partIdx + 1}`;
                          return (
                            <div key={partIdx}>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {label}:
                              </label>
                              <input
                                type="text"
                                value={currentPartAnswers[partIdx] || ''}
                                onChange={(e) => {
                                  const newParts = [...(currentPartAnswers || [])];
                                  newParts[partIdx] = e.target.value;
                                  setCurrentAnswers({ ...currentAnswers, [question.id]: newParts });
                                }}
                                placeholder={`Answer for ${label.toLowerCase()}...`}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={(currentAnswers[question.id] as string) || ''}
                        onChange={(e) => setCurrentAnswers({ ...currentAnswers, [question.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const answer = currentAnswers[question.id];
                            if (answer && (answer as string).trim()) {
                              saveAnswer(question.id, answer);
                              setCurrentAnswers({ ...currentAnswers, [question.id]: '' });
                            }
                          }
                        }}
                        placeholder="Your answer..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all mb-3"
                      />
                    )}
                    
                    <button
                      onClick={() => {
                        const answer = currentAnswers[question.id];
                        if (answer) {
                          if (Array.isArray(answer) && answer.some(a => a.trim())) {
                            saveAnswer(question.id, answer);
                            setCurrentAnswers({ ...currentAnswers, [question.id]: [] });
                          } else if (!Array.isArray(answer) && answer.trim()) {
                            saveAnswer(question.id, answer);
                            setCurrentAnswers({ ...currentAnswers, [question.id]: '' });
                          }
                        }
                      }}
                      disabled={loading || !currentAnswers[question.id] || 
                        (Array.isArray(currentAnswers[question.id]) 
                          ? !(currentAnswers[question.id] as string[]).some(a => a?.trim())
                          : !(currentAnswers[question.id] as string)?.trim())}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Submit Answer'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TriviaPage;