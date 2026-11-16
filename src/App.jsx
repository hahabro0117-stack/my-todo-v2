import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDLvTOjmtzBYIoCWonakdco5SNOp7HKcmc",
  authDomain: "my-todo-ee761.firebaseapp.com",
  projectId: "my-todo-ee761",
  storageBucket: "my-todo-ee761.firebasestorage.app",
  messagingSenderId: "1069396099334",
  appId: "1:1069396099334:web:6f03863cda750e23c6de87",
  measurementId: "G-3802ZQEF3S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('보통');
  const [dueDate, setDueDate] = useState('');

  const fetchTodos = async () => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    setTodos(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    await addDoc(collection(db, "todos"), {
      task, priority, dueDate, completed: false, createdAt: new Date().getTime()
    });
    setTask(''); setDueDate(''); fetchTodos();
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id)); fetchTodos();
  };

  const toggleComplete = async (id, currentStatus) => {
    await updateDoc(doc(db, "todos", id), { completed: !currentStatus }); fetchTodos();
  };

  const calculateDday = (dateString) => {
    if (!dateString) return '';
    const diffDays = Math.ceil((new Date(dateString) - new Date().setHours(0,0,0,0)) / 86400000);
    return diffDays === 0 ? 'D-Day' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">나만의 일정관리</h1>
        <form onSubmit={addTodo} className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8 flex flex-col md:flex-row gap-3">
          <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="새 일정을 입력하세요" className="flex-1 bg-slate-800 px-4 py-3 rounded-lg text-white" />
          <div className="flex gap-3">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-slate-800 px-3 py-3 rounded-lg text-white">
              <option value="긴급">긴급</option><option value="보통">보통</option><option value="여유">여유</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-slate-800 px-3 py-3 rounded-lg text-white" />
            <button type="submit" className="bg-blue-600 px-6 py-3 rounded-lg text-white font-bold">추가</button>
          </div>
        </form>
        <div className="space-y-3">
          {todos.map(todo => (
            <div key={todo.id} className="flex justify-between p-4 bg-slate-900 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleComplete(todo.id, todo.completed)}>
                  {todo.completed ? <CheckCircle className="text-blue-500" /> : <Circle />}
                </button>
                <span className="text-blue-400 font-bold">{todo.priority}</span>
                <span className={todo.completed ? 'line-through text-slate-500' : ''}>{todo.task}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-red-400">{calculateDday(todo.dueDate)}</span>
                <button onClick={() => deleteTodo(todo.id)}><Trash2 size={20} className="text-slate-500 hover:text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
