
import { Solicitation } from '../types';
import { User } from '../types';

// This service now acts as an API client.

// --- Solicitation Management via API ---

export const getSolicitations = async (): Promise<Solicitation[]> => {
  const response = await fetch('/api/solicitations');
  if (!response.ok) {
    throw new Error('Failed to fetch solicitations');
  }
  return response.json();
};

export const addSolicitation = async (solicitation: Solicitation): Promise<Solicitation> => {
  const response = await fetch('/api/solicitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solicitation),
  });
  if (!response.ok) {
    throw new Error('Failed to add solicitation');
  }
  return response.json();
};

export const updateSolicitation = async (updatedSolicitation: Solicitation): Promise<Solicitation> => {
    const response = await fetch('/api/solicitations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSolicitation),
    });
    if (!response.ok) {
        throw new Error('Failed to update solicitation');
    }
    return response.json();
};

// --- Session Management (remains client-side) ---

const SESSION_KEY = 'selim_session';

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
