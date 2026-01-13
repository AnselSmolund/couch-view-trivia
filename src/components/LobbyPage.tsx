import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { GameState} from '../types';

const LobbyPage: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
      setCurrentTeam(savedTeam);
    } else {
      navigate('/');
    }
    
    // Lock scroll on mount
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const leaveTeam = () => {
    sessionStorage.removeItem('currentTeam');
    setCurrentTeam(null);
    navigate('/');
  };

  if (!currentTeam) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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

      <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        {/* Welcome Message - Centered */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-3">
            Welcome, {currentTeam}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600">
            We'll be starting momentarily
          </p>
        </div>

        {/* Leave Button */}
        <button
          onClick={leaveTeam}
          className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Leave Lobby
        </button>

      </div>
    </div>
  );
};

export default LobbyPage;