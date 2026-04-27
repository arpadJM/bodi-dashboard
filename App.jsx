import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, collection, onSnapshot, 
  updateDoc, addDoc, deleteDoc, query
} from 'firebase/firestore';
import { 
  Lock, LogOut, CheckCircle2, Trash2, LayoutDashboard, PlusCircle, 
  Calendar, Music, School, Users, Briefcase, Zap, TrendingUp, Heart, ChevronRight
} from 'lucide-react';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyB2QBRQfHJwv1MJHYqGcljxXxaQx5viHqM",
  authDomain: "dashboardtome.firebaseapp.com",
  projectId: "dashboardtome",
  storageBucket: "dashboardtome.firebasestorage.app",
  messagingSenderId: "927951871184",
  appId: "1:927951871184:web:ffc225ba9047fcc9f552d5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'dashboardtome';

// Stratégiai terv szerinti kategóriák
const CATEGORIES = [
  { id: "Iskolai admin", icon: <School size={16} />, color: "border-blue-500", bg: "bg-blue-50" },
  { id: "Cselló tanszak", icon: <Music size={16} />, color: "border-purple-500", bg: "bg-purple-50" },
  { id: "Zenekar", icon: <Users size={16} />, color: "border-indigo-500", bg: "bg-indigo-50" },
  { id: "Vándortalálkozó", icon: <Zap size={16} />, color: "border-amber-500", bg: "bg-amber-50" },
  { id: "Zeneszerzés", icon: <Heart size={16} />, color: "border-pink-500", bg: "bg-pink-50" },
  { id: "Tanulás", icon: <Briefcase size={16} />, color: "border-emerald-500", bg: "bg-emerald-50" },
  { id: "Digitális feladatok", icon: <LayoutDashboard size={16} />, color: "border-cyan-500", bg: "bg-cyan-50" },
  { id: "Pénzügyek", icon: <TrendingUp size={16} />, color: "border-red-500", bg: "bg-red-50" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Figyelem: Itt a 'tasks' gyűjteményt figyeljük a public/data útvonalon
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(list);
      },
      (err) => console.error("Firestore error:", err)
    );
    return () => unsubscribe();
  }, [user]);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Hiba a belépésnél. Kérlek ellenőrizd az adatokat!");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
        title: newTaskTitle,
        category: selectedCat,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setNewTaskTitle("");
    } catch (err) {
      console.error("Hiba a mentésnél:", err);
    }
  };

  const toggleTask = async (task) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id), {
      completed: !task.completed
    });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-indigo-500/20 shadow-2xl">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2 italic tracking-tighter uppercase">Bodi Workspace</h1>
          <p className="text-center text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Secured Dashboard</p>
          <form onSubmit={login} className="space-y-4">
            <input 
              type="email" placeholder="Email cím" className="w-full p-5 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold border border-white/10 text-white"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Jelszó" className="w-full p-5 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold border border-white/10 text-white"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-2xl text-xs font-bold text-center border border-red-500/30 tracking-tight">{error}</div>}
            <button className="w-full p-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl active:scale-95">Rendszer Indítása</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60 gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-slate-900 p-4 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <LayoutDashboard className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Vezérlőpult</h1>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">
                <Calendar size={12} />
                {new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden lg:block text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Felhasználó</p>
                <p className="text-sm font-black text-slate-700 italic">{user.email}</p>
             </div>
             <button onClick={() => signOut(auth)} className="group flex items-center gap-3 px-8 py-4 bg-slate-100 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-red-600 hover:bg-red-50 transition-all">
               <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Kilépés
             </button>
          </div>
        </header>

        {/* INPUT SECTION */}
        <section className="bg-white p-8 rounded-[3.5rem] shadow-sm mb-12 border border-slate-200/60">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Új feladat rögzítése</h2>
          </div>
          <form onSubmit={addTask} className="flex flex-wrap gap-5">
            <input 
              type="text" placeholder="Mi a teendő?" className="flex-1 min-w-[300px] p-6 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold border-none text-slate-700 shadow-inner text-lg"
              value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
            />
            <div className="flex items-center bg-slate-50 rounded-2xl p-2 shadow-inner min-w-[240px]">
              <div className="pl-4 text-indigo-400">
                 {CATEGORIES.find(c => c.id === selectedCat)?.icon}
              </div>
              <select 
                className="flex-1 p-4 bg-transparent outline-none font-black text-[11px] uppercase tracking-wider text-slate-500 cursor-pointer"
                value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
            </div>
            <button className="px-12 py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3">
              Hozzáadás <ChevronRight size={16} />
            </button>
          </form>
        </section>

        {/* KANBAN BOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-5 px-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-xl bg-white shadow-sm border ${cat.color.replace('border-', 'text-')}`}>
                      {cat.icon}
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-tighter text-slate-800 italic">{cat.id}</h3>
                </div>
                <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">
                  {tasks.filter(t => t.category === cat.id && !t.completed).length}
                </span>
              </div>
              
              <div className={`flex-1 rounded-[3rem] p-5 space-y-4 overflow-y-auto custom-scrollbar transition-colors ${cat.bg} border-2 border-dashed border-white`}>
                {tasks.filter(t => t.category === cat.id).length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-50">Nincs feladat</p>
                  </div>
                )}
                {tasks
                  .filter(t => t.category === cat.id)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(t => (
                  <div key={t.id} className={`group bg-white p-5 rounded-3xl shadow-sm border-l-8 ${cat.color} flex items-start justify-between transition-all hover:translate-y-[-2px] hover:shadow-md ${t.completed ? 'opacity-40' : ''}`}>
                    <div className="flex flex-col gap-1 pr-3">
                      <span className={`text-[14px] font-bold leading-snug ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {t.title}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => toggleTask(t)} className={`transition-all ${t.completed ? 'text-green-500' : 'text-slate-200 hover:text-indigo-500'}`}>
                        <CheckCircle2 size={24} strokeWidth={3} />
                      </button>
                      <button onClick={() => deleteTask(t.id)} className="text-slate-100 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
