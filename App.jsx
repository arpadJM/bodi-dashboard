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
  Lock, LogOut, CheckCircle2, Mail, Key, Trash2, Clock, Calendar as CalIcon
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

const CATEGORIES = [
  "Iskolai admin", "Cselló tanszak", "Zenekar", "Vándortalálkozó",
  "Zeneszerzés", "Tanulás", "Digitális feladatok", "Pénzügyek", "Személyes"
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);

  // Auth figyelő
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Adatok figyelője
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(list);
      },
      (err) => console.error("Firestore hiba:", err)
    );
    return () => unsubscribe();
  }, [user]);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Hibás adatok!");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
      title: newTaskTitle,
      category: selectedCat,
      completed: false,
      createdAt: new Date().toISOString()
    });
    setNewTaskTitle("");
  };

  const toggleTask = async (task) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id), {
      completed: !task.completed
    });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id));
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">BETÖLTÉS...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <Lock className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-center text-slate-800 mb-8 uppercase italic tracking-tight">Bodi Dashboard</h1>
          <form onSubmit={login} className="space-y-4">
            <input 
              type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Jelszó" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            <button className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">Belépés</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-black uppercase italic">Dashboard</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('hu-HU')}</p>
          </div>
          <button onClick={() => signOut(auth)} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <section className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 border border-slate-100">
          <form onSubmit={addTask} className="flex flex-wrap gap-4">
            <input 
              type="text" placeholder="Új feladat..." className="flex-1 min-w-[200px] p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
            />
            <select 
              className="p-4 bg-slate-50 rounded-xl outline-none font-bold"
              value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-50">Hozzáadás</button>
          </form>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat} className="bg-slate-100/50 p-6 rounded-[2rem] border border-white">
              <h2 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest px-2">{cat}</h2>
              <div className="space-y-3">
                {tasks.filter(t => t.category === cat).map(t => (
                  <div key={t.id} className={`group bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between transition-all ${t.completed ? 'opacity-40' : ''}`}>
                    <span className={`text-sm font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleTask(t)} className={t.completed ? 'text-green-500' : 'text-slate-200 hover:text-indigo-500'}>
                        <CheckCircle2 size={20} />
                      </button>
                      <button onClick={() => deleteTask(t.id)} className="text-slate-100 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
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
