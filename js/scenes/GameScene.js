// ============================================================
//  GAME SCENE — 核心游戏画面
// ============================================================
import { audio } from '../engine/AudioManager.js';
import { uiManager } from '../ui/UIManager.js';

const TWEEN_DURATION = 600;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    audio.init(this);

    this.dm = window.__VN?.dialogue;
    this.story = window.__VN?.story;
    if (!this.dm || !this.story) return;

    this.$wrapper = document.getElementById('game-wrapper');
    this.$textboxContainer = document.getElementById('textbox-container');
    this.$nameTag = document.getElementById('name-tag');
    this.$dialogueText = document.getElementById('dialogue-text');
    this.$clickInd = document.getElementById('click-indicator');
    this.$choicesContainer = document.getElementById('choices-container');
    this.$quickMenu = document.getElementById('quick-menu');

    this.isTyping = false;
    this.typewriterTimer = null;
    this.fullText = '';
    this.displayedLen = 0;
    this.autoTimer = null;
    this.bgImage = null;
    this.bgGradient = null;
    this.activeSprites = {};
    this._spriteContainer = null;

    this._showQuickMenu(true);
    this._showTextBox(false);
    this._hideChoices();

    // 输入事件
    this._boundClick = this._onWrapperClick.bind(this);
    this._boundKey = this._onKeyDown.bind(this);
    this.$wrapper.addEventListener('click', this._boundClick);
    document.addEventListener('keydown', this._boundKey);

    this.events.on('shutdown', () => {
      this.$wrapper.removeEventListener('click', this._boundClick);
      document.removeEventListener('keydown', this._boundKey);
      this._clearTypewriterTimer();
      this._clearAutoTimer();
    });

    // 入场动画
    this.cameras.main.setAlpha(0);
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 500 });

    // 加载资源并开始
    this._loadSceneAssets(() => {
      this.renderScene();
      this.advanceGame();
    });
  }

  // ---- Resource Loading ----
  _loadSceneAssets(onComplete) {
    const node = this.dm.node;
    if (!node) { onComplete(); return; }

    const toLoad = [];
    const bgData = this.story.backgrounds[node.bg];
    if (bgData && bgData.src && !this.textures.exists('bg_' + node.bg)) {
      toLoad.push({ key: 'bg_' + node.bg, src: bgData.src });
    }

    (node.sprites || []).forEach((def) => {
      const charData = this.story.characters[def.char];
      if (!charData) return;
      const expr = def.expression || 'default';
      const key = 'sprite_' + def.char + '_' + expr;
      const src = charData.sprites[expr];
      if (src && !this.textures.exists(key)) {
        toLoad.push({ key, src });
      }
    });

    if (toLoad.length === 0) { onComplete(); return; }

    var loaded = 0;
    var self = this;
    // 超时保护：3 秒后强制完成
    var timeout = setTimeout(function() {
      if (loaded < toLoad.length) {
        loaded = toLoad.length;
        onComplete();
      }
    }, 3000);

    toLoad.forEach(function(item) {
      var key = item.key;
      var src = item.src;
      var img = new Image();
      img.onload = function() {
        if (!self.textures.exists(key)) self.textures.addImage(key, img);
        loaded++;
        if (loaded >= toLoad.length) { clearTimeout(timeout); onComplete(); }
      };
      img.onerror = function() {
        loaded++;
        if (loaded >= toLoad.length) { clearTimeout(timeout); onComplete(); }
      };
      img.src = src;
    });
  }

  _removeWhiteBg(textureKey, originalImg) {
    try {
      var canvas = document.createElement('canvas');
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(originalImg, 0, 0);
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i], g = data[i+1], b = data[i+2];
        // 只处理接近纯白的像素，角色肤色不动
        if (r > 245 && g > 245 && b > 245) {
          data[i+3] = 0;
        } else if (r > 230 && g > 230 && b > 230 && r < 250) {
          // 反锯齿白边：按白色程度半透明
          var whiteness = (r + g + b) / 3;
          var newAlpha = Math.max(0, Math.round(255 * (whiteness - 235) / 20));
          data[i+3] = Math.min(data[i+3], newAlpha);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      if (this.textures.exists(textureKey)) this.textures.remove(textureKey);
      this.textures.addImage(textureKey, canvas);
    } catch (e) {
      if (!this.textures.exists(textureKey)) {
        this.textures.addImage(textureKey, originalImg);
      }
    }
  }

  // ---- Scene Rendering ----
  renderScene() {
    var node = this.dm.node;
    if (!node) return;
    var bgId = node.bg;
    var bgData = this.story.backgrounds[bgId];
    var sprites = node.sprites || [];
    this._renderBackground(bgId, bgData);
    if (node.bgm) audio.playBGM(node.bgm);
    this._renderSprites(sprites);
  }

  _renderBackground(bgId, bgData) {
    if (this.bgImage) { this.bgImage.destroy(); this.bgImage = null; }
    if (this.bgGradient) { this.bgGradient.destroy(); this.bgGradient = null; }
    if (!bgData) return;
    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    this.bgGradient = this._createGradientBg(w, h, bgData.gradient);
    this.bgGradient.setDepth(0);
    var textureKey = 'bg_' + bgId;
    if (this.textures.exists(textureKey)) {
      this.bgImage = this.add.image(w / 2, h / 2, textureKey);
      this.bgImage.setDisplaySize(w, h);
      this.bgImage.setDepth(1);
      this.bgImage.setAlpha(0);
      this.tweens.add({ targets: this.bgImage, alpha: 1, duration: TWEEN_DURATION });
    }
  }

  _renderSprites(spriteDefs) {
    var self = this;
    for (var key in this.activeSprites) {
      var s = this.activeSprites[key];
      if (s.image) s.image.destroy();
      if (s.graphics) s.graphics.destroy();
    }
    this.activeSprites = {};
    if (this._spriteContainer) this._spriteContainer.destroy();
    this._spriteContainer = this.add.container(0, 0);
    this._spriteContainer.setDepth(5);

    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var textBoxTop = h * 0.96;

    spriteDefs.forEach(function(def) {
      var charData = self.story.characters[def.char];
      if (!charData) return;
      var expr = def.expression || 'default';
      var textureKey = 'sprite_' + def.char + '_' + expr;
      var pos = def.pos || 'center';
      var state = def.state || 'focus';
      var spriteX;
      if (pos === 'left') spriteX = w * 0.18;
      else if (pos === 'right') spriteX = w * 0.82;
      else spriteX = w * 0.5;

      var spriteHeight = h * (charData.heightRatio || 0.55);
      var spriteBottom = textBoxTop + 10;
      var gfxObj = self._createSpriteFallback(charData, spriteX, spriteBottom, spriteHeight, state);

      if (self.textures.exists(textureKey)) {
        gfxObj.setVisible(false);
        var img = self.add.image(spriteX, spriteBottom, textureKey);
        img.setOrigin(0.5, 1);
        var sy = spriteHeight / img.height;
        var scl = Math.min(sy, w * 0.33 / img.width);
        img.setScale(scl);
        if (state === 'enter') {
          img.setAlpha(0); img.y += 60;
          self.tweens.add({ targets: img, alpha: 1, y: spriteBottom, duration: 700, ease: 'Cubic.easeOut' });
        } else if (state === 'dim') {
          img.setAlpha(0.5); img.setTint(0x999999);
        }
        self._spriteContainer.add(img);
        self.activeSprites[def.char] = { image: img, graphics: gfxObj, pos: pos, expression: expr };
      } else {
        if (charData.sprites[expr]) {
          var img2 = new Image();
          img2.onload = function() {
            if (!self.textures.exists(textureKey)) {
              self.textures.addImage(textureKey, img2);
            }
          };
          img2.src = charData.sprites[expr];
        }
        self._spriteContainer.add(gfxObj);
        self.activeSprites[def.char] = { image: null, graphics: gfxObj, pos: pos, expression: expr };
      }
    });
  }

  _createSpriteFallback(charData, x, bottomY, targetHeight, state) {
    var fb = charData.fallback;
    if (!fb) { var g2 = this.add.graphics(); g2.setVisible(false); return g2; }
    var g = this.add.graphics();
    var scale = targetHeight / 500;
    var headRadius = 37 * scale;
    var headY = bottomY - targetHeight * 0.82;
    g.fillStyle(Phaser.Display.Color.HexStringToColor(fb.skin).color, 1);
    g.fillEllipse(x, headY, headRadius * 2, headRadius * 2.4);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(fb.hair).color, 1);
    g.fillEllipse(x, headY - 5 * scale, headRadius * 2.1, headRadius * 1.5);
    var bodyW = 32 * scale, bodyH = targetHeight * 0.45, bodyTop = headY + headRadius * 1.1;
    g.fillStyle(Phaser.Display.Color.HexStringToColor(fb.outfit).color, 1);
    g.fillRoundedRect(x - bodyW, bodyTop, bodyW * 2, bodyH, 10 * scale);
    var collarW = 18 * scale;
    g.fillStyle(Phaser.Display.Color.HexStringToColor(fb.accent).color, 0.7);
    g.fillRoundedRect(x - collarW, bodyTop - 2 * scale, collarW * 2, 8 * scale, 3 * scale);
    this.tweens.add({ targets: g, y: -4 * scale, duration: 2000 + Math.random() * 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (state === 'enter') {
      g.setAlpha(0); g.y += 60 * scale;
      this.tweens.add({ targets: g, alpha: 1, y: g.y - 60 * scale, duration: 700, ease: 'Cubic.easeOut' });
    }
    if (state === 'dim') g.setAlpha(0.5);
    return g;
  }

  _createGradientBg(w, h, gradientCSS) {
    var g = this.add.graphics();
    var colors = [];
    var re = /#[0-9a-fA-F]{6}/g, m;
    while ((m = re.exec(gradientCSS)) !== null) colors.push(m[0]);
    if (colors.length < 2) {
      var c0 = Phaser.Display.Color.HexStringToColor(colors[0] || '#1a1520').color;
      g.fillStyle(c0, 1); g.fillRect(0, 0, w, h);
      return g;
    }
    var steps = colors.length, stripH = h / (steps - 1);
    for (var i = 0; i < steps - 1; i++) {
      var c1 = Phaser.Display.Color.HexStringToColor(colors[i]);
      var c2 = Phaser.Display.Color.HexStringToColor(colors[i + 1]);
      var y = i * stripH;
      for (var j = 0; j < stripH; j += 2) {
        var t = j / stripH;
        var r = Math.round(c1.red + (c2.red - c1.red) * t);
        var gr = Math.round(c1.green + (c2.green - c1.green) * t);
        var b = Math.round(c1.blue + (c2.blue - c1.blue) * t);
        g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 1);
        g.fillRect(0, y + j, w, 4);
      }
    }
    return g;
  }

  // ---- Dialogue Flow ----
  advanceGame() {
    if (this.dm.isAtEnding) { this.showEnding(); return; }
    var result = this.dm.advance();
    if (result.type === 'dialogue') {
      this.showDialogue(result.entry);
    } else if (result.type === 'choices') {
      this.showChoices();
    } else if (result.type === 'ending') {
      this.showEnding();
    } else if (result.type === 'end_of_node') {
      var self = this;
      this._loadSceneAssets(function() {
        self.renderScene();
        self.advanceGame();
      });
    }
  }

  showDialogue(entry) {
    if (!entry) return;
    this._showTextBox(true);
    this._hideChoices();
    if (entry.char) {
      this.$nameTag.textContent = entry.char;
      this.$nameTag.classList.remove('hidden');
      var charInfo = this.dm.getCharInfo(entry);
      this.$nameTag.style.color = charInfo ? charInfo.color : '#c8a882';
    } else {
      this.$nameTag.classList.add('hidden');
    }
    this.fullText = entry.text;
    this.displayedLen = 0;
    this.$dialogueText.textContent = '';
    this.$clickInd.classList.remove('visible');
    this._startTyping();
    if (entry.voice) audio.playVoice(entry.voice);
    else audio.stopVoice();
  }

  _startTyping() {
    this.isTyping = true;
    this._clearTypewriterTimer();
    var textSpeed = uiManager.getTextSpeed();
    var delays = [0, 80, 50, 30, 15, 5];
    var delay = delays[textSpeed] || 30;
    var self = this;
    var type = function() {
      if (self.displayedLen >= self.fullText.length) { self._finishTyping(); return; }
      self.displayedLen++;
      self.$dialogueText.textContent = self.fullText.slice(0, self.displayedLen);
      self.typewriterTimer = setTimeout(type, delay);
    };
    type();
  }

  _finishTyping() {
    this._clearTypewriterTimer();
    this.displayedLen = this.fullText.length;
    this.$dialogueText.textContent = this.fullText;
    this.isTyping = false;
    this.$clickInd.classList.add('visible');
    if (uiManager.autoMode && !this.dm.isAtChoices && !this.dm.isAtEnding) {
      this._clearAutoTimer();
      var self = this;
      this.autoTimer = setTimeout(function() { self.advanceGame(); }, 2000);
    }
  }

  _clearTypewriterTimer() {
    if (this.typewriterTimer) { clearTimeout(this.typewriterTimer); this.typewriterTimer = null; }
  }

  _clearAutoTimer() {
    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }
  }

  // ---- Choices ----
  showChoices() {
    var node = this.dm.node;
    if (!node || !node.choices) return;
    this._showTextBox(false);
    this.$clickInd.classList.remove('visible');
    this.$choicesContainer.innerHTML = '';
    this.$choicesContainer.classList.remove('hidden');
    var self = this;
    node.choices.options.forEach(function(opt, i) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        self._hideChoices();
        self.dm.makeChoice(i);
        self._loadSceneAssets(function() {
          self.renderScene();
          self.advanceGame();
        });
      });
      self.$choicesContainer.appendChild(btn);
    });
  }

  _hideChoices() {
    this.$choicesContainer.classList.add('hidden');
    this.$choicesContainer.innerHTML = '';
  }

  // ---- Ending ----
  showEnding() {
    this.dm.ended = true;
    this._showTextBox(false);
    this._hideChoices();
    this._showQuickMenu(false);
    audio.stopBGM(1200);
    audio.stopVoice();
    var self = this;
    this.tweens.add({
      targets: this.cameras.main, alpha: 0, duration: 800,
      onComplete: function() {
        self.scene.start('EndingScene', {
          ending: self.dm.node.ending,
          bg: self.dm.node.bg,
        });
      },
    });
  }

  // ---- Input ----
  _onWrapperClick(e) {
    if (this.dm.ended) return;
    if (e.target.closest('button')) return;
    if (e.target.closest('.overlay')) return;
    if (e.target.closest('#backlog-overlay')) return;
    if (e.target.closest('#settings-overlay')) return;
    if (e.target.closest('#saveload-overlay')) return;
    if (e.target.closest('#choices-container') && !e.target.closest('.choice-btn')) return;
    if (this.isTyping) { this._finishTyping(); audio.stopVoice(); }
    else if (!this.dm.isAtChoices) this.advanceGame();
  }

  _onKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      if (this.isTyping) { this._finishTyping(); audio.stopVoice(); }
      else if (!this.dm.isAtChoices) this.advanceGame();
    }
    if (e.key === 'Escape') {
      document.getElementById('settings-overlay').classList.add('hidden');
      document.getElementById('saveload-overlay').classList.add('hidden');
      document.getElementById('backlog-overlay').classList.add('hidden');
    }
  }

  // ---- UI Helpers ----
  _showTextBox(visible) {
    this.$textboxContainer.classList.toggle('hidden', !visible);
  }

  _showQuickMenu(visible) {
    this.$quickMenu.style.opacity = visible ? '1' : '0';
    this.$quickMenu.style.pointerEvents = visible ? 'auto' : 'none';
  }
}
