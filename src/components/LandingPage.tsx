import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData } from '../types';

const LandingPage: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createTeam = async () => {
    if (!teamName.trim()) return;
    
    setLoading(true);
    try {
      const teamRef = ref(database, `teams/${teamName}`);
      const snapshot = await get(teamRef);
      
      if (!snapshot.exists()) {
        const teamData: TeamData = {
          name: teamName,
          answers: {},
          timestamp: Date.now()
        };
        await set(teamRef, teamData);
      }
      
      sessionStorage.setItem('currentTeam', teamName);
      navigate('/trivia');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4 tracking-tighter">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 transform hover:scale-105 transition-transform">
          <div className="text-center mb-8">
             <img 
              src="/couchIcon.png" 
              alt="Trophy" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tighter">Couch View Trivia Night</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
                placeholder="Enter your team name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
              />
            </div>

            <button
              onClick={createTeam}
              disabled={loading || !teamName.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Users className="w-6 h-6" />
              {loading ? 'Creating Team...' : 'Join'}
            </button>

            <div className="text-center mt-4">
              <a
                href="/admin"
                className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
              >
                Admin Portal →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;