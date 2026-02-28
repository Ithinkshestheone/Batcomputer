import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Gamepad2, 
  Shield, 
  Cpu, 
  Wifi, 
  Battery, 
  X, 
  Maximize2, 
  ExternalLink,
  ChevronRight,
  Search,
  Activity,
  User,
  LogIn,
  LogOut,
  Trophy,
  Lock,
  UserPlus,
  Info
} from 'lucide-react';
import { GAMES, Game } from './games';

interface UserData {
  id: number;
  username: string;
}

interface Score {
  game_id: string;
  score: number;
}

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  key?: React.Key;
}

const Tooltip = ({ children, text, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-[100] px-2 py-1 bg-bat-panel border border-bat-accent/50 rounded text-[10px] font-mono text-bat-accent whitespace-nowrap pointer-events-none bat-glow ${positionClasses[position]}`}
          >
            <div className="flex items-center gap-1">
              <Info size={10} />
              {text.toUpperCase()}
            </div>
            {/* Arrow */}
            <div className={`absolute w-1.5 h-1.5 bg-bat-panel border-r border-b border-bat-accent/50 rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-[4px]' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-[4px] rotate-[225deg]' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-[4px] rotate-[-45deg]' :
              'right-full top-1/2 -translate-y-1/2 -mr-[4px] rotate-[135deg]'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [booting, setBooting] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<UserData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [scores, setScores] = useState<Score[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recentGames, setRecentGames] = useState<string[]>([]);
  const [lastSession, setLastSession] = useState<string | null>(null);
  const [gameLoading, setGameLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    checkUser();
    loadLocalData();
    return () => {
      clearTimeout(timer);
      clearInterval(clock);
    };
  }, []);

  const loadLocalData = () => {
    const savedRecent = localStorage.getItem('batcomputer_recent');
    if (savedRecent) setRecentGames(JSON.parse(savedRecent));
    
    const savedSession = localStorage.getItem('batcomputer_last_session');
    if (savedSession) setLastSession(savedSession);
  };

  const saveToRecent = (gameId: string) => {
    const updated = [gameId, ...recentGames.filter(id => id !== gameId)].slice(0, 5);
    setRecentGames(updated);
    localStorage.setItem('batcomputer_recent', JSON.stringify(updated));
    localStorage.setItem('batcomputer_last_session', gameId);
    setLastSession(gameId);
  };

  const resumeSession = () => {
    if (lastSession) {
      const game = GAMES.find(g => g.id === lastSession);
      if (game) {
        setGameLoading(true);
        setSelectedGame(game);
      }
    }
  };

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchScores();
      }
    } catch (err) {
      console.error('Auth check failed');
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error('Failed to fetch scores');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = showAuthModal === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setShowAuthModal(null);
        setAuthForm({ username: '', password: '' });
        fetchScores();
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Connection error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setScores([]);
  };

  const submitScore = async (gameId: string, score: number) => {
    if (!user) return;
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, score }),
    });
    fetchScores();
  };

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(GAMES.map(g => g.category)));

  if (booting) {
    return (
      <div className="fixed inset-0 bg-bat-bg flex flex-col items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-bat-accent flex flex-col items-center"
        >
          <Shield size={80} className="mb-4 animate-pulse" />
          <h1 className="font-display text-2xl tracking-widest bat-text-glow">BATCOMPUTER v4.0</h1>
          <div className="mt-8 w-64 h-1 bg-bat-accent/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-bat-accent"
            />
          </div>
          <p className="mt-4 font-mono text-xs opacity-50 uppercase">Initializing secure arcade protocols...</p>
          
          {lastSession && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => {
                setBooting(false);
                resumeSession();
              }}
              className="mt-8 px-6 py-2 border border-bat-yellow/50 text-bat-yellow font-mono text-xs rounded hover:bg-bat-yellow/10 transition-all bat-glow"
            >
              RESUME LAST SESSION: {GAMES.find(g => g.id === lastSession)?.title.toUpperCase()}
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bat-bg text-bat-accent p-4 md:p-8 relative">
      <div className="scanline" />
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-bat-accent/20 pb-6">
        <div className="flex items-center gap-4">
          <Tooltip text="Secure System Core" position="right">
            <div className="p-3 bg-bat-accent/10 rounded-lg bat-border">
              <Shield className="text-bat-accent" size={32} />
            </div>
          </Tooltip>
          <div>
            <h1 className="font-display text-2xl md:text-3xl tracking-tighter bat-text-glow">
              BATCOMPUTER <span className="text-bat-yellow">ARCADE</span>
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-mono opacity-60">
              <Tooltip text="System Integrity">
                <span className="flex items-center gap-1"><Activity size={12} /> SYSTEM: OPTIMAL</span>
              </Tooltip>
              <Tooltip text="Network Encryption">
                <span className="flex items-center gap-1"><Wifi size={12} /> ENCRYPTED</span>
              </Tooltip>
              <Tooltip text="Power Reserve">
                <span className="flex items-center gap-1"><Battery size={12} /> 100%</span>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
            <input 
              type="text"
              placeholder="SEARCH DATABASE..."
              className="bg-bat-panel border border-bat-accent/30 rounded-md py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:border-bat-accent transition-colors font-mono text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {user ? (
            <div className="flex items-center gap-4 bg-bat-panel p-2 rounded-lg border border-bat-accent/20">
              <Tooltip text="User Profile">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono text-bat-yellow">{user.username.toUpperCase()}</span>
                  <span className="text-[10px] opacity-50 font-mono">AUTHORIZED</span>
                </div>
              </Tooltip>
              <Tooltip text="Terminate Session">
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-bat-red/20 text-bat-red rounded-md transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </Tooltip>
            </div>
          ) : (
            <Tooltip text="Access Terminal">
              <button 
                onClick={() => setShowAuthModal('login')}
                className="flex items-center gap-2 bg-bat-accent/10 hover:bg-bat-accent/20 border border-bat-accent/30 px-4 py-2 rounded-md transition-all font-mono text-sm"
              >
                <LogIn size={18} />
                LOGIN
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {recentGames.length > 0 && (
            <div className="bg-bat-panel p-6 bat-border rounded-xl">
              <h2 className="font-display text-sm mb-4 flex items-center gap-2">
                <Activity size={16} className="text-bat-accent" /> RECENT GAMES
              </h2>
              <div className="space-y-2">
                {recentGames.map(id => {
                  const game = GAMES.find(g => g.id === id);
                  if (!game) return null;
                  return (
                    <Tooltip key={id} text={`Resume ${game.title}`} position="right">
                      <button 
                        onClick={() => {
                          setGameLoading(true);
                          setSelectedGame(game);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-bat-accent/10 transition-colors text-[10px] font-mono flex justify-between items-center group"
                      >
                        {game.title.toUpperCase()}
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          {user && (
            <div className="bg-bat-panel p-6 bat-border rounded-xl">
              <h2 className="font-display text-sm mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-bat-yellow" /> HIGH SCORES
              </h2>
              <div className="space-y-3">
                {scores.length > 0 ? scores.map(s => (
                  <Tooltip key={s.game_id} text={`Personal Best for ${s.game_id}`} position="right">
                    <div className="flex justify-between items-center text-xs font-mono w-full">
                      <span className="opacity-60">{s.game_id.toUpperCase()}</span>
                      <span className="text-bat-accent">{s.score.toLocaleString()}</span>
                    </div>
                  </Tooltip>
                )) : (
                  <p className="text-[10px] opacity-40 font-mono italic">NO DATA RECORDED</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-bat-panel p-6 bat-border rounded-xl">
            <h2 className="font-display text-sm mb-4 flex items-center gap-2">
              <Terminal size={16} /> SYSTEM STATUS
            </h2>
            <div className="space-y-4">
              <Tooltip text="Processor Load">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span>CPU USAGE</span>
                    <span>{Math.floor(Math.random() * 20) + 10}%</span>
                  </div>
                  <div className="h-1 bg-bat-accent/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${Math.floor(Math.random() * 20) + 10}%` }}
                      className="h-full bg-bat-accent" 
                    />
                  </div>
                </div>
              </Tooltip>
              <Tooltip text="Memory Allocation">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span>MEMORY</span>
                    <span>2.4 GB</span>
                  </div>
                  <div className="h-1 bg-bat-accent/10 rounded-full overflow-hidden">
                    <div className="w-[35%] h-full bg-bat-accent" />
                  </div>
                </div>
              </Tooltip>
              <div className="pt-4 border-t border-bat-accent/10">
                <Tooltip text="Security Override Active">
                  <div className="flex items-center gap-2 text-xs text-bat-yellow">
                    <div className="w-2 h-2 rounded-full bg-bat-yellow animate-pulse" />
                    UNBLOCKED PROTOCOL ACTIVE
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="bg-bat-panel p-6 bat-border rounded-xl">
            <h2 className="font-display text-sm mb-4 flex items-center gap-2">
              <Gamepad2 size={16} /> CATEGORIES
            </h2>
            <div className="space-y-2">
              <Tooltip text="Show all available games" position="right">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-mono flex justify-between items-center group ${!activeCategory ? 'bg-bat-accent/20 text-bat-accent' : 'hover:bg-bat-accent/10'}`}
                >
                  ALL GAMES
                  <ChevronRight size={14} className={!activeCategory ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </button>
              </Tooltip>
              {categories.map(cat => (
                <Tooltip key={cat} text={`Filter by ${cat}`} position="right">
                  <button 
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-mono flex justify-between items-center group ${activeCategory === cat ? 'bg-bat-accent/20 text-bat-accent' : 'hover:bg-bat-accent/10'}`}
                  >
                    {cat.toUpperCase()}
                    <ChevronRight size={14} className={activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </aside>

        {/* Game Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Tooltip key={game.id} text={`Launch ${game.title}`} position="bottom">
                <motion.div
                  layoutId={game.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => {
                    setGameLoading(true);
                    setSelectedGame(game);
                    saveToRecent(game.id);
                  }}
                  className="group relative bg-bat-panel bat-border rounded-xl overflow-hidden cursor-pointer hover:border-bat-accent/80 transition-all hover:bat-glow w-full"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={game.thumbnail} 
                      alt={game.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bat-panel via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-bat-bg/80 border border-bat-accent/30 rounded text-[10px] font-mono">
                      {game.category}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display text-sm group-hover:text-bat-yellow transition-colors flex items-center gap-2">
                      <div className="w-1 h-3 bg-bat-accent/50 group-hover:bg-bat-yellow transition-colors" />
                      {game.title}
                    </h3>
                    <div className="bg-bat-bg/30 p-2 rounded border border-bat-accent/10 group-hover:border-bat-accent/30 transition-colors">
                      <p className="text-[10px] opacity-70 font-mono leading-tight">
                        <span className="text-bat-accent/50 mr-1">DESC_LOG:</span>
                        {game.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-bat-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </motion.div>
              </Tooltip>
            ))}
          </div>
          
          {filteredGames.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Cpu size={48} className="mb-4" />
              <p className="font-mono">NO MATCHING DATA FOUND IN DATABASE</p>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bat-bg/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-bat-panel bat-border rounded-xl p-8 relative"
            >
              <Tooltip text="Close Terminal" position="left">
                <button 
                  onClick={() => setShowAuthModal(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-bat-red/20 text-bat-red rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </Tooltip>

              <div className="flex flex-col items-center mb-8">
                <div className="p-4 bg-bat-accent/10 rounded-full mb-4">
                  {showAuthModal === 'login' ? <Lock className="text-bat-accent" size={32} /> : <UserPlus className="text-bat-accent" size={32} />}
                </div>
                <h2 className="font-display text-xl tracking-widest">
                  {showAuthModal === 'login' ? 'ACCESS TERMINAL' : 'CREATE PROTOCOL'}
                </h2>
                <p className="text-[10px] font-mono opacity-50 mt-2">SECURE AUTHENTICATION REQUIRED</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono opacity-60 uppercase">Username</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-bat-bg border border-bat-accent/30 rounded-md py-2 px-4 focus:outline-none focus:border-bat-accent font-mono text-sm"
                    value={authForm.username}
                    onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono opacity-60 uppercase">Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full bg-bat-bg border border-bat-accent/30 rounded-md py-2 px-4 focus:outline-none focus:border-bat-accent font-mono text-sm"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                {authError && (
                  <div className="text-bat-red text-[10px] font-mono bg-bat-red/10 p-2 rounded border border-bat-red/30">
                    ERROR: {authError.toUpperCase()}
                  </div>
                )}

                <Tooltip text="Execute Authentication Sequence" position="bottom">
                  <button 
                    type="submit"
                    className="w-full bg-bat-accent text-bat-bg font-display py-3 rounded-md hover:bg-bat-accent/90 transition-all bat-glow"
                  >
                    {showAuthModal === 'login' ? 'INITIALIZE LOGIN' : 'CREATE ACCOUNT'}
                  </button>
                </Tooltip>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login')}
                  className="text-[10px] font-mono text-bat-yellow hover:underline"
                >
                  {showAuthModal === 'login' ? 'NEED NEW PROTOCOL? REGISTER' : 'ALREADY HAVE ACCESS? LOGIN'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-bat-bg/95 backdrop-blur-sm"
          >
            <motion.div
              layoutId={selectedGame.id}
              className="w-full max-w-6xl bg-bat-panel bat-border rounded-2xl overflow-hidden flex flex-col h-full max-h-[90vh]"
            >
              <div className="p-4 border-b border-bat-accent/20 flex justify-between items-center bg-bat-bg/50">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="text-bat-yellow" size={20} />
                  <h2 className="font-display text-lg tracking-tight">{selectedGame.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <Tooltip text="Record current performance to database">
                      <button 
                        onClick={() => submitScore(selectedGame.id, Math.floor(Math.random() * 10000))}
                        className="flex items-center gap-2 px-3 py-1 bg-bat-yellow/10 hover:bg-bat-yellow/20 border border-bat-yellow/30 rounded-md text-bat-yellow font-mono text-[10px] transition-all"
                      >
                        <Trophy size={14} />
                        SAVE SCORE
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip text="Open in external terminal">
                    <button 
                      onClick={() => window.open(selectedGame.iframeUrl, '_blank')}
                      className="p-2 hover:bg-bat-accent/10 rounded-full transition-colors text-bat-accent"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Terminate Game Session" position="left">
                    <button 
                      onClick={() => setSelectedGame(null)}
                      className="p-2 hover:bg-bat-red/20 rounded-full transition-colors text-bat-red"
                    >
                      <X size={24} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              
              <div className="flex-1 bg-black relative group">
                <AnimatePresence>
                  {gameLoading && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bat-bg"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-bat-accent mb-8"
                      >
                        <Shield size={80} className="bat-glow" />
                      </motion.div>
                      
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between font-mono text-[10px] text-bat-accent/60">
                          <span>LOADING PROTOCOLS...</span>
                          <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            [SECURE]
                          </motion.span>
                        </div>
                        <div className="h-1.5 bg-bat-accent/10 rounded-full overflow-hidden border border-bat-accent/20">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "circOut" }}
                            className="h-full bg-bat-accent shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                          />
                        </div>
                        <div className="flex justify-center">
                          <p className="font-mono text-[8px] tracking-[0.3em] text-bat-yellow/50 uppercase">
                            Wayne Enterprises Secure Link
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <iframe 
                  src={selectedGame.iframeUrl}
                  className={`w-full h-full border-none transition-opacity duration-700 ${gameLoading ? 'opacity-0' : 'opacity-100'}`}
                  title={selectedGame.title}
                  allow="fullscreen"
                  onLoad={() => setGameLoading(false)}
                />
                <div className="absolute inset-0 pointer-events-none border-[20px] border-bat-panel/20 opacity-50" />
              </div>

              <div className="p-4 bg-bat-bg/50 border-t border-bat-accent/20 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6 text-[10px] font-mono opacity-60">
                  <Tooltip text="Display Mode: Optimized">
                    <span className="flex items-center gap-1"><Maximize2 size={12} /> FULLSCREEN ENABLED</span>
                  </Tooltip>
                  <Tooltip text="Connection Status: Secure">
                    <span className="flex items-center gap-1"><Shield size={12} /> SECURE CONNECTION</span>
                  </Tooltip>
                </div>
                <div className="text-[10px] font-mono text-bat-yellow">
                  CAUTION: EXTERNAL DATA STREAM ACTIVE
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-bat-accent/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 text-[10px] font-mono">
        <p>© 2026 WAYNE ENTERPRISES - SECURE ARCADE TERMINAL</p>
        <div className="flex gap-4">
          <span>PRIVACY_ENCRYPTED</span>
          <span>SYSTEM_LOGS</span>
          <span>V4.0.2-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
