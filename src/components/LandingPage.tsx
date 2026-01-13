import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData } from '../types';

const LandingPage: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createTeam = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const teamRef = ref(database, `teams/${teamName}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        // Team already exists - ask if they want to rejoin
        const confirmed = window.confirm(
          `Team "${teamName}" already exists.\n\nDid you create this team earlier and need to rejoin?\n\nClick OK to rejoin, or Cancel to choose a different name.`
        );
        
        if (confirmed) {
          // Let them rejoin
          sessionStorage.setItem('currentTeam', teamName);
          navigate('/lobby');
        } else {
          setError('Please choose a different team name');
        }
        setLoading(false);
        return;
      }
      
      // Create new team
      const teamData: TeamData = {
        name: teamName,
        answers: {},
        timestamp: Date.now()
      };
      await set(teamRef, teamData);
      
      sessionStorage.setItem('currentTeam', teamName);
      navigate('/lobby');
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Error creating team. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-pink-600 to-yellow-600 flex items-center justify-center p-4 tracking-tighter">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transform transition-transform">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto gap-5 mb-4">
              <img 
                src="/couchIcon.png" 
                alt="Couch Icon" 
                className="w-20 h-20 object-contain"
              />
              <img 
                src="/maap.png" 
                alt="MAAP Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tighter">
              Couch View Trivia Night
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-1">
                Enter Team Name
              </label>
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Most creative team name wins a calendar 🏆
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError(''); // Clear error when typing
                }}
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
                placeholder="Something like Wout van Farts..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all text-lg ${
                  error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                }`}
              />
              {error && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={createTeam}
              disabled={loading || !teamName.trim()}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Users className="w-7 h-7" />
              {loading ? 'Creating Team...' : 'Join'}
            </button>

            <div className="text-center pt-4 border-t-2 border-gray-200">
              <a
                href="/admin"
                className="text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors"
              >
               for ansel →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;