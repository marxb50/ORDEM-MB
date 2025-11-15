
import { User, Solicitation } from '../types';

const USERS_KEY = 'selim_users';
const SOLICITATIONS_KEY = 'selim_solicitations';
const SESSION_KEY = 'selim_session';

// --- User Management ---

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

// --- Solicitation Management ---

export const getSolicitations = (): Solicitation[] => {
  const solicitations = localStorage.getItem(SOLICITATIONS_KEY);
  return solicitations ? JSON.parse(solicitations) : [];
};

export const saveSolicitations = (solicitations: Solicitation[]): void => {
  localStorage.setItem(SOLICITATIONS_KEY, JSON.stringify(solicitations));
};

export const addSolicitation = (solicitation: Solicitation): void => {
  const solicitations = getSolicitations();
  solicitations.push(solicitation);
  saveSolicitations(solicitations);
};

export const updateSolicitation = (updatedSolicitation: Solicitation): void => {
  let solicitations = getSolicitations();
  solicitations = solicitations.map(s => s.id === updatedSolicitation.id ? updatedSolicitation : s);
  saveSolicitations(solicitations);
};


// --- Session Management ---

export const saveSession = (user: User): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getSession = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
