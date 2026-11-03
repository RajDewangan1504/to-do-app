import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import editIcon from './assets/edit_icon.svg';
import trashIcon from './assets/trash-2.svg';
import searchIcon from './assets/search.svg';
import timeIcon from './assets/time.svg';
import calendarIcon from './assets/calander.svg';
import arrowLeftIcon from './assets/arrow-left.svg';
import rightIcon from './assets/right.svg';
import closeIcon from './assets/close.svg';
import unionIcon from './assets/Union.svg';
import circleIcon from './assets/circle.svg';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const today = new Date();
const isoDate = (date) => { const d = new Date(date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const inputDate = (date = Date.now()) => { const d = new Date(date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const format = (value, options) => new Intl.DateTimeFormat('en-US', options).format(new Date(value));
const formatTime = (value) => format(value, { hour: 'numeric', minute: '2-digit' });

function SearchIcon() { return <img className="search-icon" src={searchIcon} alt="" aria-hidden="true" />; }
function Check({ checked, onClick }) { return <button className={`check-box ${checked ? 'checked' : ''}`} onClick={onClick} aria-label="Toggle task">{checked && <img src={rightIcon} alt="" />}</button>; }

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return <div className={`task-item ${task.status === 'completed' ? 'complete' : ''}`}>
    <Check checked={task.status === 'completed'} onClick={() => onToggle(task)} />
    <div className="task-text" onClick={() => onEdit(task)}><div>{task.title}</div><small>{format(task.dueAt, { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTime(task.dueAt)}</small></div>
    <button className="row-icon delete-icon" onClick={() => onDelete(task)} aria-label="Delete task"><img src={trashIcon} alt="" /></button>
    <button className="row-icon edit-icon" onClick={() => onEdit(task)} aria-label="Edit task"><img className="edit-svg" src={editIcon} alt="" /></button>
  </div>;
}

function TaskModal({ task, defaultDueAt, onClose, onSave }) {
  const [form, setForm] = useState(task ? { ...task, startTime: task.startTime || task.dueAt.slice(11, 16), endTime: task.endTime || task.dueAt.slice(11, 16) } : { title: '', description: '', dueAt: defaultDueAt || inputDate(), startTime: '09:00', endTime: '10:00', priority: 'medium', status: 'in-progress' });
  const startRef = useRef(null); const endRef = useRef(null); const dateRef = useRef(null);
  const openPicker = (ref) => { if (ref.current?.showPicker) ref.current.showPicker(); else ref.current?.click(); };
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  return <div className="modal-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="task-modal">
    <div className="modal-title"><h2>{task ? 'Edit Task' : 'Add New Task'}</h2><button type="button" className="close-button" onClick={onClose} aria-label="Close task form">×</button></div>
    <label>Task title<input autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Doing Homework" /></label>
    <label className="picker-label">Set Time</label><div className="time-picker-row"><label className="picker-box" onClick={() => openPicker(startRef)}><img src={timeIcon} alt="" /><span>{form.startTime || 'Start'}</span><input ref={startRef} type="time" aria-label="Start time" value={form.startTime || ''} onChange={(e) => { set('startTime', e.target.value); set('dueAt', `${form.dueAt.slice(0, 10)}T${e.target.value}`); }} /></label><label className="picker-box" onClick={() => openPicker(endRef)}><img src={timeIcon} alt="" /><span>{form.endTime || 'Ends'}</span><input ref={endRef} type="time" aria-label="End time" value={form.endTime || ''} onChange={(e) => set('endTime', e.target.value)} /></label></div>
    <label className="picker-label">Set Date<div className="date-picker" onClick={() => openPicker(dateRef)}><span>{format(form.dueAt, { weekday: 'long', day: 'numeric', month: 'long' })}</span><img src={calendarIcon} alt="" /><input ref={dateRef} type="date" aria-label="Task date" value={form.dueAt.slice(0, 10)} onChange={(e) => set('dueAt', `${e.target.value}T${form.dueAt.slice(11, 16)}`)} /></div></label>
    <label>Description<textarea rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Add Description" /></label>
    <label className={`priority-label ${task ? '' : 'create-priority-hidden'}`}>Priority<div className="priority-buttons">{['low', 'medium', 'high'].map((priority) => <button className={form.priority === priority ? 'selected' : ''} key={priority} onClick={() => set('priority', priority)} type="button">{priority}</button>)}</div></label>
    {task && <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></label>}
    <button className="blue-button" disabled={!form.title.trim()} onClick={() => onSave(form)}>{task ? 'Save changes' : 'Create task'}</button>
  </section></div>;
}

function Onboarding({ onStart }) { return <main className="onboarding min-h-screen bg-canvas flex justify-center font-sans"><section className="onboarding-card shadow-sm"><div className="blue-art"><img className="circle-art" src={circleIcon} alt="" /><img className="zigzag top" src={unionIcon} alt="" /><img className="zigzag bottom" src={unionIcon} alt="" /></div><div className="onboarding-copy"><h1>Manage What To Do</h1><p>The best way to manage what you have to do,<br />don't forget your plans</p><button className="blue-button transition-colors hover:bg-[#3d5de4]" onClick={onStart}>Get Started</button></div></section></main>; }

function Home({ tasks, selectedDate, setSelectedDate, onAdd, onSearch, onToggle, onEdit, onDelete }) {
  const selectedTasks = tasks.filter((task) => isoDate(task.dueAt) === selectedDate);
  const done = selectedTasks.filter((task) => task.status === 'completed').length;
  const progress = selectedTasks.length ? Math.round((done / selectedTasks.length) * 100) : 0;
  const weekDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setDate(today.getDate() - (today.getDay() || 7) + 1 + index); return date; });
  return <main className="app-screen min-h-screen bg-canvas flex justify-center font-sans"><section className="home-panel shadow-sm">
    <div className="search-bar" onClick={onSearch}><span>Search for a task</span><SearchIcon /></div>
    <div className="week-days">{weekDays.map((day) => <button type="button" className={isoDate(day) === selectedDate ? 'today' : ''} onClick={() => setSelectedDate(isoDate(day))} key={day.toISOString()}><small>{format(day, { weekday: 'short' })}</small><span>{format(day, { day: '2-digit' })}</span></button>)}</div>
    <div className="summary-cards"><div className="summary-card complete-card"><span className="summary-check"><img src={rightIcon} alt="" /></span><span>Task Complete</span><b>{String(done || 0).padStart(2, '0')}</b><small>This Week</small></div><div className="summary-card pending-card"><span className="summary-check"><img src={closeIcon} alt="" /></span><span>Task Pending</span><b>{String(selectedTasks.length - done).padStart(2, '0')}</b><small>This Week</small></div></div>
    <h2 className="section-title">Weekly Progress</h2><div className="progress"><span style={{ width: `${progress || 12}%` }} /></div>
    <div className="task-heading"><h2 className="section-title">Tasks Today</h2><button onClick={onSearch}>View All</button></div>
    <div className="task-list">{selectedTasks.length ? selectedTasks.slice().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)).map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />) : <div className="no-tasks">No tasks on this day. Tap + to add one.</div>}</div>
    <button className="floating-add" onClick={onAdd}>+</button>
  </section></main>;
}

function SearchView({ tasks, query, setQuery, onBack, onToggle, onEdit, onDelete }) { const results = useMemo(() => tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase())), [tasks, query]); return <main className="app-screen min-h-screen bg-canvas flex justify-center font-sans"><section className="search-panel shadow-sm"><button className="back" onClick={onBack} aria-label="Go back"><img src={arrowLeftIcon} alt="" /></button><div className="search-bar active"><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Finish" /><SearchIcon /></div><div className="search-results">{results.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}{!results.length && <div className="no-tasks">No matching tasks</div>}</div><button className="done-search" onClick={onBack}>Done</button></section></main>; }

function App() {
  const [started, setStarted] = useState(false); const [screen, setScreen] = useState('home'); const [tasks, setTasks] = useState([]); const [modal, setModal] = useState(null); const [query, setQuery] = useState(''); const [selectedDate, setSelectedDate] = useState(isoDate(today)); const [toast, setToast] = useState('');
  const refresh = () => fetch(`${API}/tasks`).then((response) => response.json()).then(setTasks);
  useEffect(() => { refresh().catch(() => setToast('Start the backend on port 3000 to load tasks.')); }, []);
  const mutate = async (url, options, message) => { const response = await fetch(`${API}${url}`, { headers: { 'Content-Type': 'application/json' }, ...options }); if (!response.ok) return setToast('Something went wrong'); await refresh(); setModal(null); setToast(message); setTimeout(() => setToast(''), 2200); };
  const save = (form) => mutate(form.id ? `/tasks/${form.id}` : '/tasks', { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(form) }, form.id ? 'Task updated' : 'Task created');
  const toggle = (task) => mutate(`/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ ...task, status: task.status === 'completed' ? 'in-progress' : 'completed' }) }, task.status === 'completed' ? 'Task reopened' : 'Task completed');
  const remove = (task) => { if (window.confirm(`Delete “${task.title}”?`)) mutate(`/tasks/${task.id}`, { method: 'DELETE' }, 'Task deleted'); };
  if (!started) return <Onboarding onStart={() => setStarted(true)} />;
  return <>{screen === 'home' ? <Home tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAdd={() => setModal('new')} onSearch={() => setScreen('search')} onToggle={toggle} onEdit={setModal} onDelete={remove} /> : <SearchView tasks={tasks} query={query} setQuery={setQuery} onBack={() => setScreen('home')} onToggle={toggle} onEdit={setModal} onDelete={remove} />}{modal && <TaskModal task={modal === 'new' ? null : modal} defaultDueAt={`${selectedDate}T09:00`} onClose={() => setModal(null)} onSave={save} />}{toast && <div className="toast">{toast}</div>}</>;
}

createRoot(document.getElementById('root')).render(<App />);
