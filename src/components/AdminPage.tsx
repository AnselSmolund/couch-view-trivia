import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, RefreshCw, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react';
import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData, Scores, GameState } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import { rounds } from '../questions';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [lockedQuestions, setLockedQuestions] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    setIsAuthenticated(adminAuth === 'true');
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      const teamsRef = ref(database, 'teams');
      onValue(teamsRef, (snapshot) => {
        if (snapshot.exists()) {
          const teamsData = snapshot.val();
          const teamsArray = Object.values(teamsData) as TeamData[];
          setTeams(teamsArray);
        } else {
          setTeams([]);
        }
      });

      const scoresRef = ref(database, 'scores');
      onValue(scoresRef, (snapshot) => {
        if (snapshot.exists()) {
          setScores(snapshot.val());
        } else {
          setScores({});
        }
      });

      const lockedRef = ref(database, 'locked');
      onValue(lockedRef, (snapshot) => {
        if (snapshot.exists()) {
          setLockedQuestions(snapshot.val());
        } else {
          setLockedQuestions([]);
        }
      });

      // Listen to game state
      const gameStateRef = ref(database, 'gameState');
      onValue(gameStateRef, (snapshot) => {
        if (snapshot.exists()) {
          const gameState = snapshot.val() as GameState;
          setCurrentRound(gameState.currentRound || 1);
          setGameStarted(gameState.hasStarted || false);
        } else {
          setCurrentRound(1);
          setGameStarted(false);
        }
      });

      return () => {
        off(teamsRef);
        off(scoresRef);
        off(lockedRef);
        off(gameStateRef);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  const toggleLockQuestion = async (questionNum: number) => {
    const newLocked = lockedQuestions.includes(questionNum)
      ? lockedQuestions.filter(q => q !== questionNum)
      : [...lockedQuestions, questionNum];
    
    try {
      await set(ref(database, 'locked'), newLocked);
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const updateScore = async (teamName: string, questionId: number, partIndex: number | null, points: number) => {
    const newScores = { ...scores };
    if (!newScores[teamName]) newScores[teamName] = {};
    
    // Find the question to check if it's multi-part
    const question = rounds.flatMap(r => r.questions).find(q => q.id === questionId);
    const isMultiPart = question && (question.parts || 1) > 1;
    
    if (isMultiPart && partIndex !== null) {
      // Multi-part question - store as array
      const currentScores = newScores[teamName][questionId] as number[] || [];
      const newPartScores = [...currentScores];
      newPartScores[partIndex] = points;
      newScores[teamName][questionId] = newPartScores;
    } else {
      // Single answer question
      newScores[teamName][questionId] = points;
    }
    
    try {
      await set(ref(database, 'scores'), newScores);
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const unlockAnswer = async (teamName: string, questionId: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to unlock ${teamName}'s answer for Question ${questionId}?\n\nThis will allow them to edit and resubmit their answer.`
    );

    if (!confirmed) return;

    try {
      // Find the team and remove their answer for this question
      const teamRef = ref(database, `teams/${teamName}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        const teamData = snapshot.val() as TeamData;
        const newAnswers = { ...teamData.answers };
        delete newAnswers[questionId];
        
        await set(teamRef, {
          ...teamData,
          answers: newAnswers,
          timestamp: Date.now()
        });

        // Also clear the score for this question
        const newScores = { ...scores };
        if (newScores[teamName] && newScores[teamName][questionId] !== undefined) {
          delete newScores[teamName][questionId];
          await set(ref(database, 'scores'), newScores);
        }

        alert(`Answer unlocked for ${teamName}!`);
      }
    } catch (error) {
      console.error('Error unlocking answer:', error);
      alert('Error unlocking answer. Please try again.');
    }
  };

  const changeRound = async (newRound: number) => {
    if (newRound < 1 || newRound > rounds.length) return;
    
    try {
      await set(ref(database, 'gameState'), { 
        currentRound: newRound,
        hasStarted: gameStarted 
      });
    } catch (error) {
      console.error('Error changing round:', error);
    }
  };

  const startGame = async () => {
    try {
      await set(ref(database, 'gameState'), { 
        currentRound: 1,
        hasStarted: true 
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const resetGame = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the entire game? This will:\n\n' +
      '- Delete all teams\n' +
      '- Clear all answers\n' +
      '- Clear all scores\n' +
      '- Reset to Round 1\n' +
      '- Send everyone back to lobby\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmed) return;

    try {
      // Clear all data
      await set(ref(database, 'teams'), null);
      await set(ref(database, 'scores'), null);
      await set(ref(database, 'locked'), null);
      await set(ref(database, 'gameState'), { currentRound: 1, hasStarted: false });
      
      alert('Game reset successfully!');
    } catch (error) {
      console.error('Error resetting game:', error);
      alert('Error resetting game. Please try again.');
    }
  };


  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRoundData = rounds.find(r => r.number === currentRound);
  if (!currentRoundData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Live</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                >
                  🚀 Start Game
                </button>
              )}
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Reset Game
              </button>
              <a
                href="/leaderboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                View Leaderboard
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {!gameStarted ? (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-yellow-900 mb-4">
              Game Not Started
            </h3>
            <p className="text-yellow-800 mb-4">
              {teams.length} team{teams.length !== 1 ? 's' : ''} waiting in lobby
            </p>
            <p className="text-yellow-700">
              Click "Start Game" when you're ready to begin Round 1
            </p>
          </div>
        ) : (
          <>
            {/* Round Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeRound(currentRound - 1)}
              disabled={currentRound === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Round
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">{currentRoundData.name}</h3>
              <p className="text-gray-600 mt-1">Round {currentRound} of {rounds.length}</p>
            </div>

            <button
              onClick={() => changeRound(currentRound + 1)}
              disabled={currentRound === rounds.length}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Round
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          {currentRoundData.questions.map((question) => {
            const isLocked = lockedQuestions.includes(question.id);
            const parts = question.parts || 1;
            const isMultiPart = parts > 1;
            
            return (
              <div key={question.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Question {question.id}
                      {isMultiPart && <span className="text-purple-600 ml-2">({parts} parts)</span>}
                    </h3>
                    <p className="text-gray-600 mt-1">{question.text}</p>
                  </div>
                  <button
                    onClick={() => toggleLockQuestion(question.id)}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      isLocked 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    {isLocked ? 'Locked' : 'Open'}
                  </button>
                </div>

                <div className="space-y-3">
                  {teams.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      No teams have joined yet
                    </div>
                  ) : (
                    teams.map((team) => {
                      const teamAnswer = team.answers && team.answers[question.id];
                      const teamScore = scores[team.name]?.[question.id];
                      const hasAnswer = teamAnswer !== undefined && teamAnswer !== null && 
                        (Array.isArray(teamAnswer) ? teamAnswer.some(a => a) : teamAnswer);
                      
                      return (
                        <div key={team.name} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <p className="font-semibold text-gray-800">{team.name}</p>
                            {hasAnswer && (
                              <button
                                onClick={() => unlockAnswer(team.name, question.id)}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold text-sm flex items-center gap-1"
                                title="Unlock this answer so the team can edit it"
                              >
                                <KeyRound className="w-4 h-4" />
                                Unlock
                              </button>
                            )}
                          </div>
                          
                          {isMultiPart && Array.isArray(teamAnswer) ? (
                            <div className="space-y-3">
                              {teamAnswer.map((ans, partIdx) => {
                                const label = question.partLabels?.[partIdx] || `Part ${partIdx + 1}`;
                                return (
                                  <div key={partIdx} className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-600 font-semibold mb-1">{label}:</p>
                                      <p className="text-gray-600 bg-gray-50 p-3 rounded">
                                        {ans || <span className="text-gray-400 italic">No answer</span>}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      {[0, 1].map((points) => {
                                        const currentPartScore = Array.isArray(teamScore) ? teamScore[partIdx] : undefined;
                                        return (
                                          <button
                                            key={points}
                                            onClick={() => updateScore(team.name, question.id, partIdx, points)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                                              currentPartScore === points
                                                ? points === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                          >
                                            {points === 1 ? '✓' : '✗'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-gray-600 bg-gray-50 p-3 rounded">
                                  {teamAnswer || <span className="text-gray-400 italic">No answer yet</span>}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {[0, 1].map((points) => (
                                  <button
                                    key={points}
                                    onClick={() => updateScore(team.name, question.id, null, points)}
                                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                                      teamScore === points
                                        ? points === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {points === 1 ? '✓ Correct' : '✗ Wrong'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;