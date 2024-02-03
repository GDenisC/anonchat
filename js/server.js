async function sendRequest(method, url, data = {}) {
    let req = await fetch(url, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: Object.keys(data).length > 0 ? JSON.stringify(data) : undefined
    });
    try {
        return await req.json();
    } catch {
        return {};
    }
}

const hostname = 'localhost:2525';

class ChatSocket {
    constructor(id) {
        this.ws = new WebSocket("ws://" + hostname + "/chat/" + id);
    }

    close() {
        this.ws.close();
    }

    addEventListener(name, f) {
        switch (name) {
            case 'open':
                this.ws.addEventListener('open', f);
                break;
            case 'message':
                this.ws.addEventListener('message', f);
                break;
            case 'close':
                this.ws.addEventListener('close', f);
                break;
        }
    }
}

let serverHost = 'http://' + hostname;