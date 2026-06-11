// Audio Manager — HTML5 Audio, 最简方案
var VOL_KEY = 'galgame_v2_volume';

var AudioManager = function() {
  this.bgmVolume = 0.7;
  this.voiceVolume = 0.8;
  this.currentBGM = null;
  this.currentBGMKey = null;
  this.currentVoice = null;
  this._fadeTimer = null;
  this._unlocked = false;

  try {
    var d = JSON.parse(localStorage.getItem(VOL_KEY));
    if (d) { this.bgmVolume = d.bgm || 0.7; this.voiceVolume = d.voice || 0.8; }
  } catch(e) {}

  // 尽早监听用户手势，Boot 点击即解锁
  var self = this;
  var unlock = function() {
    if (self._unlocked) return;
    self._unlocked = true;
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
    // 如果有已載好的 BGM 還沒播，現在補上
    if (self.currentBGM && self.currentBGMKey) {
      var t = window.__VN?.story?.bgm[self.currentBGMKey];
      var base = t ? (t.volume || 0.7) : 1;
      self.currentBGM.volume = base * self.bgmVolume;
      self.currentBGM.play().catch(function() {});
    }
  };
  document.addEventListener('click', unlock);
  document.addEventListener('touchstart', unlock);
  document.addEventListener('keydown', unlock);
};

AudioManager.prototype.init = function() {
  // 解鎖監聽器已在構造時註冊，這裡無需額外操作
};

AudioManager.prototype.playBGM = function(key, crossfadeMs) {
  if (!crossfadeMs) crossfadeMs = 1500;
  var s = window.__VN?.story;
  if (!s || !s.bgm[key]) return;

  if (this.currentBGMKey === key && this.currentBGM && !this.currentBGM.paused) return;

  var t = s.bgm[key];
  var src = t.src;
  this.currentBGMKey = key;

  var self = this;

  // 停止旧 BGM
  if (this.currentBGM) {
    try { this.currentBGM.pause(); this.currentBGM.src = ''; } catch(e) {}
    this.currentBGM = null;
  }

  var a = new Audio();
  a.loop = true;
  a.volume = (t.volume || 0.7) * self.bgmVolume;
  this.currentBGM = a;

  a.oncanplaythrough = function() {
    if (self.currentBGM !== a) return;
    // 仅当用户已解锁后才自动播放
    if (self._unlocked) {
      a.play().catch(function() {});
    }
  };
  a.onerror = function() {
    console.warn('[Audio] 加载失败: ' + key + ' -> ' + src);
  };
  a.src = src;
  a.load();
};

AudioManager.prototype.stopBGM = function(fadeMs) {
  if (this._fadeTimer) { clearInterval(this._fadeTimer); this._fadeTimer = null; }
  var bgm = this.currentBGM;
  this.currentBGM = null;
  this.currentBGMKey = null;
  if (bgm) {
    try { bgm.pause(); } catch(e) {}
    bgm.src = '';
  }
};

AudioManager.prototype.playVoice = function(src) {
  if (!src) return;
  this.stopVoice();
  var a = new Audio();
  a.volume = this.voiceVolume;
  var self = this;
  this.currentVoice = a;
  a.oncanplaythrough = function() { a.play().catch(function() {}); };
  a.onended = function() { a.src = ''; };
  a.src = src;
  a.load();
};

AudioManager.prototype.stopVoice = function() {
  if (this.currentVoice) {
    try { this.currentVoice.pause(); } catch(e) {}
    this.currentVoice.src = '';
    this.currentVoice = null;
  }
};

AudioManager.prototype.setBGMVolume = function(v) {
  this.bgmVolume = Math.max(0, Math.min(1, v));
  if (this.currentBGM && !this.currentBGM.paused) {
    var t = window.__VN?.story?.bgm[this.currentBGMKey];
    var base = t ? (t.volume || 0.7) : 1;
    this.currentBGM.volume = base * this.bgmVolume;
  }
  try { localStorage.setItem(VOL_KEY, JSON.stringify({ bgm: this.bgmVolume, voice: this.voiceVolume })); } catch(e) {}
};

AudioManager.prototype.setVoiceVolume = function(v) {
  this.voiceVolume = Math.max(0, Math.min(1, v));
  try { localStorage.setItem(VOL_KEY, JSON.stringify({ bgm: this.bgmVolume, voice: this.voiceVolume })); } catch(e) {}
};

export var audio = new AudioManager();
