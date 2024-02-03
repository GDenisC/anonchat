import fastify from 'fastify';
import websocket from '@fastify/websocket';
import processWebsocket, { broadcastMessage } from './ws.js';
import { openDatabase, SQL } from './db.js';

const app = fastify({ logger: { level: 'warn' } });
app.register(websocket);
app.register(processWebsocket);

app.addHook('preHandler', (_, res, done) => {
    res.header('access-control-allow-origin', '*');
    res.header('access-control-allow-methods', 'GET, POST');
    res.header('access-control-allow-headers', 'Origin, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin, Authorization');
    res.header('content-type', 'application/json; charset=utf-8');
    done();
});

const options = name => app.options(name, (_, res) => res.status(200).send());

options('/test');
app.get('/test', (_, res) => res.status(200).send({ status: 'working' }));

options('/chats');
app.get('/chats', async (_, res) => {
    const db = await openDatabase();
    const chats = await db.all(SQL`SELECT id, name FROM chats`);
    await db.close();
    res.status(200).send(chats);
});

options('/chat/:id/messages');
app.get('/chat/:id/messages', async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != 'string') {
        return res.status(400).send({ error: 'Invalid chat id' });
    }
    const db = await openDatabase();
    const messages = await db.all(SQL`SELECT content FROM messages WHERE chat=${id}`);
    await db.close();
    res.status(200).send(messages.map(m => m.content));
});
app.post('/chat/:id/messages', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!id || typeof id != 'string') {
        return res.status(400).send({ error: 'Invalid chat id' });
    }
    if (!content || typeof content != 'string') {
        return res.status(400).send({ error: 'Invalid message content' });
    }
    res.status(201).send();
    openDatabase().then(db => {
        db.run(SQL`INSERT INTO messages (chat, content) VALUES (${id}, ${content})`)
        .then(() => db.close())
    });
    broadcastMessage(id, content);
});

app.listen({ port: 2525 }, err => {
    if (err) throw err;
    console.log("Server started at port 2525, if you want change it in index.js dont forget to change it in client too");
});