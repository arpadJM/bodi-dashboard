import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, 
  updateDoc, deleteDoc, addDoc, query, getDocs, writeBatch 
} from 'firebase/firestore';
import { 
  Lock, LogOut, ChevronDown, ChevronUp, Edit3, Trash2, Plus, 
  Sparkles, Send, Calendar, AlertCircle, User, Music, BookOpen, 
  Laptop, Wallet, CheckCircle2, GripVertical, RefreshCw, Mail, Key 
} from 'lucide-react';

// --- FIREBASE KONFIGURÁCIÓ ---
// Ezeket a környezet automatikusan kitölti a Vercel-en keresztül
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bodi-dashboard-app';

const CATEGORIES = [
  "Iskolai admin", "Cselló tanszak", "Zenekar", "Vándortalálkozó",
  "Zeneszerzés és művész projektek", "Tanulás", "Digitális feladatok", "Pénzügyek", "Személyes"
];

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropTargetCategory, setDropTargetCategory] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "", date: "", priority: 2, category: CATEGORIES[0], details: "", completed: false
  });

  // Bejelentkezési állapot figyelése
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Adatok betöltése Firestore-ból (csak ha be van jelentkezve)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore hiba:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Helytelen e-mail cím vagy jelszó.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), newTask);
    setNewTask({ title: "", date: "", priority: 2, category: CATEGORIES[0], details: "", completed: false });
  };

  const toggleComplete = async (task) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id), { completed: !task.completed });
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId), { category: targetCategory });
    }
    setDropTargetCategory(null);
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black italic">ELLENŐRZÉS...</div>;

  // 1. BEJELENTKEZŐ FELÜLET
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg">
              <Lock className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Bodi Dashboard</h2>
          <p className="text-center text-slate-400 text-sm mb-8 italic">Privát munkaterület</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="email" placeholder="E-mail cím" required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="password" placeholder="Jelszó" required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{loginError}</p>}
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition">
              BEJELENTKEZÉS
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD FELÜLET
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans">
      <div className="max-w-[1800px] mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm"><User className="text-indigo-600" size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase italic">Szia, {user.email?.split('@')[0]}!</h1>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Minden adat szinkronizálva</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-white text-slate-500 rounded-2xl text-[10px] font-black hover:text-red-500 transition shadow-sm border border-slate-100 uppercase tracking-widest">
            <LogOut size={16} /> Kijelentkezés
          </button>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl mb-10 border border-white">
          <h2 className="text-2xl font-black text-slate-800 mb-6 italic uppercase tracking-tighter">Új felvétel</h2>
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-[2rem]">
            <input 
              type="text" placeholder="Feladat megnevezése..." 
              className="md:col-span-1 p-3 rounded-xl bg-white text-sm font-bold outline-none border-none" 
              value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} 
            />
            <select className="p-3 rounded-xl bg-white text-sm font-bold outline-none border-none" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className="p-3 rounded-xl bg-white text-sm font-bold outline-none border-none" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} />
            <button type="submit" className="bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition">Rögzítés</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <div 
              key={cat} 
              onDragOver={e => { e.preventDefault(); setDropTargetCategory(cat); }}
              onDrop={e => handleDrop(e, cat)}
              onDragLeave={() => setDropTargetCategory(null)}
              className={`p-6 rounded-[2.5rem] min-h-[350px] transition-all border-2 ${dropTargetCategory === cat ? 'bg-indigo-100 border-indigo-400 border-dashed' : 'bg-white/40 border-transparent'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{cat}</h3>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-slate-400">
                  {tasks.filter(t => t.category === cat && !t.completed).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter(t => t.category === cat).map(t => (
                  <div 
                    key={t.id} 
                    draggable 
                    onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
                    className={`bg-white p-5 rounded-[1.8rem] shadow-sm border-l-[6px] border-indigo-500 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${t.completed ? 'opacity-30 grayscale scale-95' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                        <p className={`text-sm font-bold leading-tight ${t.completed ? 'line-through' : 'text-slate-800'}`}>{t.title}</p>
                        <button onClick={() => toggleComplete(t)} className={t.completed ? 'text-green-500' : 'text-slate-200 hover:text-indigo-400'}>
                            <CheckCircle2 size={20}/>
                        </button>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-slate-300 font-black italic">
                        <Calendar size={12}/>
                        <span className="text-[9px] uppercase tracking-wider">{t.date || 'Dátum nélkül'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
