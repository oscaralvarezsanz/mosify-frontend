import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, Users, Layers, Award, CheckCircle2, 
  Activity, X, Sparkles, Filter, RefreshCw, AlertCircle, Info,
  Flame, TrendingUp, Calendar, Trash2, Folder, FolderPlus, LogOut, Edit,
  RotateCcw
} from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mosify.onrender.com';

// Type Definitions
interface Board {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  pointsBalance: number;
  alias?: string;
}

interface Category {
  id: string;
  userId: string;
  boardId: string;
  name: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  categoryId: string;
  type: 'SINGLE_USE' | 'RECURRENT';
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  pointsValue: number;
  active: boolean;
}

interface Transaction {
  id: string;
  userId: string;
  taskId?: string | null;
  pointsAffected: number;
  createdAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Seleccionar...', className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-indigo-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer shadow-md"
      >
        <span className={selectedOption && selectedOption.value !== '' ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl py-1.5 backdrop-blur-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-all flex items-center justify-between
                ${option.disabled 
                  ? 'text-zinc-600 cursor-not-allowed bg-transparent' 
                  : option.value === value
                    ? 'bg-indigo-600/15 text-indigo-300 font-bold border-l-4 border-indigo-500 pl-3'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white pl-4'
                }
              `}
            >
              <span>{option.label}</span>
              {option.value === value && !option.disabled && (
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-3 text-xs text-zinc-500 italic text-center">No hay opciones disponibles</div>
          )}
        </div>
      )}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  const threshold = 100; // threshold in pixels to dismiss the toast

  const handleStart = (clientX: number) => {
    if (isDismissing) return;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || startX === null || isDismissing) return;
    const diffX = clientX - startX;
    setCurrentX(diffX);
  };

  const handleEnd = () => {
    if (!isDragging || isDismissing) return;
    setIsDragging(false);
    
    if (Math.abs(currentX) > threshold) {
      setIsDismissing(true);
      setCurrentX(currentX > 0 ? 400 : -400);
      setTimeout(() => {
        onDismiss(toast.id);
      }, 200);
    } else {
      setCurrentX(0);
    }
    setStartX(null);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const onMouseUpOrLeave = () => {
    handleEnd();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  const style: React.CSSProperties = {
    transform: `translateX(${currentX}px)`,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
    opacity: isDismissing ? 0 : 1 - Math.min(Math.abs(currentX) / (threshold * 1.5), 1),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUpOrLeave}
      onMouseLeave={onMouseUpOrLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={style}
      className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 transition-all duration-300 pointer-events-auto select-none max-w-sm w-80 relative overflow-hidden group
        ${toast.type === 'success' ? 'bg-teal-950/85 border-teal-500/30 text-teal-300' : ''}
        ${toast.type === 'error' ? 'bg-red-950/85 border-red-500/30 text-red-300' : ''}
        ${toast.type === 'info' ? 'bg-indigo-950/85 border-indigo-500/30 text-indigo-300' : ''}
      `}
    >
      <div className="absolute right-2 top-1 text-[8px] text-zinc-500/50 group-hover:text-zinc-500 transition-colors pointer-events-none">
        Desliza para cerrar
      </div>
      {toast.type === 'error' ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
      )}
      <span className="text-sm font-medium flex-1 break-words leading-snug">{toast.message}</span>
    </div>
  );
}

export default function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [registerName, setRegisterName] = useState<string>('');
  const [registerUsername, setRegisterUsername] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // App States
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Board & Workspace States
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [showAddBoardModal, setShowAddBoardModal] = useState<boolean>(false);
  const [newBoardName, setNewBoardName] = useState<string>('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAddExistingUserModal, setShowAddExistingUserModal] = useState<boolean>(false);
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>('');
  const [newUserAlias, setNewUserAlias] = useState<string>('');
  const [invitedUserAlias, setInvitedUserAlias] = useState<string>('');

  // Selected States
  const [activeUserId, setActiveUserId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Loading & UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal / Form States
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showEditAliasModal, setShowEditAliasModal] = useState<boolean>(false);
  const [editAliasUserId, setEditAliasUserId] = useState<string>('');
  const [editAliasValue, setEditAliasValue] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New Entity Form Fields
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserUsername, setNewUserUsername] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'SINGLE_USE' | 'RECURRENT'>('SINGLE_USE');
  const [newTaskFrequency, setNewTaskFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | ''>('');
  const [newTaskPoints, setNewTaskPoints] = useState<number | string>(50);
  const [newTaskActionType, setNewTaskActionType] = useState<'EARN' | 'SPEND'>('EARN');

  // Inline category creation states
  const [isCreatingCategoryInline, setIsCreatingCategoryInline] = useState<boolean>(false);
  const [inlineCategoryName, setInlineCategoryName] = useState<string>('');
  const [inlineCategoryDesc, setInlineCategoryDesc] = useState<string>('');

  // Attempt auto-login using the browser's Credential Management API
  const attemptAutoLogin = async () => {
    if (!navigator.credentials) {
      setLoading(false);
      return;
    }
    const loggedOut = localStorage.getItem('loggedOut');
    if (loggedOut === 'true') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const credential = await navigator.credentials.get({ password: true } as any);
      if (credential && 'password' in credential) {
        const username = credential.id;
        const password = (credential as any).password;

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.removeItem('loggedOut');
          setAccessToken(data.accessToken);
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          showToast(`¡Sesión recuperada para ${data.user.name}!`, 'success');
          return;
        }
      }
    } catch (err) {
      console.warn('Auto-login was cancelled or failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom fetch wrapper that appends the Authorization header
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token') || accessToken;
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    } as Record<string, string>;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
      ...options,
      headers
    };

    if (!options.body) {
      delete headers['Content-Type'];
    }

    const res = await fetch(url, finalOptions);

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setAccessToken('');
      setCurrentUser(null);
      showToast('Sesión expirada o no autorizada. Por favor inicia sesión de nuevo.', 'error');
      attemptAutoLogin();
    }

    return res;
  };

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Usuario o contraseña incorrectos');
      }

      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('loggedOut');
      
      setAccessToken(data.accessToken);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      
      setLoginUsername('');
      setLoginPassword('');
      showToast(`¡Bienvenido, ${data.user.name}!`, 'success');

      // Save credentials in browser password manager
      if ('PasswordCredential' in window) {
        const cred = new (window as any).PasswordCredential({
          id: loginUsername,
          password: loginPassword
        });
        navigator.credentials.store(cred).catch(err => {
          console.warn('Error saving credentials to browser manager:', err);
        });
      }
    } catch (err: any) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerUsername.trim() || !registerPassword.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: registerName, 
          username: registerUsername, 
          password: registerPassword 
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al registrar el usuario');
      }

      const createdUser = await res.json();
      showToast(`¡Usuario ${createdUser.name} registrado con éxito! Inicia sesión ahora.`, 'success');
      
      setIsRegisterMode(false);
      setLoginUsername(registerUsername);
      
      setRegisterName('');
      setRegisterUsername('');
      setRegisterPassword('');
      setLoading(false);
    } catch (err: any) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('loggedOut', 'true');
    setIsLoggedIn(false);
    setAccessToken('');
    setCurrentUser(null);
    showToast('Sesión cerrada con éxito', 'info');
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Custom Confirmation Dialog State
  interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  }

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirmation = (title: string, message: string, onConfirm: () => void, isDanger = true) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      isDanger
    });
  };

  // Fetch all data from backend
  // Load data for a specific board
  const loadBoardData = async (boardId: string) => {
    if (!boardId) return;
    try {
      // Fetch board users
      const usersRes = await authFetch(`${API_BASE_URL}/boards/${boardId}/users`);
      if (!usersRes.ok) throw new Error('Error al cargar miembros del tablero');
      const usersData: any[] = await usersRes.json();
      const mappedUsers: User[] = usersData.map((bu: any) => ({
        id: bu.userId,
        name: bu.userName || bu.name,
        pointsBalance: bu.pointsBalance,
        alias: bu.alias
      }));
      setUsers(mappedUsers);

      // Fetch board categories
      const catRes = await authFetch(`${API_BASE_URL}/boards/${boardId}/categories`);
      if (!catRes.ok) throw new Error('Error al cargar categorías');
      const catData: Category[] = await catRes.json();
      setCategories(catData);

      // Fetch board tasks
      const taskRes = await authFetch(`${API_BASE_URL}/boards/${boardId}/tasks`);
      if (!taskRes.ok) throw new Error('Error al cargar tareas');
      const taskData: Task[] = await taskRes.json();
      setTasks(taskData);

      // Fetch board transactions
      const txRes = await authFetch(`${API_BASE_URL}/boards/${boardId}/transactions`);
      if (!txRes.ok) throw new Error('Error al cargar transacciones');
      const txData: Transaction[] = await txRes.json();
      setTransactions(txData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Select first board user as active by default if none selected or if activeUser is no longer in board users list
      if (mappedUsers.length > 0) {
        if (!activeUserId || !mappedUsers.some(u => u.id === activeUserId)) {
          setActiveUserId(mappedUsers[0].id);
        }
      } else {
        setActiveUserId('');
      }

    } catch (err: any) {
      showToast(err.message || 'Error al cargar los datos del tablero', 'error');
    }
  };

  // Fetch all boards and general data
  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch boards
      if (!currentUser) return;
      const boardsRes = await authFetch(`${API_BASE_URL}/users/${currentUser.id}/boards`);
      if (!boardsRes.ok) throw new Error('Error al cargar tableros');
      const boardsData: Board[] = await boardsRes.json();
      setBoards(boardsData);

      // Fetch all users globally (for adding existing members to boards)
      const allUsersRes = await authFetch(`${API_BASE_URL}/users`);
      if (allUsersRes.ok) {
        const allUsersData = await allUsersRes.json();
        setAllUsers(allUsersData);
      }

      if (boardsData.length > 0) {
        const nextBoardId = activeBoardId && boardsData.some(b => b.id === activeBoardId) 
          ? activeBoardId 
          : boardsData[0].id;
        setActiveBoardId(nextBoardId);
        await loadBoardData(nextBoardId);
      } else {
        setActiveBoardId('');
        setUsers([]);
        setActiveUserId('');
        setCategories([]);
        setTasks([]);
        setTransactions([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Error de conexión con el backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check auth on init
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setAccessToken(token);
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      attemptAutoLogin();
    }
  }, []);

  // Automatically refresh board-scoped data when switching boards or after login
  useEffect(() => {
    if (isLoggedIn && activeBoardId) {
      loadBoardData(activeBoardId);
    }
  }, [activeBoardId, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  // Get active user details
  const activeUser = users.find(u => u.id === activeUserId);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify({ 
          name: newUserName, 
          username: newUserUsername, 
          password: newUserPassword 
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'No se pudo crear el usuario');
      }
      
      const createdUser: User = await res.json();
      
      // If we have an active board, automatically add the newly created user to this board!
      if (activeBoardId) {
        const url = `${API_BASE_URL}/boards/${activeBoardId}/users/${createdUser.id}${newUserAlias ? `?alias=${encodeURIComponent(newUserAlias)}` : ''}`;
        const boardAddRes = await authFetch(url, {
          method: 'POST'
        });
        if (!boardAddRes.ok) throw new Error('No se pudo agregar el usuario al tablero');
      }

      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserAlias('');
      setShowAddUserModal(false);
      showToast(`¡Usuario ${createdUser.name} creado y añadido al tablero!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      try {
        const res = await authFetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            name: newCategoryName, 
            description: newCategoryDesc 
          })
        });

        if (!res.ok) throw new Error('No se pudo actualizar la categoría');

        const updatedCat: Category = await res.json();
        setCategories((prev) => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
        setNewCategoryName('');
        setNewCategoryDesc('');
        setEditingCategory(null);
        setShowAddCategoryModal(false);
        showToast(`Categoría "${updatedCat.name}" actualizada`, 'success');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
      return;
    }

    if (!activeUserId) {
      showToast('Por favor, selecciona o crea un usuario activo primero.', 'error');
      return;
    }
    if (!activeBoardId) {
      showToast('Por favor, crea un tablero primero.', 'error');
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: activeUserId, 
          boardId: activeBoardId,
          name: newCategoryName, 
          description: newCategoryDesc 
        })
      });

      if (!res.ok) throw new Error('No se pudo crear la categoría');
      
      const createdCat: Category = await res.json();
      setCategories((prev) => [...prev, createdCat]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setShowAddCategoryModal(false);
      showToast(`Categoría "${createdCat.name}" agregada`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      showToast('El título es requerido', 'error');
      return;
    }

    if (editingTask) {
      try {
        const points = Number(newTaskPoints) || 50;
        const finalPoints = newTaskActionType === 'SPEND' ? -Math.abs(points) : Math.abs(points);

        const payload = {
          title: newTaskTitle,
          categoryId: newTaskCategoryId,
          type: newTaskType,
          frequency: (newTaskType === 'RECURRENT' && newTaskFrequency !== '') ? newTaskFrequency : null,
          pointsValue: finalPoints,
          active: editingTask.active
        };

        const res = await authFetch(`${API_BASE_URL}/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo actualizar la tarea');

        const updatedTask: Task = await res.json();
        setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        
        // Reset Form
        setNewTaskTitle('');
        setNewTaskCategoryId('');
        setNewTaskType('SINGLE_USE');
        setNewTaskFrequency('');
        setNewTaskPoints(50);
        setNewTaskActionType('EARN');
        setIsCreatingCategoryInline(false);
        setInlineCategoryName('');
        setInlineCategoryDesc('');
        setEditingTask(null);
        setShowAddTaskModal(false);

        showToast(`Tarea "${updatedTask.title}" actualizada`, 'success');
      } catch (err: any) {
        showToast(err.message, 'error');
      }
      return;
    }

    if (isCreatingCategoryInline) {
      if (!inlineCategoryName.trim()) {
        showToast('El nombre de la categoría es requerido', 'error');
        return;
      }
      if (!activeUserId) {
        showToast('Por favor, selecciona o crea un usuario activo primero.', 'error');
        return;
      }
      if (!activeBoardId) {
        showToast('Por favor, crea un tablero primero.', 'error');
        return;
      }
    } else {
      if (!newTaskCategoryId) {
        showToast('La categoría es requerida', 'error');
        return;
      }
    }

    try {
      let categoryIdToUse = newTaskCategoryId;

      if (isCreatingCategoryInline) {
        // Create category first inline
        const catRes = await authFetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          body: JSON.stringify({ 
            userId: activeUserId, 
            boardId: activeBoardId,
            name: inlineCategoryName, 
            description: inlineCategoryDesc 
          })
        });

        if (!catRes.ok) throw new Error('No se pudo crear la categoría');
        
        const createdCat: Category = await catRes.json();
        setCategories((prev) => [...prev, createdCat]);
        categoryIdToUse = createdCat.id;
      }

      const points = Number(newTaskPoints) || 50;
      const finalPoints = newTaskActionType === 'SPEND' ? -Math.abs(points) : Math.abs(points);

      const payload = {
        title: newTaskTitle,
        categoryId: categoryIdToUse,
        type: newTaskType,
        frequency: (newTaskType === 'RECURRENT' && newTaskFrequency !== '') ? newTaskFrequency : null,
        pointsValue: finalPoints,
        active: true
      };

      const res = await authFetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('No se pudo crear la tarea');

      const createdTask: Task = await res.json();
      setTasks((prev) => [...prev, createdTask]);
      
      // Reset Form
      setNewTaskTitle('');
      setNewTaskCategoryId('');
      setNewTaskType('SINGLE_USE');
      setNewTaskFrequency('');
      setNewTaskPoints(50);
      setNewTaskActionType('EARN');
      setIsCreatingCategoryInline(false);
      setInlineCategoryName('');
      setInlineCategoryDesc('');
      setShowAddTaskModal(false);
      
      showToast(`Tarea "${createdTask.title}" creada`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Execute (Complete) Task
  const handleExecuteTask = async (taskId: string) => {
    if (!activeUserId) {
      showToast('Selecciona un usuario para completar esta tarea', 'info');
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/tasks/${taskId}/execute?userId=${activeUserId}`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'No se pudo completar la tarea');
      }

      const tx: Transaction = await res.json();
      
      // Trigger Premium Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#14b8a6', '#a855f7']
      });

      if (tx.pointsAffected < 0) {
        showToast(`¡Canjeado con éxito! Has gastado ${Math.abs(tx.pointsAffected)} puntos`, 'info');
      } else {
        showToast(`¡Completado! Recibes +${tx.pointsAffected} puntos`, 'success');
      }
      
      // Refresh Data (User points, leaderboard, transactions feed)
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Handlers
  const handleDeleteTask = (taskId: string) => {
    askConfirmation(
      '¿Eliminar Tarea?',
      '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('No se pudo eliminar la tarea');
          showToast('Tarea eliminada con éxito', 'success');
          refreshData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    askConfirmation(
      '¿Eliminar Categoría?',
      '¿Estás seguro de que deseas eliminar esta categoría? Esto también eliminará de forma permanente todas las tareas dentro de ella.',
      async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/categories/${categoryId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('No se pudo eliminar la categoría');
          showToast('Categoría eliminada con éxito', 'success');
          
          if (categoryFilter === categoryId) {
            setCategoryFilter('all');
          }
          
          refreshData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    );
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDesc(category.description || '');
    setShowAddCategoryModal(true);
  };

  const handleStartEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskCategoryId(task.categoryId);
    setNewTaskType(task.type);
    setNewTaskFrequency(task.frequency || '');
    setNewTaskPoints(Math.abs(task.pointsValue));
    setNewTaskActionType(task.pointsValue < 0 ? 'SPEND' : 'EARN');
    setIsCreatingCategoryInline(false);
    setShowAddTaskModal(true);
  };

  const handleUndoTransaction = (transactionId: string) => {
    askConfirmation(
      '¿Deshacer Transacción?',
      '¿Estás seguro de que deseas deshacer esta transacción? Se revertirá el efecto sobre los puntos.',
      async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/transactions/${transactionId}`, {
            method: 'DELETE'
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'No se pudo deshacer la transacción');
          }
          showToast('Transacción deshecha con éxito', 'success');
          refreshData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      true
    );
  };


  // Board Handlers
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/boards`, {
        method: 'POST',
        body: JSON.stringify({ name: newBoardName })
      });
      if (!res.ok) throw new Error('No se pudo crear el tablero');
      
      const createdBoard: Board = await res.json();

      // Automáticamente añadir al usuario creador al tablero sin alias
      if (currentUser) {
        await authFetch(`${API_BASE_URL}/boards/${createdBoard.id}/users/${currentUser.id}`, {
          method: 'POST'
        });
      }

      setBoards((prev) => [...prev, createdBoard]);
      setActiveBoardId(createdBoard.id);
      setNewBoardName('');
      setShowAddBoardModal(false);
      showToast(`Tablero "${createdBoard.name}" creado con éxito`, 'success');
      
      // Clear data states to prevent displaying stale board data
      setUsers([]);
      setActiveUserId('');
      setCategories([]);
      setTasks([]);
      setTransactions([]);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoardId || !editAliasUserId) return;

    try {
      const url = `${API_BASE_URL}/boards/${activeBoardId}/users/${editAliasUserId}?alias=${encodeURIComponent(editAliasValue)}`;
      const res = await authFetch(url, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('No se pudo actualizar el alias');

      showToast('Alias actualizado con éxito', 'success');
      setShowEditAliasModal(false);
      setEditAliasUserId('');
      setEditAliasValue('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    askConfirmation(
      '¿Eliminar Tablero?',
      `¿Estás seguro de que quieres eliminar el tablero "${board.name}"? Esto eliminará de forma permanente todas sus categorías, tareas y membresías de usuario asociadas.`,
      async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/boards/${boardId}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('No se pudo eliminar el tablero');
          showToast(`Tablero "${board.name}" eliminado`, 'info');
          
          if (activeBoardId === boardId) {
            setActiveBoardId('');
          }
          refreshData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    );
  };

  const handleRemoveUserFromBoard = (userId: string) => {
    const u = users.find(user => user.id === userId);
    if (!u || !activeBoardId) return;

    askConfirmation(
      '¿Quitar del Tablero?',
      `¿Estás seguro de que deseas quitar a "${u.name}" de este tablero? El usuario seguirá existiendo en la aplicación pero ya no pertenecerá a este espacio.`,
      async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/boards/${activeBoardId}/users/${userId}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('No se pudo quitar al usuario del tablero');
          showToast(`Usuario "${u.name}" quitado del tablero`, 'info');
          
          if (activeUserId === userId) {
            setActiveUserId('');
          }
          refreshData();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    );
  };

  const handleAddExistingUserToBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingUserId || !activeBoardId) return;
    
    try {
      const url = `${API_BASE_URL}/boards/${activeBoardId}/users/${selectedExistingUserId}${invitedUserAlias ? `?alias=${encodeURIComponent(invitedUserAlias)}` : ''}`;
      const res = await authFetch(url, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('No se pudo añadir el usuario al tablero');
      
      showToast('Miembro añadido al tablero', 'success');
      setShowAddExistingUserModal(false);
      setSelectedExistingUserId('');
      setInvitedUserAlias('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Helper Lookups
  const getUserName = (id: string) => {
    const u = users.find(user => user.id === id);
    return u ? (u.alias || u.name) : 'Usuario';
  };
  const getTaskTitle = (id?: string | null) => tasks.find(t => t.id === id)?.title || 'Tarea especial';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Sin Categoría';

  const formatTransactionDate = (createdAt: string) => {
    const txDate = new Date(createdAt);
    const today = new Date();
    const isToday = txDate.getDate() === today.getDate() &&
                    txDate.getMonth() === today.getMonth() &&
                    txDate.getFullYear() === today.getFullYear();
    if (isToday) {
      return txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return txDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const isTaskCompleted = (task: Task): boolean => {
    if (!activeUserId) return false;

    const userTx = transactions.filter(t => t.userId === activeUserId && t.taskId === task.id);
    if (userTx.length === 0) return false;

    if (task.type === 'SINGLE_USE') {
      return true;
    }

    if (task.type === 'RECURRENT' && !task.frequency) {
      return false;
    }

    const now = new Date();
    
    if (task.frequency === 'DAILY') {
      return userTx.some(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === now.getFullYear() &&
               txDate.getMonth() === now.getMonth() &&
               txDate.getDate() === now.getDate();
      });
    }

    if (task.frequency === 'WEEKLY') {
      const getStartOfWeek = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
      };

      const startOfWeek = getStartOfWeek(now);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return userTx.some(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      });
    }

    if (task.frequency === 'MONTHLY') {
      return userTx.some(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === now.getFullYear() &&
               txDate.getMonth() === now.getMonth();
      });
    }

    return false;
  };

  // Filters and Sorting
  const filteredTasks = tasks
    .filter(t => {
      const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesCategory && matchesType && t.active;
    })
    .sort((a, b) => {
      const aIsEarn = a.pointsValue >= 0;
      const bIsEarn = b.pointsValue >= 0;

      if (aIsEarn && !bIsEarn) return -1;
      if (!aIsEarn && bIsEarn) return 1;

      // Alphabetical sort within each group
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });

  // Sorting users for Leaderboard
  const sortedUsers = [...users].sort((a, b) => b.pointsBalance - a.pointsBalance);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        {/* Toast Alert Drawer */}
        <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>

        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-indigo-500/10">
            M
          </div>
          
          <h2 className="text-3xl font-extrabold text-white text-center mb-2">
            {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="text-zinc-400 text-sm text-center mb-8 leading-relaxed">
            {isRegisterMode 
              ? 'Únete a Mosify para gestionar tus tareas y puntos' 
              : 'Bienvenido de nuevo a Mosify'}
          </p>

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre (ej. Oscar)"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Usuario</label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={isRegisterMode ? registerUsername : loginUsername}
                onChange={(e) => isRegisterMode ? setRegisterUsername(e.target.value) : setLoginUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={isRegisterMode ? registerPassword : loginPassword}
                onChange={(e) => isRegisterMode ? setRegisterPassword(e.target.value) : setLoginPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-black font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-4"
            >
              {isRegisterMode ? 'Registrarse' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setRegisterName('');
                setRegisterUsername('');
                setRegisterPassword('');
                setLoginUsername('');
                setLoginPassword('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isRegisterMode 
                ? '¿Ya tienes una cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (boards.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        {/* Toast Alert Drawer */}
        <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>

        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-indigo-500/10">
            M
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">¡Bienvenido a Mosify!</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Para comenzar a gestionar tus tareas y recompensas de forma colaborativa, necesitas crear tu primer tablero de trabajo.
          </p>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre del tablero (ej. Hogar, Oficina)"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-black font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Crear Tablero
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* Toast Alert Drawer */}
      <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* 1. LEFT PANEL: Sidebar & Leaderboard */}
      <aside className="w-full md:w-80 glass border-r border-white/8 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-black font-extrabold text-sm shadow-md">
              M
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-indigo-200 to-teal-200 bg-clip-text text-transparent">
              MOSIFY
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={refreshData}
              title="Recargar datos"
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {currentUser && (
              <button 
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Logged User Info */}
        {currentUser && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-zinc-400 truncate">Sesión activa</p>
              <p className="text-sm font-semibold text-zinc-100 truncate">{currentUser.name}</p>
            </div>
          </div>
        )}

        {/* Board Switcher */}
        <div className="flex flex-col gap-2 p-3 bg-white/2 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" /> Tablero Activo
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowAddBoardModal(true)}
                title="Crear nuevo tablero"
                className="text-indigo-400 hover:text-indigo-300 p-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {activeBoardId && (
                <button 
                  onClick={() => handleDeleteBoard(activeBoardId)}
                  title="Eliminar este tablero"
                  className="text-zinc-500 hover:text-red-400 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {boards.length > 0 ? (
            <CustomSelect
              value={activeBoardId}
              onChange={setActiveBoardId}
              options={boards.map(b => ({ value: b.id, label: b.name }))}
            />
          ) : (
            <div className="text-xs text-zinc-500 italic px-1">No hay tableros. Crea uno primero.</div>
          )}
        </div>

        {/* Selected Active User Profile */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-900/50 border border-indigo-500/20 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
          {activeUser ? (
            <div>
              <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase mb-1">Usuario Activo</p>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {activeUser.alias || activeUser.name}
                <Award className="w-5 h-5 text-indigo-400" />
              </h3>
              {activeUser.alias && (
                <p className="text-[10px] text-zinc-400 mt-0.5">Nombre real: {activeUser.name}</p>
              )}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-300 tracking-tight">
                  {activeUser.pointsBalance}
                </span>
                <span className="text-sm text-teal-300/80 font-medium">pts</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-zinc-400 mb-3">No hay usuarios activos</p>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer w-full flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Crear Usuario
              </button>
            </div>
          )}
        </div>

        {/* Active User Switcher */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Cambiar Usuario
            </span>
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setShowAddExistingUserModal(true)}
                className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                title="Añadir miembro existente"
              >
                <Users className="w-3 h-3" /> Invitar
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Nuevo
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {users.map((u) => (
              <div
                key={u.id}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all
                  ${u.id === activeUserId 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white font-semibold shadow-inner' 
                    : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'
                  }
                `}
              >
                <button
                  onClick={() => setActiveUserId(u.id)}
                  className="flex-1 flex items-center justify-between min-w-0 pr-2 text-left cursor-pointer focus:outline-none"
                >
                  <span className="truncate">{u.alias || u.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 border border-white/5 text-zinc-300 ml-2">{u.pointsBalance} pts</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAliasUserId(u.id);
                      setEditAliasValue(u.alias || '');
                      setShowEditAliasModal(true);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Editar alias"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUserFromBoard(u.id);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Quitar del tablero"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Clasificación (Leaderboard)
          </span>
          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2">
            {sortedUsers.slice(0, 5).map((u, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={u.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-zinc-500 w-4">
                      {index < 3 ? medals[index] : `${index + 1}.`}
                    </span>
                    <span className={`truncate font-medium ${u.id === activeUserId ? 'text-indigo-300 font-bold' : 'text-zinc-300'}`}>
                      {u.alias || u.name}
                    </span>
                  </div>
                  <span className="font-bold text-zinc-200">{u.pointsBalance} pts</span>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-2">No hay registros</p>
            )}
          </div>
        </div>
      </aside>

      {/* 2. CENTRAL PANEL: Tasks Board */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-5xl">
        
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Tablero de Tareas
              <Sparkles className="w-6 h-6 text-teal-400 animate-pulse" />
            </h1>
            <p className="text-sm text-zinc-400">Completa tus metas pendientes para ganar puntos e incentivos.</p>
          </div>
          <button 
            onClick={() => {
              setInlineCategoryName('');
              setInlineCategoryDesc('');
              setIsCreatingCategoryInline(false);
              setShowAddTaskModal(true);
            }}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Nueva Tarea
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-col gap-3">
          {/* Categories Horizontal Filter */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 pr-4 no-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3 h-3" /> Categoría:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 cursor-pointer
                ${categoryFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10'
                }
              `}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 cursor-pointer
                  ${categoryFilter === c.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10'
                  }
                `}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Type Filters tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${typeFilter === 'all'
                  ? 'bg-zinc-800 border border-zinc-700 text-teal-400'
                  : 'bg-transparent border border-transparent text-zinc-500 hover:text-zinc-400'
                }
              `}
            >
              Todos los tipos
            </button>
            <button
              onClick={() => setTypeFilter('SINGLE_USE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${typeFilter === 'SINGLE_USE'
                  ? 'bg-zinc-800 border border-zinc-700 text-teal-400'
                  : 'bg-transparent border border-transparent text-zinc-500 hover:text-zinc-400'
                }
              `}
            >
              Un solo uso
            </button>
            <button
              onClick={() => setTypeFilter('RECURRENT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${typeFilter === 'RECURRENT'
                  ? 'bg-zinc-800 border border-zinc-700 text-teal-400'
                  : 'bg-transparent border border-transparent text-zinc-500 hover:text-zinc-400'
                }
              `}
            >
              Recurrentes
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          // Skeleton Screen Loaders
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/5 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  <div className="h-3 bg-white/10 rounded w-1/3"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-8 bg-white/10 rounded-xl w-20"></div>
                  <div className="h-10 bg-white/10 rounded-xl w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const completed = isTaskCompleted(task);
              const isSpend = task.pointsValue < 0;
              const userBalance = activeUser?.pointsBalance || 0;
              const hasInsufficientBalance = isSpend && (userBalance + task.pointsValue < 0);

              return (
                <div key={task.id} className={`glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ${
                  completed 
                    ? isSpend
                      ? 'border-orange-500/20 shadow-lg shadow-orange-950/10'
                      : 'border-teal-500/20 shadow-lg shadow-teal-950/10' 
                    : isSpend 
                      ? 'hover:border-orange-500/20' 
                      : 'hover:border-indigo-500/20'
                }`}>
                  {/* Glowing subtle gradient highlight */}
                  <div className={`absolute top-0 left-0 w-2 h-full opacity-70 ${
                    completed 
                      ? isSpend
                        ? 'bg-orange-500'
                        : 'bg-teal-500' 
                      : isSpend 
                        ? 'bg-gradient-to-b from-orange-500 to-red-500' 
                        : 'bg-gradient-to-b from-indigo-500 to-teal-400'
                  }`}></div>
                  
                  <div className="pl-2">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-indigo-300 font-semibold border border-white/5 uppercase">
                        {getCategoryName(task.categoryId)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                          {task.type === 'RECURRENT' ? (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold border ${
                              completed 
                                ? isSpend
                                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                                  : 'bg-teal-500/20 border-teal-500/30 text-teal-300' 
                                : isSpend 
                                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-300' 
                                  : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
                            }`}>
                              <Calendar className="w-3.5 h-3.5" /> Recurrente • {task.frequency ? (task.frequency === 'DAILY' ? 'Diario' : task.frequency === 'WEEKLY' ? 'Semanal' : 'Mensual') : 'Permanente'}
                            </span>
                          ) : (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                              completed 
                                ? isSpend
                                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                                  : 'bg-teal-500/20 border-teal-500/30 text-teal-300' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                              <Flame className="w-3.5 h-3.5 text-orange-400" /> Único uso
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleStartEditTask(task)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                            title="Editar tarea"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                            title="Eliminar tarea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <h3 className={`text-lg font-bold tracking-wide transition-colors ${
                      completed 
                        ? 'text-zinc-400 line-through decoration-zinc-600' 
                        : isSpend 
                          ? 'text-white group-hover:text-orange-200' 
                          : 'text-white group-hover:text-indigo-200'
                    }`}>
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-6 pl-2">
                    {/* Points Bubble badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-sm shadow-inner border ${
                      completed 
                        ? isSpend
                          ? 'bg-orange-500/5 border-orange-500/10 text-orange-500/70'
                          : 'bg-teal-500/5 border-teal-500/10 text-teal-500/70' 
                        : isSpend 
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                          : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                    }`}>
                      <Award className={`w-4 h-4 ${completed ? isSpend ? 'text-orange-500/50' : 'text-teal-500/50' : isSpend ? 'text-orange-400' : 'text-teal-400'}`} />
                      {isSpend ? `${task.pointsValue} pts` : `+${task.pointsValue} pts`}
                    </div>

                    {/* Complete/Redeem Task Button */}
                    <button 
                      onClick={() => !completed && !hasInsufficientBalance && handleExecuteTask(task.id)}
                      disabled={completed || hasInsufficientBalance}
                      className={`px-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all duration-300 flex items-center gap-1.5
                        ${completed 
                          ? isSpend
                            ? 'bg-orange-950/40 border-orange-500/40 text-orange-400 cursor-default font-extrabold'
                            : 'bg-teal-950/40 border-teal-500/40 text-teal-400 cursor-default font-extrabold'
                          : hasInsufficientBalance
                            ? 'bg-red-950/20 border-red-500/20 text-red-400/60 cursor-not-allowed font-bold'
                            : isSpend
                              ? 'bg-white/5 border-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:border-transparent text-zinc-300 hover:text-black font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                              : 'bg-white/5 border-white/10 hover:bg-gradient-to-r hover:from-teal-500 hover:to-indigo-500 hover:border-transparent text-zinc-300 hover:text-black font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                        }
                      `}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${completed ? isSpend ? 'text-orange-400 animate-pulse' : 'text-teal-400 animate-pulse' : 'transition-transform group-hover:rotate-12'}`} />
                      {completed 
                        ? isSpend
                          ? 'Gastado'
                          : 'Completado' 
                        : hasInsufficientBalance 
                          ? 'Saldo Insuficiente' 
                          : isSpend 
                            ? 'Canjear' 
                            : 'Completar'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl text-center glass">
            <Info className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <p className="text-zinc-400 font-semibold text-base">No se encontraron tareas</p>
            <p className="text-zinc-500 text-sm mt-1">Crea una nueva tarea para comenzar o cambia los filtros de categoría.</p>
          </div>
        )}

      </main>

      {/* 3. RIGHT PANEL: Recent Transactions & Categories */}
      <aside className="w-full md:w-80 glass border-l border-white/8 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen overflow-y-auto">
        
        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Categorías
            </span>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Nueva
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((c) => (
              <div 
                key={c.id} 
                className="p-3 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-0.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-200">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditCategory(c)}
                      className="p-1 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                      title="Editar categoría"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {c.description && <p className="text-xs text-zinc-500 truncate">{c.description}</p>}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-3">No hay categorías registradas</p>
            )}
          </div>
        </div>

        {/* Audit Log / Recent Transactions */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" /> Actividad Reciente
          </span>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-300 truncate">
                    {getUserName(tx.userId)}
                  </p>
                  <p className="text-zinc-500 truncate">{getTaskTitle(tx.taskId)}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {formatTransactionDate(tx.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`px-2 py-1 rounded font-extrabold border ${
                    tx.pointsAffected < 0 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                  }`}>
                    {tx.pointsAffected < 0 ? '' : '+'}{tx.pointsAffected} pts
                  </div>
                  {currentUser && tx.userId && currentUser.id && tx.userId.toLowerCase() === currentUser.id.toLowerCase() && (
                    <button
                      onClick={() => handleUndoTransaction(tx.id)}
                      className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                      title="Deshacer transacción"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs">
                Aún no hay transacciones registradas.
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowAddUserModal(false);
                setNewUserName('');
                setNewUserUsername('');
                setNewUserPassword('');
                setNewUserAlias('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Users className="w-5 h-5 text-indigo-400" /> Crear Nuevo Usuario
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej: Oscar, María"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="Ej: oscar123"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Contraseña</label>
                <input 
                  type="password" 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Alias en este Tablero (Opcional)</label>
                <input 
                  type="text" 
                  value={newUserAlias}
                  onChange={(e) => setNewUserAlias(e.target.value)}
                  placeholder="Ej: Papá, Mamá, Jefe"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Crear Usuario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowAddCategoryModal(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryDesc('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-indigo-400" /> {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre de Categoría</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Hogar, Deporte, Estudios"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Descripción (Opcional)</label>
                <textarea 
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Descripción corta de las tareas..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Guardar Categoría
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowAddTaskModal(false);
                setEditingTask(null);
                setNewTaskTitle('');
                setNewTaskCategoryId('');
                setNewTaskType('SINGLE_USE');
                setNewTaskFrequency('');
                setNewTaskPoints(50);
                setNewTaskActionType('EARN');
                setIsCreatingCategoryInline(false);
                setInlineCategoryName('');
                setInlineCategoryDesc('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-indigo-400" /> {editingTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Título de la Tarea</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ej: Estudiar matemáticas, Limpiar cocina"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tipo de Acción</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950/60 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setNewTaskActionType('EARN')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newTaskActionType === 'EARN' 
                        ? 'bg-gradient-to-r from-teal-500/20 to-teal-400/10 border border-teal-500/30 text-teal-300 shadow-md shadow-teal-500/5' 
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    Ganar Puntos (Tarea)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskActionType('SPEND')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newTaskActionType === 'SPEND' 
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/10 border border-orange-500/30 text-orange-300 shadow-md shadow-orange-500/5' 
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    Gastar Puntos (Premio)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Categoría</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategoryInline(!isCreatingCategoryInline);
                        setInlineCategoryName('');
                        setInlineCategoryDesc('');
                        setNewTaskCategoryId('');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      {isCreatingCategoryInline ? 'Seleccionar existente' : '+ Crear nueva'}
                    </button>
                  </div>
                  {isCreatingCategoryInline ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                        placeholder="Nombre de categoría"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                        required
                      />
                      <input
                        type="text"
                        value={inlineCategoryDesc}
                        onChange={(e) => setInlineCategoryDesc(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                      />
                    </div>
                  ) : (
                    <CustomSelect
                      value={newTaskCategoryId}
                      onChange={setNewTaskCategoryId}
                      options={[
                        { value: '', label: 'Seleccionar...', disabled: true },
                        ...categories.map(c => ({ value: c.id, label: c.name }))
                      ]}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Valor en Puntos</label>
                  <input 
                    type="number" 
                    value={newTaskPoints}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTaskPoints(val === '' ? '' : Number(val));
                    }}
                    min={1}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tipo de Tarea</label>
                  <CustomSelect
                    value={newTaskType}
                    onChange={(value) => {
                      const type = value as 'SINGLE_USE' | 'RECURRENT';
                      setNewTaskType(type);
                      if (type === 'SINGLE_USE') setNewTaskFrequency('');
                    }}
                    options={[
                      { value: 'SINGLE_USE', label: 'Un solo uso' },
                      { value: 'RECURRENT', label: 'Recurrente' }
                    ]}
                  />
                </div>
                {newTaskType === 'RECURRENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Frecuencia</label>
                    <CustomSelect
                      value={newTaskFrequency || ''}
                      onChange={(value) => setNewTaskFrequency(value as any)}
                      options={[
                        { value: '', label: 'Permanente (Sin límite)' },
                        { value: 'DAILY', label: 'Diario' },
                        { value: 'WEEKLY', label: 'Semanal' },
                        { value: 'MONTHLY', label: 'Mensual' }
                      ]}
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass max-w-sm w-full rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Top decoration glow */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${confirmDialog.isDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-teal-400'}`}></div>
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl border ${confirmDialog.isDanger ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white tracking-wide">{confirmDialog.title}</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 font-bold transition-all cursor-pointer"
              >
                {confirmDialog.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-extrabold text-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md
                  ${confirmDialog.isDanger 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-red-950/20' 
                    : 'bg-gradient-to-r from-indigo-500 to-teal-400 hover:shadow-indigo-950/20'
                  }
                `}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD BOARD */}
      {showAddBoardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddBoardModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <FolderPlus className="w-5 h-5 text-indigo-400" /> Crear Nuevo Tablero
            </h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre del Tablero</label>
                <input 
                  type="text" 
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Ej: Hogar, Familia, Oficina"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Crear Tablero
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ALIAS */}
      {showEditAliasModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowEditAliasModal(false);
                setEditAliasUserId('');
                setEditAliasValue('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Edit className="w-5 h-5 text-indigo-400" /> Editar Alias en este Tablero
            </h3>
            <form onSubmit={handleUpdateAlias} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Alias (Dejar vacío para usar nombre real)</label>
                <input 
                  type="text" 
                  value={editAliasValue}
                  onChange={(e) => setEditAliasValue(e.target.value)}
                  placeholder="Ej: Papá, Mamá, Boss"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Guardar Alias
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE USER TO BOARD */}
      {showAddExistingUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass p-6 border border-white/10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddExistingUserModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Users className="w-5 h-5 text-teal-400" /> Invitar Miembro al Tablero
            </h3>
            {allUsers.filter(au => !users.some(bu => bu.id === au.id)).length > 0 ? (
              <form onSubmit={handleAddExistingUserToBoard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Seleccionar Usuario</label>
                  <CustomSelect
                    value={selectedExistingUserId}
                    onChange={setSelectedExistingUserId}
                    options={[
                      { value: '', label: 'Seleccionar...', disabled: true },
                      ...allUsers
                        .filter(au => !users.some(bu => bu.id === au.id))
                        .map((u) => ({ value: u.id, label: u.name }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Alias en este Tablero (Opcional)</label>
                  <input 
                    type="text" 
                    value={invitedUserAlias}
                    onChange={(e) => setInvitedUserAlias(e.target.value)}
                    placeholder="Ej: Papá, Mamá, Jefe"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-black font-extrabold text-sm transition-all cursor-pointer"
                >
                  Añadir al Tablero
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-400 mb-4">No hay más usuarios registrados en la app para invitar.</p>
                <button
                  onClick={() => {
                    setShowAddExistingUserModal(false);
                    setShowAddUserModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Crear Nuevo Usuario
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
