
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { POKEMON_DB, MAP_DATA } from './constants';
import { PokemonInstance, PokemonTemplate, GameState, LogEntry, Move } from './types';

// Các hàm tiện ích giấu kín
const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const expNeeded = (level: number) => 50 + (level - 1) * 10;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [playerTeam, setPlayerTeam] = useState<PokemonInstance[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [enemy, setEnemy] = useState<PokemonInstance | null>(null);
  const [pos, setPos] = useState({ x: 3, y: 4 });
  const [isBusy, setIsBusy] = useState(false);
  const [mustSwitch, setMustSwitch] = useState(false);
  const [battleView, setBattleView] = useState<'main' | 'moves'>('main');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [battleFlash, setBattleFlash] = useState(false);
  const [pokeballAnim, setPokeballAnim] = useState(false);
  const [pokeballShake, setPokeballShake] = useState(false);
  const [enemyFainted, setEnemyFainted] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const [enemyShaking, setEnemyShaking] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Cơ chế tự động dọn dẹp Console để ngăn soi mói logic qua F12
  useEffect(() => {
    const clean = setInterval(() => {
      if (window.console && window.console.clear) {
        // window.console.clear(); // Bỏ comment nếu muốn xóa sạch console liên tục
      }
    }, 1500);
    return () => clearInterval(clean);
  }, []);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'normal') => {
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  const createInstance = (template: PokemonTemplate, level = 5, noLegendaryBuff = false): PokemonInstance => {
    const isLegendary = !!template.isLegendary;
    let hp = Math.floor(template.maxHp * (1 + level / 20) + level * 2);
    let atk = Math.floor(template.atk * (1 + level / 50));
    if (isLegendary && !noLegendaryBuff) {
      hp = Math.floor(hp * 3.0);
      atk = Math.floor(atk * 3.0);
    }
    return { ...template, level, maxHp: hp, currentHp: hp, baseAtk: atk, exp: 0, uid: Math.random() };
  };

  const selectStarter = (s: PokemonTemplate) => {
    setPlayerTeam([createInstance(s, 5)]);
    setGameState('lobby');
  };

  const startBattle = useCallback(async () => {
    const maxPlayerLv = playerTeam.reduce((m, p) => Math.max(m, p.level), 1);
    
    /** 
     * LOGIC SPAWN BẢO MẬT: Giấu tỉ lệ spawn huyền thoại 
     * Không sử dụng hằng số rõ ràng, sử dụng giải mã btoa và toán học để đánh lừa F12.
     */
    const _v1 = atob("MC4wOQ=="); // "0.09" - Tỉ lệ 9%
    const _v2 = Math.sin(Date.now()) * 0.01; 
    const _computedRate = parseFloat(_v1) + _v2; 
    const isLegend = Math.random() < Math.max(0.05, _computedRate);
    
    let t: PokemonTemplate;
    let enemyLevel: number;

    if (isLegend) {
      t = POKEMON_DB.legendary[Math.floor(Math.random() * POKEMON_DB.legendary.length)];
      enemyLevel = maxPlayerLv + 10;
    } else {
      t = POKEMON_DB.wild[Math.floor(Math.random() * POKEMON_DB.wild.length)];
      const avgLv = Math.floor(playerTeam.reduce((acc, p) => acc + p.level, 0) / playerTeam.length);
      enemyLevel = clamp(avgLv + randInt(-1, 1), 1, 20);
    }

    const newEnemy = createInstance(t, enemyLevel);
    setEnemy(newEnemy);
    setGameState('vs');
    setMustSwitch(false);
    setBattleView('main');
    setEnemyFainted(false);
    setLogs([]);
    const active = playerTeam.findIndex(p => p.currentHp > 0);
    setActiveIdx(active);

    setTimeout(() => {
      setGameState('battle');
      addLog(newEnemy.isLegendary ? `⚠ CẢNH BÁO: PHÁT HIỆN ${newEnemy.name} HUYỀN THOẠI!` : `Một ${newEnemy.name} hoang dã xuất hiện!`);
    }, 2200);
  }, [playerTeam, addLog]);

  const move = useCallback((dx: number, dy: number) => {
    if (gameState !== 'lobby' || isBusy) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || nx >= MAP_DATA[0].length || ny < 0 || ny >= MAP_DATA.length || MAP_DATA[ny][nx] === 2) return;
    setPos({ x: nx, y: ny });
    if (MAP_DATA[ny][nx] === 3) {
      setPlayerTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
    }
    if (MAP_DATA[ny][nx] === 1 && Math.random() < 0.15) {
      startBattle();
    }
  }, [gameState, isBusy, pos, startBattle]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup') move(0, -1);
      if (k === 'arrowdown') move(0, 1);
      if (k === 'arrowleft') move(-1, 0);
      if (k === 'arrowright') move(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const endBattle = (forcedHeal = false) => {
    if (forcedHeal) {
      setPlayerTeam(prev => prev.map(p => ({ ...p, currentHp: p.maxHp })));
      const heals: {x:number, y:number}[] = [];
      MAP_DATA.forEach((row, y) => row.forEach((cell, x) => cell === 3 && heals.push({x, y})));
      if (heals.length) setPos(heals[Math.floor(Math.random() * heals.length)]);
    }
    setGameState('lobby');
    setEnemy(null);
    setIsBusy(false);
    setMustSwitch(false);
    setEnemyFainted(false);
  };

  const enemyTurn = async (currentEnemy: PokemonInstance, currentPlayer: PokemonInstance) => {
    if (!currentEnemy || currentEnemy.currentHp <= 0) return;
    const move = currentEnemy.moves[Math.floor(Math.random() * currentEnemy.moves.length)];
    addLog(`${currentEnemy.name} sử dụng ${move.name}!`, 'enemy');
    setPlayerShaking(true);
    setBattleFlash(true);
    const dmg = Math.max(1, Math.floor((move.pwr / 5) * (currentEnemy.level / 5) + (currentEnemy.baseAtk / 18)));
    setTimeout(() => {
      setPlayerShaking(false);
      setBattleFlash(false);
      setPlayerTeam(prev => {
        const next = [...prev];
        next[activeIdx].currentHp = Math.max(0, next[activeIdx].currentHp - dmg);
        if (next[activeIdx].currentHp <= 0) {
          addLog(`${next[activeIdx].name} đã ngất xỉu!`, 'system');
          setMustSwitch(true);
          if (!next.some(pk => pk.currentHp > 0)) {
            setTimeout(() => endBattle(true), 1200);
          }
        }
        return next;
      });
    }, 600);
  };

  const useMove = async (m: Move) => {
    if (isBusy || !enemy) return;
    setIsBusy(true);
    const p = playerTeam[activeIdx];
    addLog(`${p.name} dùng chiêu ${m.name}!`, 'player');
    setEnemyShaking(true);
    const dmg = Math.max(0, Math.floor((m.pwr / 5) * (p.level / 5) + (p.baseAtk / 20) + 5));
    const newEnemyHp = Math.max(0, enemy.currentHp - dmg);
    setEnemy(prev => prev ? { ...prev, currentHp: newEnemyHp } : null);
    await new Promise(r => setTimeout(r, 600));
    setEnemyShaking(false);
    if (newEnemyHp <= 0) {
      addLog(`${enemy.name} đã bị đánh bại!`, 'system');
      setEnemyFainted(true);
      const diff = enemy.level - p.level;
      let gain = diff > 0 ? diff * 30 : diff === 0 ? 20 : Math.max(1, 20 - 2 * Math.abs(diff));
      addLog(`Nhận được ${gain} EXP!`);
      setPlayerTeam(prev => {
        const next = [...prev];
        const pk = next[activeIdx];
        pk.exp += gain;
        while (pk.exp >= expNeeded(pk.level)) {
          pk.exp -= expNeeded(pk.level);
          pk.level++;
          pk.maxHp += 10;
          pk.baseAtk += 2;
          pk.currentHp = pk.maxHp;
          addLog(`🌟 CHÚC MỪNG! ${pk.name} lên cấp ${pk.level}!`, 'system');
        }
        return next;
      });
      setTimeout(() => endBattle(false), 1200);
      return;
    }
    await enemyTurn(enemy, p);
    setIsBusy(false);
    setBattleView('main');
  };

  const throwBall = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    setPokeballAnim(true);
    addLog("Đã ném Pokeball! Cố lên!", 'system');
    await new Promise(r => setTimeout(r, 800));
    setPokeballAnim(false);
    setEnemyFainted(true);
    for (let i = 0; i < 3; i++) {
      setPokeballShake(true);
      await new Promise(r => setTimeout(r, 800));
      setPokeballShake(false);
    }
    const maxLv = playerTeam.reduce((m, p) => Math.max(m, p.level), 1);
    const hpRatio = enemy.currentHp / enemy.maxHp;
    let rate;
    if (enemy.isLegendary) {
      rate = clamp((0.05 + Math.random() * 0.25) + (1 - hpRatio) * 0.30, 0.05, 0.60);
    } else {
      rate = clamp((enemy.level < maxLv ? 0.80 : 0.75) + (1 - hpRatio) * 0.15, 0.10, 0.95);
    }
    if (Math.random() < rate) {
      addLog(`Gotcha! ${enemy.name} đã bị thu phục!`, 'system');
      setShowToast(true);
      setPlayerTeam(prev => [...prev, { ...enemy, currentHp: enemy.maxHp }]);
      setTimeout(() => setShowToast(false), 1500);
      setTimeout(() => endBattle(false), 1200);
    } else {
      addLog(`Không xong rồi! Nó thoát ra mất!`, 'system');
      setEnemyFainted(false);
      await enemyTurn(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  const tryRunAway = async () => {
    if (isBusy || mustSwitch || !enemy) return;
    setIsBusy(true);
    addLog("Đang cố gắng chạy trốn...", 'system');
    await new Promise(r => setTimeout(r, 500));
    if (Math.random() < (enemy.isLegendary ? 0.50 : 0.80)) {
      addLog("Chạy trốn thành công!", 'system');
      setTimeout(() => endBattle(false), 600);
    } else {
      addLog("Không thể chạy trốn!", 'system');
      await enemyTurn(enemy, playerTeam[activeIdx]);
      setIsBusy(false);
      setBattleView('main');
    }
  };

  const moveBorderClass = (type: string) => {
    const t = type.toLowerCase();
    const colors: Record<string, string> = {
      fire: "border-l-4 border-l-red-500 bg-red-900/30",
      water: "border-l-4 border-l-blue-500 bg-blue-900/30",
      grass: "border-l-4 border-l-emerald-500 bg-emerald-900/30",
      electric: "border-l-4 border-l-yellow-500 bg-yellow-900/30",
      psychic: "border-l-4 border-l-purple-500 bg-purple-900/30",
      dragon: "border-l-4 border-l-indigo-500 bg-indigo-900/30",
      flying: "border-l-4 border-l-sky-500 bg-sky-900/30",
      dark: "border-l-4 border-l-slate-500 bg-slate-900/30",
      ghost: "border-l-4 border-l-violet-500 bg-violet-900/30"
    };
    return colors[t] || "border-l-4 border-l-gray-400 bg-gray-800/30";
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* START SCREEN */}
      {gameState === 'start' && (
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-red-500 rounded-full blur-3xl mix-blend-screen"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl mix-blend-screen"></div>
          </div>
          <div className="animate-bounce mb-8 relative z-10">
            <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-2xl">
              <circle cx="50" cy="50" r="45" fill="white" stroke="#1e293b" strokeWidth="4"/>
              <path d="M5 50 A 45 45 0 0 1 95 50 L 5 50" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
              <circle cx="50" cy="50" r="14" fill="white" stroke="#1e293b" strokeWidth="4"/>
              <circle cx="50" cy="50" r="8" fill="white" className="animate-pulse"/>
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-sm uppercase text-center font-pixel tracking-tighter">ACE SYSTEM</h1>
          <p className="mb-12 text-xs text-slate-400 uppercase tracking-[0.5em] font-bold">Phiên bản Remastered</p>
          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            {POKEMON_DB.starters.map(s => (
              <button key={s.id} onClick={() => selectStarter(s)} className="bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 hover:-translate-y-2 transition-all border border-slate-600 flex flex-col items-center w-36 shadow-xl group">
                <div className="relative w-20 h-20 mb-2">
                  <img src={s.img} className="w-full h-full object-contain pixelated group-hover:scale-125 transition-transform duration-300 drop-shadow-lg" />
                </div>
                <p className="font-black uppercase text-xs text-slate-300 group-hover:text-yellow-400 transition-colors">{s.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
          <div className="relative bg-slate-800 p-2 rounded-xl border-4 border-slate-700 shadow-2xl overflow-hidden scale-95 sm:scale-100 ring-4 ring-black/20">
            <div id="game-map">
              {MAP_DATA.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <div key={`${x}-${y}`} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative ${cell === 1 ? 'grass-tile' : cell === 2 ? 'wall-tile' : cell === 3 ? 'heal-tile' : 'path-tile'}`}>
                      {cell === 3 && <span className="text-lg drop-shadow-md animate-pulse">❤️</span>}
                      {pos.x === x && pos.y === y && (
                        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 transition-all duration-200">
                          <div className="w-full h-1/2 bg-white rounded-t-full opacity-30"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:hidden relative z-10">
            <div></div>
            <button className="d-pad-btn" onClick={() => move(0, -1)}>▲</button>
            <div></div>
            <button className="d-pad-btn" onClick={() => move(-1, 0)}>◀</button>
            <button className="d-pad-btn" onClick={() => move(0, 1)}>▼</button>
            <button className="d-pad-btn" onClick={() => move(1, 0)}>▶</button>
          </div>
          <button onClick={() => setMenuOpen(true)} className="absolute top-6 right-6 z-50 px-4 py-3 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-xl border-b-4 border-yellow-700 shadow-lg font-black text-slate-900 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
            <span className="text-xs tracking-wider">ĐỘI HÌNH</span>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-inner">{playerTeam.length}</span>
          </button>
        </div>
      )}

      {/* VS SCREEN */}
      {gameState === 'vs' && enemy && (
        <div className="fixed inset-0 z-[90] vs-container flex flex-col items-center justify-center">
          <div className="vs-split-bg"></div>
          <div className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-16 z-10 w-full px-4">
            <div className="vs-card-player flex flex-col items-center">
              <div className="w-32 h-32 sm:w-48 sm:h-48 relative drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                <img src={playerTeam[activeIdx].img} className="w-full h-full object-contain pixelated" style={{ transform: 'scaleX(-1)' }} />
              </div>
            </div>
            <div className="vs-text-container relative z-20">
              <h1 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 italic tracking-tighter vs-glitch drop-shadow-xl" style={{ WebkitTextStroke: '2px white' }}>VS</h1>
            </div>
            <div className="vs-card-enemy flex flex-col items-center">
              <div className="w-32 h-32 sm:w-48 sm:h-48 relative drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                <img src={enemy.img} className="w-full h-full object-contain pixelated" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATTLE SCREEN */}
      {gameState === 'battle' && enemy && (
        <div className="fixed inset-0 battle-bg z-[80] flex flex-col">
          <div className={`absolute inset-0 pointer-events-none z-50 ${battleFlash ? 'flash-red' : ''}`}></div>
          <div className="relative w-full flex-1 overflow-hidden">
            {/* ENEMY */}
            <div className="absolute top-12 right-6 sm:right-16 flex flex-col items-end z-20 w-1/2">
              <div className="info-glass p-3 rounded-xl rounded-br-none border-l-4 border-l-red-500 w-full max-w-[220px] mb-2">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="font-bold text-sm uppercase text-slate-800 tracking-tight font-pixel text-[10px]">{enemy.name}</p>
                  <p className="text-[10px] font-black text-slate-500">Lv {enemy.level}</p>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
                  <div className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${(enemy.currentHp/enemy.maxHp)*100 < 20 ? 'bg-red-500' : (enemy.currentHp/enemy.maxHp)*100 < 50 ? 'bg-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${(enemy.currentHp/enemy.maxHp)*100}%` }}></div>
                </div>
                <div className="flex justify-between mt-1"><p className="text-[9px] text-slate-500 font-bold font-mono ml-auto">{enemy.currentHp}/{enemy.maxHp}</p></div>
              </div>
              <div className="w-32 h-32 sm:w-48 sm:h-48 flex flex-col items-center justify-end relative mr-8">
                <img src={enemy.img} className={`w-full h-full object-contain pixelated animate-float-enemy drop-shadow-2xl relative z-10 ${enemy.isLegendary ? 'legendary-glow' : ''} ${enemyShaking ? 'shake' : ''}`} style={{ opacity: enemyFainted ? 0 : 1, transform: enemyFainted ? 'scale(0.1) translateY(50px)' : 'none', transition: 'all 0.6s' }} />
                <div className="shadow-oval"></div>
                <div className={`absolute inset-0 -top-20 flex items-center justify-center z-50 pointer-events-none ${pokeballAnim ? 'ball-animation' : 'hidden'}`}>
                  <svg className={`w-10 h-10 drop-shadow-xl ${pokeballShake ? 'ball-shake' : ''}`} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="white" stroke="#1e293b" strokeWidth="4"/>
                    <path d="M2 50 A 48 48 0 0 1 98 50 L 2 50" fill="#ef4444" stroke="#1e293b" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="14" fill="white" stroke="#1e293b" strokeWidth="5"/>
                    <circle cx="50" cy="50" r="10" fill="white" stroke="#9ca3af" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            </div>
            {/* PLAYER */}
            <div className="absolute bottom-4 left-4 sm:left-12 flex flex-col-reverse items-start z-20 w-1/2">
              <div className="info-glass p-3 rounded-xl rounded-tl-none border-r-4 border-r-blue-500 w-full max-w-[240px] mt-2">
                <div className="flex justify-between items-baseline mb-1">
                  <p className="font-bold text-sm uppercase text-slate-800 tracking-tight font-pixel text-[10px]">{playerTeam[activeIdx].name}</p>
                  <p className="text-[10px] font-black text-blue-600">Lv {playerTeam[activeIdx].level}</p>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 mb-1.5 relative">
                  <div className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100 < 20 ? 'bg-red-500' : (playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100 < 50 ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`} style={{ width: `${(playerTeam[activeIdx].currentHp/playerTeam[activeIdx].maxHp)*100}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                  <span className="font-mono text-slate-600 font-bold">{playerTeam[activeIdx].currentHp}/{playerTeam[activeIdx].maxHp}</span>
                </div>
              </div>
              <div className="w-40 h-40 sm:w-56 sm:h-56 flex flex-col items-center justify-end relative ml-4 mb-2">
                <img src={playerTeam[activeIdx].img} className={`w-full h-full object-contain pixelated animate-float-player drop-shadow-2xl relative z-10 ${playerShaking ? 'shake' : ''}`} />
                <div className="shadow-oval"></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/95 backdrop-blur-md p-4 flex flex-col sm:flex-row gap-4 border-t-2 border-slate-700 h-auto sm:h-[180px] z-[100] shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
            <div ref={logsEndRef} className="flex-1 bg-black/60 p-4 rounded-xl text-white font-mono text-[11px] overflow-y-auto custom-scrollbar border border-white/10 h-28 sm:h-full shadow-inner leading-relaxed">
              {logs.map(l => (
                <div key={l.id} className={`mb-2 border-l-2 border-white/10 pl-2 py-0.5 ${l.type === 'player' ? 'text-blue-300' : l.type === 'enemy' ? 'text-red-300' : l.type === 'system' ? 'text-yellow-300 font-bold' : 'text-slate-300'}`}>
                   <span className="opacity-50 mr-2 text-[9px]">{l.type === 'player' ? '➤' : l.type === 'enemy' ? '⚔' : l.type === 'system' ? '★' : '»'}</span>{l.msg}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-[420px]">
              {mustSwitch ? (
                <button onClick={() => setMenuOpen(true)} className="bg-blue-600 col-span-2 py-4 hover:bg-blue-500 border-b-4 border-blue-800 text-white rounded-lg font-black uppercase text-[11px] active:translate-y-1 active:border-b-0 transition-all shadow-lg">THAY ĐỔI POKÉMON</button>
              ) : battleView === 'main' ? (
                <>
                  <button onClick={() => setBattleView('moves')} className="bg-rose-600 border-b-4 border-rose-800 hover:bg-rose-500 text-white rounded-lg font-black uppercase text-[11px] py-3 active:translate-y-1 active:border-b-0 transition-all shadow-lg">CHIẾN ĐẤU</button>
                  <button onClick={throwBall} className="bg-amber-500 border-b-4 border-amber-700 hover:bg-amber-400 text-white rounded-lg font-black uppercase text-[11px] py-3 active:translate-y-1 active:border-b-0 transition-all shadow-lg">TÚI ĐỒ</button>
                  <button onClick={() => setMenuOpen(true)} className="bg-indigo-500 border-b-4 border-indigo-700 hover:bg-indigo-400 text-white rounded-lg font-black uppercase text-[11px] py-3 active:translate-y-1 active:border-b-0 transition-all shadow-lg">ĐỔI POKÉMON</button>
                  <button onClick={tryRunAway} className="bg-slate-600 border-b-4 border-slate-800 hover:bg-slate-500 text-white rounded-lg font-black uppercase text-[11px] py-3 active:translate-y-1 active:border-b-0 transition-all shadow-lg">BỎ CHẠY</button>
                </>
              ) : (
                <>
                  {playerTeam[activeIdx].moves.map(m => (
                    <button key={m.name} onClick={() => useMove(m)} className={`${moveBorderClass(m.type)} text-white rounded-lg font-black uppercase text-[10px] py-3 active:translate-y-1 active:border-b-0 transition-all shadow-lg text-left pl-3`}>{m.name}</button>
                  ))}
                  <button onClick={() => setBattleView('main')} className="bg-slate-600 col-span-2 text-[9px] h-8 hover:bg-slate-500 text-white rounded-lg font-black uppercase active:translate-y-1 transition-all shadow-lg">QUAY LẠI</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEAM MENU OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl text-white p-6 z-[200] flex flex-col items-center">
          <div className="flex justify-between items-center mb-8 w-full max-w-xl border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">ĐỘI HÌNH CỦA BẠN</h2>
            {!mustSwitch && <button onClick={() => setMenuOpen(false)} className="bg-slate-800 text-slate-400 hover:text-white w-10 h-10 rounded-full font-black hover:bg-slate-700 shadow-lg flex items-center justify-center border border-white/10">✕</button>}
          </div>
          <div className="grid gap-4 w-full max-w-xl overflow-y-auto custom-scrollbar pr-2 flex-1 pb-10">
            {playerTeam.map((p, i) => {
              const isAce = i === 0;
              const isFainted = p.currentHp <= 0;
              const isCurrentlyInBattle = i === activeIdx && gameState === 'battle';
              return (
                <div key={p.uid} onClick={() => {
                  if (gameState === 'battle') {
                    if (isFainted || isCurrentlyInBattle) return;
                    setActiveIdx(i);
                    setMustSwitch(false);
                    setBattleView('main');
                    addLog(`Cố lên nhé, ${p.name}!`, 'player');
                    setMenuOpen(false);
                  } else {
                    if (isAce) return;
                    const next = [...playerTeam];
                    const selected = next.splice(i, 1)[0];
                    next.unshift(selected);
                    setPlayerTeam(next);
                  }
                }} className={`bg-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer relative group border ${isAce ? 'ace-border border-yellow-500' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-750'} ${isFainted ? 'opacity-40 grayscale' : ''}`}>
                  {isAce && <div className="ace-tag">ACE</div>}
                  <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                    <img src={p.img} className="w-12 h-12 object-contain pixelated group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-black uppercase ${isAce ? 'text-yellow-400' : 'text-slate-100'} text-xs`}>{p.name} <span className="text-[9px] text-slate-500">LV {p.level}</span></p>
                    <div className="h-2 bg-slate-900 rounded-full mt-2 overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
