import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [epics, setEpics] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [comments, setComments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [burndownData, setBurndownData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ---------- AXIOS INTERCEPTOR ----------
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL });
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    return instance;
  }, []);

  // ========== FETCH FUNCTIONS ==========
  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (e) { console.error('projects:', e); }
  }, [api]);

  const fetchSprints = useCallback(async () => {
    try {
      const res = await api.get('/api/sprints');
      setSprints(res.data);
    } catch (e) { console.error('sprints:', e); }
  }, [api]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch (e) { console.error('tasks:', e); }
  }, [api]);

  const fetchEpics = useCallback(async () => {
    try {
      const res = await api.get('/api/epics');
      setEpics(res.data);
    } catch (e) { console.error('epics:', e); }
  }, [api]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (e) { console.error('users:', e); }
  }, [api]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get('/api/activities');
      setActivities(res.data);
    } catch (e) { console.error('activities:', e); }
  }, [api]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data);
    } catch (e) { console.error('departments:', e); }
  }, [api]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get('/api/teams');
      setTeams(res.data);
    } catch (e) { console.error('teams:', e); }
  }, [api]);

  const fetchBurndown = useCallback(async () => {
    try {
      const res = await api.get('/api/burndown');
      setBurndownData(res.data);
    } catch (e) { console.error('burndown:', e); }
  }, [api]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get('/api/comments');
      setComments(res.data);
    } catch (e) { console.error('comments:', e); }
  }, [api]);

  const fetchSubtasks = useCallback(async () => {
    try {
      const res = await api.get('/api/subtasks');
      setSubtasks(res.data);
    } catch (e) { console.error('subtasks:', e); }
  }, [api]);

  const addActivity = useCallback(async (action) => {
    try {
      await api.post('/api/activities', { action });
      await fetchActivities();
    } catch (e) { console.error('add activity:', e); }
  }, [api, fetchActivities]);

  // ========== FETCH ALL DATA ==========
  const fetchAllData = useCallback(() => {
    fetchProjects();
    fetchSprints();
    fetchTasks();
    fetchEpics();
    fetchUsers();
    fetchActivities();
    fetchDepartments();
    fetchTeams();
    fetchBurndown();
    fetchComments();
    fetchSubtasks();
  }, [fetchProjects, fetchSprints, fetchTasks, fetchEpics, fetchUsers, fetchActivities, fetchDepartments, fetchTeams, fetchBurndown, fetchComments, fetchSubtasks]);

  // ========== PAGE RELOAD USER RESTORE ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        if (user.tenantId) {
          api.get(`/api/tenants/${user.tenantId}`)
            .then(res => setCurrentTenant({
              id: res.data.id,
              name: res.data.name,
              slug: res.data.slug
            }))
            .catch(() => setCurrentTenant({
              id: user.tenantId,
              name: 'My Company',
              slug: 'my-company'
            }));
        } else {
          setCurrentTenant(null);
        }

        if (user.role !== 'PlatformOwner') {
          fetchAllData();
        }
      } catch (e) {
        console.error('restore:', e);
      }
    }
  }, [api, fetchAllData]);

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const data = response.data;

      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        setCurrentUser(data.user);

        if (data.user.tenantId) {
          try {
            const t = await axios.get(`${API_URL}/api/tenants/${data.user.tenantId}`, {
              headers: { Authorization: `Bearer ${data.accessToken}` }
            });
            setCurrentTenant({
              id: t.data.id,
              name: t.data.name,
              slug: t.data.slug
            });
          } catch (err) {
            setCurrentTenant({
              id: data.user.tenantId,
              name: 'My Company',
              slug: 'my-company'
            });
          }
        } else {
          setCurrentTenant(null);
        }

        setIsLoading(false);
        return data.user;
      }
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // ---------- REGISTER (Company OR Invited) ----------
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password
      };

      if (userData.inviteToken) {
        payload.inviteToken = userData.inviteToken;
      } else {
        payload.organizationName = userData.organizationName;
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, payload);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // ---------- REGISTER PLATFORM OWNER ----------
  const registerPlatformOwner = async (userData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register-platform-owner`, {
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // ---------- SEND INVITE ----------
  const sendInvite = async (email, role) => {
    try {
      const response = await api.post('/api/invite', { email, role });
      await addActivity(`Invited ${email} as ${role}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send invite');
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentTenant(null);
    setProjects([]);
    setTasks([]);
    setSprints([]);
    setUsers([]);
    setEpics([]);
    setActivities([]);
    setDepartments([]);
    setTeams([]);
    setBurndownData([]);
    setComments([]);
    setSubtasks([]);
  };

  // ========== USER MANAGEMENT ==========
  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await addActivity(`Changed role to ${newRole}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const removeUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      await addActivity(`Removed a member`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  const updateTenant = async (name) => {
    try {
      const res = await api.put(`/api/tenants/${currentTenant.id}`, { name });
      setCurrentTenant({ ...currentTenant, name: res.data.name });
      await addActivity(`Updated company name to "${name}"`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company');
    }
  };

  // ========== CRUD OPERATIONS ==========
  const addSprint = async (sprint) => {
    try {
      const res = await api.post('/api/sprints', {
        name: sprint.name,
        projectId: sprint.projectId,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      });
      setSprints([...sprints, res.data]);
      await addActivity(`Created Sprint "${sprint.name}"`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create sprint');
    }
  };

  const addProject = async (project) => {
    try {
      const res = await api.post('/api/projects', project);
      setProjects([...projects, res.data]);
      await addActivity(`Created Project "${project.name}"`);
      return res.data;
    } catch (error) { throw error; }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      await addActivity(`Deleted Project ID ${id}`);
    } catch (error) { throw error; }
  };

  const addTask = async (task) => {
    try {
      const res = await api.post('/api/tasks', {
        projectId: parseInt(task.projectId),
        assigneeId: task.assigneeId ? parseInt(task.assigneeId) : null,
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To-Do',
        estimatedHours: parseInt(task.estimatedHours) || 0
      });
      setTasks([...tasks, res.data]);
      await addActivity(`Added Task "${task.title}"`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await addActivity(`Task status → ${newStatus}`);
  };

  const addComment = async (taskId, content) => {
    const newComment = {
      id: Date.now(),
      taskId,
      userId: currentUser?.id,
      content,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, newComment]);
    await addActivity(`Added comment on task ${taskId}`);
    return newComment;
  };

  const addDepartment = async (name) => {
    try {
      const res = await api.post('/api/departments', { name });
      setDepartments([...departments, res.data]);
      await addActivity(`Added department: ${name}`);
      return res.data;
    } catch (error) { throw error; }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/api/departments/${id}`);
      setDepartments(departments.filter(d => d.id !== id));
      await addActivity(`Deleted department`);
    } catch (error) { throw error; }
  };

  const addTeam = async (name, departmentId) => {
    try {
      const res = await api.post('/api/teams', { name, departmentId });
      setTeams([...teams, res.data]);
      await addActivity(`Added team: ${name}`);
      return res.data;
    } catch (error) { throw error; }
  };

  const deleteTeam = async (id) => {
    try {
      await api.delete(`/api/teams/${id}`);
      setTeams(teams.filter(t => t.id !== id));
      await addActivity(`Deleted team`);
    } catch (error) { throw error; }
  };

  // ========== CALCULATIONS ==========
  const getTasksByUser = (userId) => tasks.filter(t => t.assigneeId === userId);

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(t => {
      if (t.status === 'Done') return false;
      const taskDate = new Date(t.createdAt);
      return (today - taskDate) / (1000 * 60 * 60 * 24) > 1;
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
      total, done, inProgress, todo, overdue,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0
    };
  };

  // ========== AUTO REFRESH ==========
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && currentUser && currentUser.role !== 'PlatformOwner') {
      fetchAllData();
    }
  }, [currentUser, fetchAllData]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      currentTenant, setCurrentTenant,
      projects, addProject, deleteProject, fetchProjects,
      tasks, addTask, updateTaskStatus, fetchTasks,
      epics, fetchEpics,
      users, setUsers, fetchUsers, updateUserRole, removeUser,
      departments, setDepartments, fetchDepartments, addDepartment, deleteDepartment,
      teams, setTeams, fetchTeams, addTeam, deleteTeam,
      comments, setComments, fetchComments, addComment,
      subtasks, setSubtasks, fetchSubtasks,
      activities, fetchActivities,
      sprints, addSprint, fetchSprints,
      burndownData, fetchBurndown,
      updateTenant,
      sendInvite,
      isLoading,
      login, register, registerPlatformOwner, logout, addActivity,
      getTasksByUser, getOverdueTasks, getWorkloadByUser, getTeamStats,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);