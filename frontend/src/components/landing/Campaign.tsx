'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  getOrCreateUser, 
  getTasks, 
  getUserCompletions, 
  completeTask, 
  getLeaderboard,
  getUserRank,
  getTotalUsers,
  Task,
  User,
  TaskCompletion,
  LeaderboardEntry
} from '@/lib/supabase';

// Task icons
const TaskIcons: { [key: string]: React.ReactNode } = {
  follow_twitter: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  like_tweet: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
    </svg>
  ),
  retweet: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
    </svg>
  ),
};

function TaskCard({ 
  task, 
  isCompleted, 
  onComplete,
  isLoading 
}: { 
  task: Task; 
  isCompleted: boolean;
  onComplete: () => void;
  isLoading: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenUrl = () => {
    if (task.action_url) {
      window.open(task.action_url, '_blank');
    }
  };

  return (
    <div 
      className={`relative group transition-all duration-300 ${
        isCompleted ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 transition-opacity duration-300 ${
        isHovered && !isCompleted ? 'opacity-30' : ''
      }`} />
      
      <div className={`relative flex items-center gap-4 p-4 bg-white/5 border rounded-xl transition-all duration-300 ${
        isCompleted ? 'border-green-500/30' : 'border-white/10 hover:border-white/20'
      }`}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isCompleted ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            TaskIcons[task.name] || (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{task.description}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
              +{task.points} XP
            </span>
            {isCompleted && (
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {task.action_url && !isCompleted && (
            <button
              onClick={handleOpenUrl}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Open
            </button>
          )}
          
          {!isCompleted && (
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderboardTable({ entries, currentWallet }: { entries: LeaderboardEntry[]; currentWallet?: string }) {
  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isCurrentUser = currentWallet && entry.wallet_address.toLowerCase() === currentWallet.toLowerCase();
        const displayAddress = `${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`;
        
        return (
          <div 
            key={entry.wallet_address}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
              isCurrentUser 
                ? 'bg-blue-500/20 border border-blue-500/30' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              index === 1 ? 'bg-gray-400/20 text-gray-400' :
              index === 2 ? 'bg-orange-500/20 text-orange-400' :
              'bg-white/10 text-gray-400'
            }`}>
              {entry.rank}
            </div>
            <div className="flex-1 font-mono text-sm text-gray-300">
              {displayAddress}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-blue-400">(You)</span>
              )}
            </div>
            <div className="font-semibold text-white">
              {entry.total_points.toLocaleString()} <span className="text-yellow-400 text-sm">XP</span>
            </div>
          </div>
        );
      })}
      
      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No participants yet. Be the first!
        </div>
      )}
    </div>
  );
}

export default function Campaign() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      const tasksData = await getTasks();
      setTasks(tasksData);
    };
    loadTasks();
  }, []);

  // Load user data when connected
  useEffect(() => {
    const loadUserData = async () => {
      if (!address) {
        setUser(null);
        setCompletions([]);
        setUserRank(null);
        return;
      }

      setIsLoading(true);
      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);
        
        if (userData) {
          const completionsData = await getUserCompletions(userData.id);
          setCompletions(completionsData);
          
          const rank = await getUserRank(address);
          setUserRank(rank);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [address]);

  // Load leaderboard
  useEffect(() => {
    const loadLeaderboard = async () => {
      const leaderboardData = await getLeaderboard(10);
      setLeaderboard(leaderboardData);
      
      const total = await getTotalUsers();
      setTotalUsers(total);
    };
    loadLeaderboard();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;
    
    setLoadingTask(taskId);
    try {
      const success = await completeTask(user.id, taskId);
      if (success) {
        // Refresh user data
        const userData = await getOrCreateUser(address!);
        setUser(userData);
        
        if (userData) {
          const completionsData = await getUserCompletions(userData.id);
          setCompletions(completionsData);
        }
        
        // Refresh leaderboard
        const leaderboardData = await getLeaderboard(10);
        setLeaderboard(leaderboardData);
        
        const rank = await getUserRank(address!);
        setUserRank(rank);
        
        const total = await getTotalUsers();
        setTotalUsers(total);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
    setLoadingTask(null);
  };

  const isTaskCompleted = (taskId: string) => {
    return completions.some(c => c.task_id === taskId);
  };

  return (
    <section ref={sectionRef} className="relative py-24 px-4" id="campaign">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-purple-400 text-sm font-medium">XyloNet Campaign</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Complete Tasks.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              Earn XP.
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join the XyloNet community and earn points for completing tasks. Climb the leaderboard and get rewarded!
          </p>
        </div>

        {/* User stats card */}
        <div 
          className={`mb-8 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30" />
            <div className="relative bg-[#0d0e12] border border-white/10 rounded-2xl p-6">
              {!isConnected ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="text-gray-400 text-center">
                    Connect your wallet to start earning XP
                  </div>
                  <ConnectButton />
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                      {user?.total_points || 0}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {user?.total_points || 0} <span className="text-yellow-400">XP</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        #{userRank || '-'}
                      </div>
                      <div className="text-sm text-gray-400">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {completions.length}/{tasks.length}
                      </div>
                      <div className="text-sm text-gray-400">Tasks Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {totalUsers}
                      </div>
                      <div className="text-sm text-gray-400">Participants</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className={`flex gap-4 mb-6 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button
            onClick={() => setShowLeaderboard(false)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              !showLeaderboard 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              showLeaderboard 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Leaderboard
          </button>
        </div>

        {/* Content */}
        <div 
          className={`transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {showLeaderboard ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Top Participants
              </h3>
              <LeaderboardTable entries={leaderboard} currentWallet={address} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400">📱</span> Social Tasks
                </h3>
                <p className="text-sm text-gray-400">
                  Complete these tasks to earn XP and help grow the XyloNet community
                </p>
              </div>
              
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={isTaskCompleted(task.id)}
                    onComplete={() => handleCompleteTask(task.id)}
                    isLoading={loadingTask === task.id}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📋</div>
                  <p>No tasks available yet. Check back soon!</p>
                </div>
              )}
              
              {/* Coming soon section */}
              <div className="mt-8 p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-purple-400">⛓️</span> On-Chain Tasks
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Complete swaps, add liquidity, and more to earn bonus XP
                </p>
                <div className="space-y-2 opacity-50">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-500">🔄</div>
                    <span className="text-gray-500">Complete your first swap (+100 XP)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-500">💧</div>
                    <span className="text-gray-500">Add liquidity to any pool (+150 XP)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-500">🌉</div>
                    <span className="text-gray-500">Bridge USDC to another chain (+200 XP)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
