import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenantsList, setTenantsList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [epics, setEpics] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [comments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [burndownData, setBurndownData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ---------- AXIOS INTERCEPTOR (useMemo se stable banaya) ----------
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
    });

    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, []); // ✅ Sirf ek baar create hoga

  // ========== FETCH FUNCTIONS (api dependency add kar di) ==========

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Fetch projects error:', error);
    }
  }, [api]); // ✅ api add kiya

  const fetchSprints = useCallback(async () => {
    try {
      const response = await api.get('/sprints');
      setSprints(response.data);
    } catch (error) {
      console.error('Fetch sprints error:', error);
    }
  }, [api]); // ✅

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    }
  }, [api]); // ✅

  const fetchEpics = useCallback(async () => {
    try {
      const response = await api.get('/epics');
      setEpics(response.data);
    } catch (error) {
      console.error('Fetch epics error:', error);
    }
  }, [api]); // ✅

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  }, [api]); // ✅

  const fetchActivities = useCallback(async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  }, [api]); // ✅

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  }, [api]); // ✅

  const fetchTeams = useCallback(async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Fetch teams error:', error);
    }
  }, [api]); // ✅

  const fetchBurndown = useCallback(async () => {
    try {
      const response = await api.get('/burndown');
      setBurndownData(response.data);
    } catch (error) {
      console.error('Fetch burndown error:', error);
    }
  }, [api]); // ✅

  // ========== ADD ACTIVITY (REAL API) ==========
  const addActivity = useCallback(async (action) => {
    try {
      await api.post('/activities', { action });
      await fetchActivities();
    } catch (error) {
      console.error('Add activity error:', error);
    }
  }, [api, fetchActivities]); // ✅

  // ========== PAGE RELOAD USER RESTORE ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setCurrentTenant({ id: user.tenantId, name: 'Loading...' });
        setTenantsList([
          { id: 1, name: 'Tech Solutions Pvt Ltd' },
          { id: 2, name: 'Innovate Inc.' },
        ]);
        fetchProjects();
        fetchSprints();
        fetchTasks();
        fetchEpics();
        fetchUsers();
        fetchActivities();
        fetchDepartments();
        fetchTeams();
        fetchBurndown();
      } catch (error) {
        console.error('Failed to restore user:', error);
      }
    }
  }, [fetchProjects, fetchSprints, fetchTasks, fetchEpics, fetchUsers, fetchActivities, fetchDepartments, fetchTeams, fetchBurndown]);

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setCurrentUser(data.user);
        setCurrentTenant({ id: data.user.tenantId, name: 'Loading...' });
        setTenantsList([
          { id: 1, name: 'Tech Solutions Pvt Ltd' },
          { id: 2, name: 'Innovate Inc.' },
        ]);
        setIsLoading(false);
        return data.user;
      }
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // ---------- REGISTER ----------
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        organizationName: userData.organizationName
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentTenant(null);
  };

  // ---------- CRUD OPERATIONS ----------

  const addSprint = async (sprint) => {
    try {
      const response = await api.post('/sprints', {
        name: sprint.name,
        projectId: sprint.projectId,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      });
      setSprints([...sprints, response.data]);
      await addActivity(`Created Sprint "${sprint.name}"`);
      return response.data;
    } catch (error) {
      console.error('Add sprint error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create sprint');
    }
  };

  const addProject = async (project) => {
    try {
      const response = await api.post('/projects', project);
      setProjects([...projects, response.data]);
      await addActivity(`Created Project "${project.name}"`);
      return response.data;
    } catch (error) {
      console.error('Add project error:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      await addActivity(`Deleted Project ID ${id}`);
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  };

  // ---------- TASK FUNCTIONS (REAL API) ----------
  const addTask = async (task) => {
    try {
      const response = await api.post('/tasks', {
        projectId: parseInt(task.projectId),
        assigneeId: task.assigneeId ? parseInt(task.assigneeId) : null,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To-Do',
        estimatedHours: parseInt(task.estimatedHours) || 0
      });
      setTasks([...tasks, response.data]);
      await addActivity(`Added Task "${task.title}"`);
      return response.data;
    } catch (error) {
      console.error('Add task error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    addActivity(`Task ${taskId} status → ${newStatus}`);
  };

  // ---------- DEPARTMENT CRUD ----------
  const addDepartment = async (name) => {
    try {
      const response = await api.post('/departments', { name });
      setDepartments([...departments, response.data]);
      await addActivity(`Added department: ${name}`);
      return response.data;
    } catch (error) {
      console.error('Add department error:', error);
      throw error;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      setDepartments(departments.filter(d => d.id !== id));
      await addActivity(`Deleted department`);
    } catch (error) {
      console.error('Delete department error:', error);
      throw error;
    }
  };

  // ---------- TEAM CRUD ----------
  const addTeam = async (name, departmentId) => {
    try {
      const response = await api.post('/teams', { name, departmentId });
      setTeams([...teams, response.data]);
      await addActivity(`Added team: ${name}`);
      return response.data;
    } catch (error) {
      console.error('Add team error:', error);
      throw error;
    }
  };

  const deleteTeam = async (id) => {
    try {
      await api.delete(`/teams/${id}`);
      setTeams(teams.filter(t => t.id !== id));
      await addActivity(`Deleted team`);
    } catch (error) {
      console.error('Delete team error:', error);
      throw error;
    }
  };

  // ---------- TENANT SWITCH ----------
  const switchTenant = (tenantId) => {
    const tenant = tenantsList.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      fetchProjects();
      fetchSprints();
      fetchTasks();
      fetchEpics();
      fetchUsers();
      fetchActivities();
      fetchDepartments();
      fetchTeams();
      fetchBurndown();
      addActivity(`Switched to company "${tenant.name}"`);
    }
  };

  // ========== WORKLOAD & OVERDUE CALCULATIONS ==========

  const getTasksByUser = (userId) => {
    return tasks.filter(t => t.assigneeId === userId);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(t => {
      if (t.status === 'Done') return false;
      const taskDate = new Date(t.createdAt);
      const diffDays = (today - taskDate) / (1000 * 60 * 60 * 24);
      return diffDays > 1;
    });
  };

  const getWorkloadByUser = () => {
    const workload = {};
    users.forEach(u => {
      const assigned = tasks.filter(t => t.assigneeId === u.id);
      const completed = assigned.filter(t => t.status === 'Done');
      workload[u.id] = {
        name: u.name,
        role: u.role,
        assigned: assigned.length,
        completed: completed.length,
        pending: assigned.length - completed.length
      };
    });
    return workload;
  };

  const getTeamStats = () => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In-Progress').length;
    const todo = tasks.filter(t => t.status === 'To-Do').length;
    const overdue = getOverdueTasks().length;
    return {
      total,
      done,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0
    };
  };

  // ========== USE EFFECT ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && currentUser) {
      fetchProjects();
      fetchSprints();
      fetchTasks();
      fetchEpics();
      fetchUsers();
      fetchActivities();
      fetchDepartments();
      fetchTeams();
      fetchBurndown();
    }
  }, [currentUser, fetchProjects, fetchSprints, fetchTasks, fetchEpics, fetchUsers, fetchActivities, fetchDepartments, fetchTeams, fetchBurndown]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      currentTenant,
      tenantsList,
      switchTenant,
      projects, addProject, deleteProject, fetchProjects,
      tasks, addTask, updateTaskStatus, fetchTasks,
      epics, fetchEpics,
      users, setUsers, fetchUsers,
      departments, setDepartments, fetchDepartments, addDepartment, deleteDepartment,
      teams, setTeams, fetchTeams, addTeam, deleteTeam,
      comments,
      activities, fetchActivities,
      sprints, addSprint, fetchSprints,
      burndownData, fetchBurndown,
      isLoading,
      login,
      register,
      logout,
      addActivity,
      getTasksByUser,
      getOverdueTasks,
      getWorkloadByUser,
      getTeamStats,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);