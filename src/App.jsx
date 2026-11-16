import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Trash2, Edit2, CheckCircle, Circle, Bot } from 'lucide-react';

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
  const [category, setCategory] = useState('업무');
  const [dueDate, setDueDate] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');

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
      task, category, dueDate, completed: false, createdAt: new Date().getTime()
    });
    setTask(''); setDueDate(''); fetchTodos();
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id)); fetchTodos();
  };

  const toggleComplete = async (id, currentStatus) => {
    await updateDoc(doc(db, "todos", id), { completed: !currentStatus }); fetchTodos();
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.task);
    setEditDate(todo.dueDate || '');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, "todos", id), {
      task: editText,
      dueDate: editDate
    });
    setEditingId(null);
    fetchTodos();
  };

  const calculateDday = (dateString) => {
    if (!dateString) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  const totalCount = todos.length;
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = totalCount - activeCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 p-3 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* 상단 타이틀 */}
        <div className="bg-[#111827] border border-slate-800 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide">Executive Task Intelligence</h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Management System</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Live
          </span>
        </div>

        {/* 대시보드 통계 카드 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-[#111827] border border-slate-800 p-3 sm:p-5 rounded-2xl">
            <p className="text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-2">전체 등록 과제</p>
            <p className="text-xl sm:text-3xl font-bold text-blue-400">{totalCount}</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-3 sm:p-5 rounded-2xl">
            <p className="text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-2">미완료 핵심 과제</p>
            <p className="text-xl sm:text-3xl font-bold text-amber-400">{activeCount}</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-3 sm:p-5 rounded-2xl">
            <p className="text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-2">프로젝트 완료율</p>
            <p className="text-xl sm:text-3xl font-bold text-emerald-400">{completionRate}%</p>
          </div>
        </div>

        {/* 신규 업무 일정 할당 */}
        <div className="bg-[#111827] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 sm:mb-4">신규 업무 일정 할당</h2>
          <form onSubmit={addTodo} className="flex flex-col gap-2.5 sm:gap-3">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#1f2937] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1f2937] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="업무">업무</option>
                <option value="기획">기획</option>
                <option value="개발">개발</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="담당 업무 세부 내용을 입력하세요..."
                className="flex-1 bg-[#1f2937] text-white px-4 py-2.5 sm:py-3 rounded-xl border border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 sm:py-3 rounded-xl transition-colors text-xs sm:text-sm shadow-md">
                등록
              </button>
            </div>
          </form>
        </div>

        {/* 진행 중인 업무 목록 */}
        <div className="bg-[#111827] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg space-y-3 sm:space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">진행 중인 업무 목록</h2>
          <div className="space-y-3">
            {todos.map(todo => (
              <div key={todo.id} className="bg-[#1f2937]/50 border border-slate-800 p-3.5 sm:p-4 rounded-xl flex flex-col gap-3">
                
                {editingId === todo.id ? (
                  // 수정 모드
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="bg-slate-900 text-white px-2 py-1.5 rounded text-xs border border-slate-700 w-1/2"
                      />
                    </div>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-slate-900 text-white px-3 py-2 rounded text-sm border border-slate-700 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => saveEdit(todo.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold">저장</button>
                      <button onClick={() => setEditingId(null)} className="bg-slate-700 text-white px-3 py-1.5 rounded text-xs">취소</button>
                    </div>
                  </div>
                ) : (
                  // 일반 표시 모드
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <button onClick={() => toggleComplete(todo.id, todo.completed)} className="text-slate-400 hover:text-blue-400 mt-0.5 shrink-0">
                          {todo.completed ? <CheckCircle className="text-blue-500" size={18} /> : <Circle size={18} />}
                        </button>
                        
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {todo.category}
                          </span>
                          {todo.dueDate && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
                              {todo.dueDate} ({calculateDday(todo.dueDate)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 수정/삭제 버튼 */}
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => startEditing(todo)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                          <Edit2 size={12} /> <span className="hidden sm:inline">수정</span>
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                          <Trash2 size={12} /> <span className="hidden sm:inline">삭제</span>
                        </button>
                      </div>
                    </div>

                    {/* 업무 내용 텍스트 */}
                    <div className="pl-7 pr-1">
                      <span className={`text-xs sm:text-sm break-all block ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {todo.task}
                      </span>
                    </div>
                  </>
                )}

              </div>
            ))}
            {todos.length === 0 && (
              <div className="text-center text-slate-500 py-10 text-xs sm:text-sm">
                등록된 업무 일정이 없습니다. 새로운 일정을 등록해 보세요!
              </div>
            )}
          </div>
        </div>

        {/* 하단 AI 어시스턴트 영역 */}
        <div className="bg-[#111827] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg text-center">
          <button 
            onClick={() => alert("현재 등록된 업무를 바탕으로 AI 실무 우선순위 & 리스크 브리핑 리포트를 생성합니다.")}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Bot size={18} /> AI 실무 우선순위 & 리스크 브리핑 리포트 생성
          </button>
        </div>

      </div>
    </div>
  );
}
