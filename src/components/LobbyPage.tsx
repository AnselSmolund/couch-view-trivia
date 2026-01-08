import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { GameState, TeamData } from '../types';

const LobbyPage: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
      setCurrentTeam(savedTeam);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Listen for game start
  useEffect(() => {
    const gameStateRef = ref(database, 'gameState');
    onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const gameState = snapshot.val() as GameState;
        if (gameState.hasStarted) {
          navigate('/trivia');
        }
      }
    });

    return () => off(gameStateRef);
  }, [navigate]);

  // Listen to teams joining
  useEffect(() => {
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

    return () => off(teamsRef);
  }, []);

  const leaveTeam = () => {
    sessionStorage.removeItem('currentTeam');
    setCurrentTeam(null);
    navigate('/');
  };

  if (!currentTeam) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <Clock className="w-16 h-16 text-purple-600 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Welcome, {currentTeam}!
            </h1>
            <p className="text-xl text-gray-600">
              Waiting for the game to start...
            </p>
          </div>

          {/* Teams List */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Teams in Lobby ({teams.length})
              </h2>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 max-h-96 overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No teams yet. You're the first!
                </p>
              ) : (
                <div className="grid gap-3">
                  {teams.map((team, index) => (
                    <div
                      key={team.name}
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        team.name === currentTeam
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-white border-2 border-gray-200'
                      }`}
                    >
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {team.name}
                      </span>
                      {team.name === currentTeam && (
                        <span className="ml-auto text-purple-600 font-semibold text-sm">
                          (You)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-purple-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-purple-800">
              <li>• Ill start the game shortly</li>
              <li>• You'll automatically be taken to Round 1 when it begins</li>
              <li>• Answer questions as they appear on the screen</li>
              <li>• Once submitted, answers are locked</li>
            </ul>
          </div>

          {/* Leave Button */}
          <button
            onClick={leaveTeam}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;