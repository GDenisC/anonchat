let html = {};

function add(n, t) {
    html[n] = {};
    html[n].create = t;
}

add('chat', name => {
    let div = document.createElement('div');
    div.className = 'px-2 py-0.5 bg-white/5 hover:bg-white/10 hover:cursor-pointer flex gap-2 items-center';
    let h1 = document.createElement('h1');
    h1.className = 'font-bold text-xl';
    h1.innerText = '#';
    div.appendChild(h1);
    let p = document.createElement('p');
    p.innerText = name;
    div.appendChild(p);
    return div;
});

add('message', content => {
    let div = document.createElement('div');
    div.className = 'p-2 rounded-xl bg-white/5 hover:bg-white/10';
    let div2 = document.createElement('div');
    div2.className = 'flex gap-2';
    let divAvatar = document.createElement('div');
    divAvatar.className = 'bg-black h-4 w-4 rounded-full';
    div2.appendChild(divAvatar);
    let divUsername = document.createElement('div');
    divUsername.className = 'bg-black h-4 w-32 rounded';
    div2.appendChild(divUsername);
    div.appendChild(div2);
    let p = document.createElement('p');
    p.innerText = content;
    div.appendChild(p);
    return div;
});