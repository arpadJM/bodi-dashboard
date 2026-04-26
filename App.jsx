import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  updateDoc, 
  addDoc 
} from 'firebase/firestore';
import { 
  Lock, LogOut, Plus, Calendar, User, CheckCircle2, Mail, Key, Layout
} from 'lucide-react';

// --- FIREBASE KONFIGURÁCIÓ ---
const firebaseConfig = {
  apiKey: "AIzaSyB2QBRQfHJwv1MJHYqGcljxXxaQx5viHqM",
  authDomain: "dashboardtome.firebaseapp.com",
  projectId: "dashboardtome",
  storageBucket: "dashboardtome.firebasestorage.app",
  messagingSenderId: "927951871184",
  appId: "1:927951871184:web:ffc225ba9047fcc9f552d5"
};

// Szolgáltatások inicializálása
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'dashboardtome'; // Projekt azonosító a Firestore útvonalhoz

const CATEGORIES = [
  "Iskolai admin", "Cselló tanszak", "Zenekar", "Vándortalálkozó",
  "Zeneszerzés és művész projektek", "Tanulás", "Digitális feladatok", "Pénzügyek", "Személyes"
];

export default function App() {
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

  // Adatok betöltése Firestore-ból (Real-time sync)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Kötelező útvonal struktúra a biztonsági szabályokhoz
    const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
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
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), newTask);
      setNewTask({ title: "", date: "", priority: 2, category: CATEGORIES[0], details: "", completed: false });
    } catch (err) {
      console.error("Mentési hiba:", err);
    }
  };

  const toggleComplete = async (task) => {
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id);
    await updateDoc(taskRef, { completed: !task.completed });
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', taskId);
      await updateDoc(taskRef, { category: targetCategory });
    }
    setDropTargetCategory(null);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Layout className="animate-pulse mb-4" size={48} />
        <p className="font-black italic tracking-widest uppercase">Rendszer töltése...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-200">
              <Lock className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Bodi Dashboard</h2>
          <p className="text-center text-slate-400 text-sm mb-8 italic uppercase tracking-tighter">Privát munkaterület</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="email" placeholder="E-mail" required
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
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-100">
              Belépés
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <User className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight uppercase italic">Szia, Árpád!</h1>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Felhő alapú szinkronizáció aktív</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-white text-slate-500 rounded-2xl text-[10px] font-black hover:text-red-500 transition shadow-sm border border-slate-100 uppercase tracking-widest">
            <LogOut size={16} /> Kijelentkezés
          </button>
        </div>

        {/* ÚJ FELADAT FORM */}
        <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-xl mb-10 border border-white">
          <h2 className="text-xl font-black text-slate-800 mb-6 italic uppercase tracking-tighter flex items-center gap-2">
            <Plus size={20} className="text-indigo-500"/> Új feladat rögzítése
          </h2>
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-[2.5rem]">
            <input 
              type="text" placeholder="Mi a teendő?" 
              className="p-3 rounded-xl bg-white text-sm font-bold outline-none border-none shadow-sm" 
              value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} 
            />
            <select className="p-3 rounded-xl bg-white text-sm font-bold outline-none border-none shadow-sm cursor-pointer" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className="p-3 rounded-xl bg-white text-sm font-bold outline-none border-none shadow-sm" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} />
            <button type="submit" className="bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-md">
              Hozzáadás
            </button>
          </form>
        </div>

        {/* KATEGÓRIA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map(cat => (
            <div 
              key={cat} 
              onDragOver={e => { e.preventDefault(); setDropTargetCategory(cat); }}
              onDrop={e => handleDrop(e, cat)}
              onDragLeave={() => setDropTargetCategory(null)}
              className={`p-6 rounded-[2.8rem] min-h-[350px] transition-all border-2 ${dropTargetCategory === cat ? 'bg-indigo-50 border-indigo-300 border-dashed scale-[1.02]' : 'bg-white/50 border-transparent shadow-sm'}`}
            >
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{cat}</h3>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-indigo-500 border border-slate-50">
                  {tasks.filter(t => t.category === cat && !t.completed).length}
                </span>
              </div>

              <div className="space-y-4">
                {tasks.filter(t => t.category === cat).map(t => (
                  <div 
                    key={t.id} 
                    draggable 
                    onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
                    className={`bg-white p-5 rounded-[2rem] shadow-sm border-l-[6px] border-indigo-500 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:translate-x-1 ${t.completed ? 'opacity-40 grayscale scale-95' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className={`text-sm font-bold leading-tight ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</p>
                        <div className="flex items-center gap-1 mt-3 text-slate-300 font-black italic">
                          <Calendar size={12}/>
                          <span className="text-[9px] uppercase tracking-wider">{t.date || 'Nincs dátum'}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleComplete(t)} className={`transition-colors ${t.completed ? 'text-green-500' : 'text-slate-100 hover:text-indigo-400'}`}>
                        <CheckCircle2 size={24} fill={t.completed ? "currentColor" : "none"}/>
                      </button>
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
}
