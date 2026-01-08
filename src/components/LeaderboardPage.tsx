import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, RefreshCw } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { TeamData, Scores } from '../types';

const LeaderboardPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    // Listen to teams
    const teamsRef = ref(database, 'teams');
    const teamsUnsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const teamsData = snapshot.val();
        const teamsArray = Object.values(teamsData) as TeamData[];
        setTeams(teamsArray);
      } else {
        setTeams([]);
      }
    });

    // Listen to scores
    const scoresRef = ref(database, 'scores');
    const scoresUnsubscribe = onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        setScores(snapshot.val());
      } else {
        setScores({});
      }
    });

    return () => {
      off(teamsRef);
      off(scoresRef);
    };
  }, []);

  const calculateTotalScore = (teamName: string): number => {
    if (!scores[teamName]) return 0;
    return Object.values(scores[teamName]).reduce<number>((sum, score) => {
      if (Array.isArray(score)) {
        // Multi-part question - sum all parts
        return sum + score.reduce((partSum, partScore) => partSum + (partScore || 0), 0);
      }
      return sum + (score as number);
    }, 0);
  };

  const sortedTeams = [...teams].sort((a, b) => calculateTotalScore(b.name) - calculateTotalScore(a.name));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
              <img 
              src="/couchIcon.png" 
              alt="Trophy" 
              className="w-20 h-20 object-contain"
            />
            <h1 className="text-5xl md:text-4xl font-bold text-black">
              Couch Trivia Leaderboard
            </h1>
              <img 
              src="/couchIcon.png" 
              alt="Trophy" 
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        {/* Leaderboard */}
        {sortedTeams.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 text-center">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400 opacity-50" />
            <p className="text-3xl text-white font-semibold">Waiting for teams to join...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTeams.map((team, index) => {
              const totalScore = calculateTotalScore(team.name);
              const isTopThree = index < 3;
              
              return (
                <div
                  key={team.name}
                >
                  <div
                    className={`rounded-2xl p-6 md:p-8 shadow-2xl flex items-center justify-between ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : 'bg-white/10 backdrop-blur-lg'
                    }`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* Rank */}
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-3xl md:text-4xl shadow-lg ${
                          index === 0
                            ? 'bg-yellow-600 text-yellow-100'
                            : index === 1
                            ? 'bg-gray-500 text-gray-100'
                            : index === 2
                            ? 'bg-orange-700 text-orange-100'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {index === 0 ? (
                          <Trophy className="w-10 h-10 md:w-12 md:h-12" />
                        ) : index === 1 ? (
                          <Medal className="w-10 h-10 md:w-12 md:h-12" />
                        ) : index === 2 ? (
                          <Award className="w-10 h-10 md:w-12 md:h-12" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Team Name */}
                      <div>
                        <h3
                          className={`text-2xl md:text-4xl font-bold ${
                            isTopThree ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          {team.name}
                        </h3>
                        {index === 0 && (
                          <p className="text-yellow-900 font-semibold text-sm md:text-base mt-1">
                            current leader
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div
                        className={`text-4xl md:text-6xl font-bold ${
                          isTopThree ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        {totalScore}
                      </div>
                      <div
                        className={`text-sm md:text-lg font-semibold ${
                          isTopThree ? 'text-gray-700' : 'text-white/80'
                        }`}
                      >
                        points
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/60 text-sm">
          <p>Trivia Night {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;