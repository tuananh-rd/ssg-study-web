import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

rep('lib', `function duelLib() {
  if (window.Peer) return Promise.resolve();`, String.raw`// Kết nối qua máy chủ của web (relay): vào được từ mọi mạng, không cần WebRTC/TURN. Giao diện giống PeerJS để dùng lại logic cũ.
function svApi(action, body) {
  return fetch('/api/duel/' + action, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' }, body: JSON.stringify(body) })
    .then(function(r) { return r.json().catch(function() { return {}; }).then(function(j) { j.$status = r.status; return j; }); });
}
function SvEmitter() { this.ev = {}; }
SvEmitter.prototype.on = function(n, f) { (this.ev[n] = this.ev[n] || []).push(f); return this; };
SvEmitter.prototype.emit = function(n, x) { var l = this.ev[n] || []; for (var i = 0; i < l.length; i++) { try { l[i](x); } catch (e) { if (window.console) console.error(e); } } };
function SvConn(peer, remoteId) {
  SvEmitter.call(this); this.p = peer; this.peer = remoteId; this.open = false; this.dead = false;
}
SvConn.prototype = Object.create(SvEmitter.prototype);
SvConn.prototype.send = function(m) {
  var p = this.p, to = p.isHost ? this.peer : 'host', c = this; if (this.dead) return;
  p.q = p.q.then(function() { return svApi('send', { code: p.code, from: p.id, to: to, body: JSON.stringify(m) }); }).catch(function() {});
};
SvConn.prototype.close = function() {
  if (this.dead) return; var p = this.p, to = p.isHost ? this.peer : 'host';
  this.send({ $: p.isHost ? 'kick' : 'leave' });
  this.dead = true; this.open = false;
  if (p.isHost) delete p.conns[this.peer]; else p.stop();
};
function SvPeer(id) {
  SvEmitter.call(this); var self = this;
  this.isHost = typeof id === 'string' && id.indexOf(PEER_PREFIX) === 0;
  this.code = this.isHost ? id.slice(PEER_PREFIX.length) : ''; this.id = this.isHost ? 'host' : 'g' + Math.random().toString(36).slice(2, 10);
  this.conns = {}; this.after = 0; this.q = Promise.resolve(); this.fails = 0; this.stopped = false; this.timer = null;
  if (this.isHost) {
    svApi('host', { code: this.code }).then(function(j) {
      if (j.$status === 409) return self.emit('error', { type: 'unavailable-id' });
      if (!j.ok) return self.emit('error', { type: 'server-error' });
      self.emit('open', id); self.loop();
    }, function() { self.emit('error', { type: 'network' }); });
  } else setTimeout(function() { self.emit('open', self.id); }, 0);
}
SvPeer.prototype = Object.create(SvEmitter.prototype);
SvPeer.prototype.connect = function(target) {
  var self = this, c = new SvConn(this, 'host'); this.code = target.slice(PEER_PREFIX.length); this.hostConn = c;
  svApi('join', { code: this.code, id: this.id }).then(function(j) {
    if (j.$status === 404) return self.emit('error', { type: 'peer-unavailable' });
    if (!j.ok) return self.emit('error', { type: 'server-error' });
    c.open = true; c.emit('open'); self.loop();
  }, function() { self.emit('error', { type: 'network' }); });
  return c;
};
SvPeer.prototype.loop = function() {
  var self = this; if (this.stopped) return;
  clearTimeout(this.timer);
  this.timer = setTimeout(function() {
    if (self.stopped) return;
    svApi('poll', { code: self.code, me: self.id, after: self.after }).then(function(j) {
      if (self.stopped) return;
      if (j.$status === 401) { self.stop(); return self.emit('error', { type: 'network' }); }
      self.fails = 0; self.after = j.after || self.after;
      if (self.isHost) {
        if (j.closed) { self.stop(); return self.emit('error', { type: 'server-error' }); }
        (j.msgs || []).forEach(function(r) { self.deliver(r.body); });
        (j.gone || []).forEach(function(g) { var c = self.conns[g]; if (c) { c.dead = true; c.open = false; delete self.conns[g]; c.emit('close'); } });
      } else {
        (j.msgs || []).forEach(function(r) { self.deliver(r.body); });
        if ((j.kicked || !j.hostAlive) && self.hostConn && self.hostConn.open) { var hc = self.hostConn; hc.open = false; hc.dead = true; self.stop(); hc.emit('close'); return; }
      }
      self.loop();
    }, function() {
      self.fails++;
      if (self.fails >= 10) { self.stop(); if (self.isHost) self.emit('error', { type: 'network' }); else if (self.hostConn) { self.hostConn.open = false; self.hostConn.emit('close'); } return; }
      self.loop();
    });
  }, 600);
};
SvPeer.prototype.deliver = function(body) {
  var env; try { env = JSON.parse(body); } catch (e) { return; } var m = env.m, f = env.f; if (!m) return;
  if (this.isHost) {
    var c = this.conns[f];
    if (m.$ === 'join') {
      if (c) return;
      c = this.conns[f] = new SvConn(this, f); c.open = true; this.emit('connection', c); c.emit('open'); return;
    }
    if (!c) return;
    if (m.$ === 'leave') { c.dead = true; c.open = false; delete this.conns[f]; c.emit('close'); return; }
    c.emit('data', m);
  } else if (this.hostConn) {
    if (m.$ === 'kick') { var hc = this.hostConn; hc.open = false; hc.dead = true; this.stop(); hc.emit('close'); return; }
    this.hostConn.emit('data', m);
  }
};
SvPeer.prototype.stop = function() { this.stopped = true; clearTimeout(this.timer); };
SvPeer.prototype.reconnect = function() {};
SvPeer.prototype.destroy = function() {
  var self = this, wasHost = this.isHost && !this.stopped; this.stopped = true; clearTimeout(this.timer);
  if (wasHost) { this.q = this.q.then(function() { return svApi('close', { code: self.code }); }).catch(function() {}); }
};
function duelLib() {
  if (window.AI_SERVER) { window.Peer = SvPeer; return Promise.resolve(); }
  if (window.Peer) return Promise.resolve();`);
fs.writeFileSync(W + 'app.js', a);
console.log(miss.length ? 'THIẾU ' + miss : 'ok');
