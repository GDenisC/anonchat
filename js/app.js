let app = {
    message: document.getElementById('message'),
    modules: new Map(),
    module: null,
    chats: document.getElementById('chats'),
    messages: document.getElementById('messages'),
    messageInput: document.getElementById('messageInput')
};

function setScreenCenter(text = null) {
    if (text) {
        app.message.style.display = 'flex';
        app.message.innerText = text;
    } else {
        app.message.style.display = 'none';
        app.message.innerText = '';
    }
};

function setChatMessage(message = null) {
    app.messages.innerHTML = ''
    if (message) {
        let div = document.createElement('div');
        div.className = 'flex w-full h-full items-center justify-center text-2xl font-semibold select-none';
        div.innerText = message;
        app.messages.appendChild(div);
    }
}

class PageModule {
    init() {}
    close() {}
};

function registerModule(mod, name) {
    app.modules.set(name, new mod());
}

class LoadingModule extends PageModule {
    init() {
        setScreenCenter('Loading...');
        sendRequest('GET', serverHost + '/test')
        .then(res => {
            if (res.status == 'working') {
                gotoPage('app');
            } else {
                setScreenCenter('Something went wrong')
            }
        }).catch(r => {
            console.error(r);
            setScreenCenter('Server is down')
        });
    }

    end() {
        setScreenCenter();
    }
}

class AppModule extends PageModule {
    constructor() {
        super();
        this.socket = null;
        this.last = null;
    }

    async init() {
        setChatMessage('Select chat in the list');
        sendRequest('GET', serverHost + '/chats').then(response => {
            for (let { id, name } of response) {
                let chat = html.chat.create(name);
                chat.addEventListener('click', () => this.setChat(id));
                app.chats.appendChild(chat);
            }
        });
    }

    addMessage(content) {
        app.messages.appendChild(html.message.create(content));
    }

    setChat(id) {
        if (this.last === id) return;
        this.last = id;
        if (this.socket) this.socket.close();
        setChatMessage();
        this.socket = new ChatSocket(id);
        this.socket.addEventListener('error', () => {
            setChatMessage('Chat closed');
        });
        this.socket.addEventListener('message', data => {
            let json = JSON.parse(data.data);
            if (json['error']) {
                setChatMessage(json['error'])
                console.error(json['error']);
            } else if (json['message']) {
                let scroll = app.messages.scrollTop >= app.messages.scrollHeight - app.messages.clientHeight
                this.addMessage(json['message']);
                if (scroll) {
                    app.messages.scrollTo(0, app.messages.scrollHeight);
                }
            }
        });
        sendRequest('GET', serverHost + '/chat/' + id + '/messages').then(response => {
            for (let content of response) {
                this.addMessage(content);
            }
            app.messages.scrollTo(0, app.messages.scrollHeight);
        });
        app.messageInput.onkeydown = e => {
            if (e.code == 'Enter' && app.messageInput.value && app.messageInput.value.length < 2048) {
                sendRequest('POST', serverHost + '/chat/' + id + '/messages', { content: app.messageInput.value })
                .then(response => {
                    if (response['error']) {
                        console.error(response['error']);
                    }
                });
                app.messageInput.value = '';
            }
        };
    }
}

registerModule(LoadingModule, 'loading');
registerModule(AppModule, 'app');

function gotoPage(page) {
    page = app.modules.get(page);
    if (app.module) app.module.end();
    page.init();
    app.module = page;
};

gotoPage('loading');