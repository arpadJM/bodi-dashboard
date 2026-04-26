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
  updateDoc, addDoc
} from 'firebase/firestore';
import { 
  Lock, LogOut, Plus, Calendar, User, CheckCircle2, Mail, Key 
} from 'lucide-react';

// --- FIREBASE KONFIGURÁCIÓ (Beégetve a biztos működéshez) ---
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
const customAppId = 'dashboardtome';

const CATEGORIES = [
  "Iskolai admin", "Cselló tanszak", "Zenekar", "Vándortalálkozó",
  "Zeneszerzés", "Tanulás", "Digitális feladatok", "Pénzügyek", "Személyes"
];

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "", date: "", category: CATEGORIES[0], completed: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const tasksRef = collection(db, 'artifacts', customAppId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Sikertelen belépés. Ellenőrizd az e-mail címet és jelszót!");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !user) return;
    try {
      await addDoc(collection(db, 'artifacts', customAppId, 'public', 'data', 'tasks'), newTask);
      setNewTask({ ...newTask, title: "" });
    } catch (err) {
      console.error("Hiba a hozzáadásnál:", err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await updateDoc(doc(db, 'artifacts', customAppId, 'public', 'data', 'tasks', task.id), { 
        completed: !task.completed 
      });
    } catch (err) {
      console.error("Hiba a frissítésnél:", err);
    }
  };

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold uppercase tracking-widest">
      Betöltés...
    </div>
  );

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-200">
              <Lock className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-800 mb-8 uppercase tracking-tighter italic">Bodi Dashboard</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition" size={20} />
              <input 
                type="email" placeholder="E-mail cím" required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-4 text-slate-300 group-focus-within:text-indigo-500 transition" size={20} />
              <input 
                type="password" placeholder="Jelszó" required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {loginError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{loginError}</p>}
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg">Belépés</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">Á</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Üdvözöllek</p>
              <p className="font-black text-slate-800 uppercase italic">Árpád</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20}/>
          </button>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-10 border border-white">
           <form onSubmit={handleAddTask} className="flex flex-wrap gap-4">
              <input 
                type="text" placeholder="Mi a következő feladat?" required
                className="flex-1 p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
              <select 
                className="p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Hozzáadás
              </button>
           </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map(cat => (
            <div key={cat} className="bg-white/40 p-6 rounded-[2.5rem] border border-white/60 backdrop-blur-sm">
              <h3 className="text-[11px] font-black uppercase text-slate-400 mb-6 tracking-[0.2em] px-2">{cat}</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.category === cat).map(t => (
                  <div key={t.id} className={`group bg-white p-5 rounded-3xl shadow-sm flex justify-between items-center transition-all hover:shadow-md border border-transparent hover:border-indigo-100 ${t.completed ? 'opacity-40 grayscale' : ''}`}>
                    <span className={`text-sm font-bold text-slate-700 ${t.completed ? 'line-through' : ''}`}>{t.title}</span>
                    <button onClick={() => toggleComplete(t)} className={`transition-colors ${t.completed ? 'text-green-500' : 'text-slate-200 group-hover:text-indigo-400'}`}>
                      <CheckCircle2 size={24} fill={t.completed ? "currentColor" : "none"} />
                    </button>
                  </div>
                ))}
                {tasks.filter(t => t.category === cat).length === 0 && (
                  <p className="text-[10px] text-slate-300 italic text-center py-4">Nincs feladat ebben a kategóriában.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
