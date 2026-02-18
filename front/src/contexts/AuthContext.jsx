import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Mock de usuários
const MOCK_USERS = [
  {
    id: 1,
    username: 'LIDER',
    password: 'lider123',
    name: 'Administrador RMA',
    role: 'admin',
    permissions: ['dashboard', 'devolucao', 'maquinas', 'monitores', 'kit', 'chamados']
  },
  {
    id: 2,
    username: 'tecnico',
    password: 'tec123',
    name: 'Técnico',
    role: 'tecnico',
    permissions: ['maquinas', 'monitores', 'kit', 'chamados']
  },
  {
    id: 3,
    username: 'operador',
    password: 'op123',
    name: 'Operador',
    role: 'operador',
    permissions: ['devolucao', 'dashboard', 'maquinas', 'chamados' ]
  },
  {
    id: 4,
    username: 'RMA',
    password: '123',
    name: 'Operador RMA',
    role: 'operador',
    permissions: ['dashboard']
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const logoutTimerRef = useRef(null);
  const initializedRef = useRef(false);

  // Tempo de timeout em milissegundos (20 minutos)
  const TIMEOUT_DURATION = 20 * 60 * 1000;

  // Atualizar atividade do usuário - useCallback estável
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    
    // Limpar timer anterior
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    // Configurar novo timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
      alert('Sessão expirada devido à inatividade. Por favor, faça login novamente.');
    }, TIMEOUT_DURATION);
  }, []); // Sem dependências - função estável

  // Função de logout - useCallback estável
  const handleLogout = useCallback(() => {
    // Limpar timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    
    // Limpar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Limpar headers da API
    delete api.defaults.headers.common['Authorization'];
    
    // Limpar estado
    setUser(null);
    setError('');
  }, []);

  // Verificar token/sessão ao carregar - APENAS UMA VEZ
  useEffect(() => {
    // Evitar execução múltipla
    if (initializedRef.current) return;
    initializedRef.current = true;

    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Configurar token padrão para API
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Iniciar monitor de inatividade
          updateActivity();
        } catch (err) {
          console.error('Erro ao carregar usuário:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Cleanup
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [updateActivity]); // updateActivity é estável agora

  // Inicializar monitor de atividade - APENAS quando user muda
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      updateActivity();
    };

    // Adicionar event listeners para atividade do usuário
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [user, updateActivity]); // Só recria quando user ou updateActivity muda

  // Função de login
  const login = async (credentials) => {
    setError('');
    setLoading(true);
    
    try {
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar credenciais no mock
      const foundUser = MOCK_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );
      
      if (!foundUser) {
        throw new Error('Usuário ou senha incorretos');
      }
      
      // Criar objeto de usuário sem a senha
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        permissions: foundUser.permissions
      };
      
      // Gerar token simulado
      const token = `mock_token_${Date.now()}_${foundUser.id}`;
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Configurar token padrão para API
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      updateActivity();
      
      return userData;
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout pública
  const logout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // Verificar permissões
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  // Verificar role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Resetar timeout manualmente
  const resetTimeout = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        hasPermission,
        hasRole,
        resetTimeout,
        lastActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};