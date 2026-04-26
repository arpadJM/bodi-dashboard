import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { LogOut, CheckCircle2 } from 'lucide-react';

// --- ABSZOLÚT PONTOS FIREBASE KONFIGURÁCIÓ ---
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
    const tasksRef = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Firestore hiba:", err));
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Hiba: Ellenőrizd az adatokat!");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), newTask);
    setNewTask({ ...newTask, title: "" });
  };

  const toggleTask = async (task) => {
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id);
    await updateDoc(ref, { completed: !task.completed });
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold">BETÖLTÉS...</div>;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-200">
          <h2 className="text-2xl font-black text-center mb-6 text-slate-800 uppercase italic">Bodi Dashboard</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Jelszó" 
              className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition">Belépés</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm">
          <h1 className="text-xl font-black italic uppercase text-slate-800">Szia, Árpád!</h1>
          <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500 transition"><LogOut /></button>
        </div>

        <form onSubmit={addTask} className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl shadow-md">
          <input 
            type="text" 
            placeholder="Új feladat..." 
            className="p-3 bg-slate-50 rounded-xl outline-none" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
          />
          <select 
            className="p-3 bg-slate-50 rounded-xl outline-none" 
            value={newTask.category} 
            onChange={e => setNewTask({...newTask, category: e.target.value})}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="bg-indigo-600 text-white rounded-xl font-bold uppercase py-3 text-sm">Hozzáadás</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(cat => (
            <div key={cat} className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{cat}</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.category === cat).map(t => (
                  <div key={t.id} className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border-l-4 border-indigo-500 ${t.completed ? 'opacity-40' : ''}`}>
                    <span className={`text-sm font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</span>
                    <button onClick={() => toggleTask(t)} className={t.completed ? 'text-green-500' : 'text-slate-200'}><CheckCircle2 /></button>
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
