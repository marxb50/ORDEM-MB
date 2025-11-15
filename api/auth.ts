
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    const users: User[] = (await kv.get('users')) || [];

    if (req.method === 'POST') {
      const { name, email, password, profileType } = req.body;

      if (action === 'register') {
        if (users.some(u => u.email === email)) {
          return res.status(409).json({ message: 'Usuário com este e-mail já existe' });
        }
        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          passwordHash: password, // In a real app, hash this password securely
          profileType,
        };
        const updatedUsers = [...users, newUser];
        await kv.set('users', updatedUsers);
        return res.status(201).json(newUser);
      }

      if (action === 'login') {
        const foundUser = users.find(u => u.email === email && u.passwordHash === password);
        if (!foundUser) {
          return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        return res.status(200).json(foundUser);
      }
    }
    
    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
