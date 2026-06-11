// ============================================================
//  TITLE SCENE — 标题画面
// ============================================================
import { audio } from '../engine/AudioManager.js';
import { uiManager } from '../ui/UIManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    var w = this.cameras.main.width;
    var h = this.cameras.main.height;
    var cx = w / 2;
    var cy = h / 2;

    audio.init(this);

    // 暗底兜底
    this.cameras.main.setBackgroundColor('#0a0a0e');

    // 背景图
    if (this.textures.exists('bg_classroom')) {
      var bg = this.add.image(cx, cy, 'bg_classroom');
      bg.setDisplaySize(w, h);
      bg.setDepth(0);
    }

    // 加载并显示标题背景
    var self = this;
    var img = new Image();
    img.onload = function() {
      var key = 'bg_titlescreen';
      if (self.textures.exists(key)) self.textures.remove(key);
      self.textures.addImage(key, img);
      if (self._titleBgImg) self._titleBgImg.destroy();
      self._titleBgImg = self.add.image(cx, cy, key);
      self._titleBgImg.setDisplaySize(w, h);
      self._titleBgImg.setDepth(0);
      if (bg) bg.setAlpha(0);
    };
    img.src = 'assets/bg/title_bg.jpg';

    // 暗色遮罩
    var overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, w, h);
    overlay.setDepth(1);

    // 光晕
    for (var i = 0; i < 3; i++) {
      var gx = w * (0.3 + i * 0.25);
      var gy = h * (0.2 + i * 0.15);
      var glow = this.add.ellipse(gx, gy, 300 + i * 100, 200 + i * 80, 0xc8a882, 0.04);
      glow.setDepth(2);
      this.tweens.add({ targets: glow, alpha: 0.02, duration: 3000 + i * 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // 装饰线
    var lineTop = this.add.graphics();
    lineTop.lineStyle(1, 0xc8a882, 0.2);
    lineTop.lineBetween(cx - 280, cy - 140, cx + 280, cy - 140);
    lineTop.setDepth(3);

    // 副标题
    this.add.text(cx, cy - 165, 'A Visual Novel', {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '13px', color: '#c8a882', letterSpacing: '0.5em',
    }).setOrigin(0.5).setDepth(3);

    // 主标题
    this.add.text(cx, cy - 110, '黄昏教室', {
      fontFamily: '"Noto Serif SC", Georgia, serif',
      fontSize: '58px', color: '#f0e8d8', letterSpacing: '0.18em',
    }).setOrigin(0.5).setDepth(3);

    // 日文
    this.add.text(cx, cy - 60, 'たそがれ教室', {
      fontFamily: '"Noto Serif SC", serif',
      fontSize: '16px', color: 'rgba(200,168,130,0.5)', letterSpacing: '0.3em',
    }).setOrigin(0.5).setDepth(3);

    // 分割线
    var div = this.add.graphics();
    div.lineStyle(1, 0xc8a882, 0.4);
    div.lineBetween(cx - 50, cy - 30, cx + 50, cy - 30);
    div.setDepth(3);

    // 菜单按钮
    var btnY = cy + 30;
    var btnGap = 50;

    this._makeBtn(cx, btnY, '新 游 戏', function() { self._newGame(); });
    this._makeBtn(cx, btnY + btnGap, '继 续 游 戏', function() { self._continueGame(); });
    this._makeBtn(cx, btnY + btnGap * 2, '读 取 存 档', function() { uiManager.openSaveLoad('load'); });
    this._makeBtn(cx, btnY + btnGap * 3, '设    置', function() { uiManager.openSettings(); });

    // 版本号
    this.add.text(cx, h - 30, 'ver 2.0  ·  Phaser.js Engine', {
      fontFamily: '"PingFang SC", sans-serif', fontSize: '11px',
      color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em',
    }).setOrigin(0.5).setDepth(3);

    // BGM + 入场
    audio.playBGM('title');
    this.cameras.main.setAlpha(0);
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 800, ease: 'Power2' });

    uiManager.closeSaveLoad();
    uiManager.closeBacklog();
  }

  _makeBtn(cx, y, text, onClick) {
    var c = this.add.container(cx, y);
    c.setDepth(3);

    var bg = this.add.graphics();
    bg.fillStyle(0x111118, 0.6);
    bg.fillRoundedRect(-100, -20, 200, 40, 6);
    bg.lineStyle(1, 0xc8a882, 0.2);
    bg.strokeRoundedRect(-100, -20, 200, 40, 6);

    var txt = this.add.text(0, 0, text, {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '16px', color: '#c8b8a4', letterSpacing: '0.15em',
    }).setOrigin(0.5);

    var dot = this.add.ellipse(-88, 0, 4, 4, 0xc8a882, 0);

    c.add(bg);
    c.add(txt);
    c.add(dot);
    c.setSize(200, 40);
    c.setInteractive({ useHandCursor: true });

    var self = this;
    c.on('pointerover', function() {
      bg.clear();
      bg.fillStyle(0xc8a882, 0.12);
      bg.fillRoundedRect(-100, -20, 200, 40, 6);
      bg.lineStyle(1, 0xc8a882, 0.5);
      bg.strokeRoundedRect(-100, -20, 200, 40, 6);
      txt.setColor('#ffffff');
      dot.setAlpha(0.8);
      self.tweens.add({ targets: c, scaleX: 1.03, scaleY: 1.03, duration: 200 });
    });

    c.on('pointerout', function() {
      bg.clear();
      bg.fillStyle(0x111118, 0.6);
      bg.fillRoundedRect(-100, -20, 200, 40, 6);
      bg.lineStyle(1, 0xc8a882, 0.2);
      bg.strokeRoundedRect(-100, -20, 200, 40, 6);
      txt.setColor('#c8b8a4');
      dot.setAlpha(0);
      self.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 200 });
    });

    c.on('pointerdown', onClick);
  }

  _newGame() {
    var dm = window.__VN?.dialogue;
    if (dm) dm.reset();
    this._transitionToGame();
  }

  _continueGame() {
    var dm = window.__VN?.dialogue;
    if (!dm) return this._newGame();
    var data = dm.load(0);
    if (!data) return this._newGame();
    dm.deserialize(data);
    this._transitionToGame();
  }

  _transitionToGame() {
    var self = this;
    this.tweens.add({
      targets: this.cameras.main, alpha: 0, duration: 500,
      onComplete: function() { audio.stopBGM(800); self.scene.start('GameScene'); },
    });
  }
}
