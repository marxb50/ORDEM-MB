
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Solicitation } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const solicitations: Solicitation[] = (await kv.get('solicitations')) || [];

        if (req.method === 'GET') {
            return res.status(200).json(solicitations);
        }

        if (req.method === 'POST') {
            const newSolicitation = req.body as Solicitation;
            const updatedSolicitations = [...solicitations, newSolicitation];
            await kv.set('solicitations', updatedSolicitations);
            return res.status(201).json(newSolicitation);
        }

        if (req.method === 'PUT') {
            const updatedSolicitation = req.body as Solicitation;
            const updatedList = solicitations.map(s => 
                s.id === updatedSolicitation.id ? updatedSolicitation : s
            );
            await kv.set('solicitations', updatedList);
            return res.status(200).json(updatedSolicitation);
        }
        
        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
