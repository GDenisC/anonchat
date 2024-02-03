import { openDatabase, SQL } from './db.js';

const chatActivity = new Map();

export const broadcastMessage = (chat, message) => {
    message = JSON.stringify({ message });
    const sockets = chatActivity.get(chat);
    if (!sockets) return;
    for (const socket of sockets) {
        socket.send(message);
    }
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async app => {
    app.get('/chat/:id', { websocket: true }, async (connection, req) => {
        const { id } = req.params;
        if (!id || typeof id != 'string') {
            return connection.socket.close();
        }
        const db = await openDatabase();
        let chats = await db.all(SQL`SELECT id FROM chats`);
        await db.close();
        if (!chats.some(c => c.id == id)) {
            connection.socket.send(JSON.stringify({ error: 'Chat not found' }));
            return connection.socket.close();
        }
        if (!chatActivity.has(id)) {
            chatActivity.set(id, [connection.socket]);
        } else {
            chatActivity.get(id).push(connection.socket);
        }
        connection.socket.on('close', () => {
            chatActivity.get(id).splice(chatActivity.get(id).indexOf(connection.socket), 1);
        });
    });
};