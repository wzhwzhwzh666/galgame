// ============================================================
//  BOOT SCENE — 資源預加載，載完後點擊開始（一擊解鎖音頻 + 進入標題）
// ============================================================

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    var w = this.cameras.main.width, h = this.cameras.main.height;
    var cx = w / 2, cy = h / 2;

    this.cameras.main.setBackgroundColor('#0a0a0e');

    // 標題
    this.add.text(cx, cy - 60, '黄昏教室', {
      fontFamily: '"Noto Serif SC", Georgia, serif',
      fontSize: '28px', color: '#c8a882', letterSpacing: '0.15em',
    }).setOrigin(0.5);

    // 進度條
    var barW = 320, barH = 4, barX = cx - barW / 2, barY = cy + 20;
    var barBg = this.add.graphics();
    barBg.fillStyle(0x222233, 1);
    barBg.fillRoundedRect(barX, barY, barW, barH, 2);
    var barFill = this.add.graphics();

    var loadText = this.add.text(cx, cy - 20, 'Loading...', {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '13px', color: '#666',
    }).setOrigin(0.5);

    this.load.on('progress', function(value) {
      barFill.clear();
      barFill.fillStyle(0xc8a882, 1);
      barFill.fillRoundedRect(barX, barY, barW * value, barH, 2);
      loadText.setText('Loading... ' + Math.floor(value * 100) + '%');
    });

    // 只預載 BGM
    var story = window.__VN?.story;
    if (story) {
      for (var key in story.bgm) {
        var track = story.bgm[key];
        var src = track.src || track.ogg;
        if (src) this.load.audio('bgm_' + key, src);
      }
    }

    this.load.on('loaderror', function(file) {
      console.warn('[Boot] 資源加載失敗: ' + file.key);
    });
  }

  create() {
    window.__VN._failedAssets = new Set();
    window.__VN._ready = true;

    var w = this.cameras.main.width, h = this.cameras.main.height;
    var cx = w / 2, cy = h / 2;

    // 「點擊開始」提示
    var clickText = this.add.text(cx, cy + 60, '— 点击屏幕开始 —', {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '14px', color: '#c8a882',
      letterSpacing: '0.15em',
    }).setOrigin(0.5);

    // 呼吸動畫
    this.tweens.add({
      targets: clickText, alpha: 0.3,
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    var self = this;
    var goTitle = function(e) {
      // 防止菜單按鈕之類的穿透
      if (e && e.target && (e.target.closest('button') || e.target.closest('#ui-overlay'))) return;

      self.input.off('pointerdown', goTitle);
      document.removeEventListener('keydown', goTitle);

      // 轉場
      self.tweens.add({
        targets: self.cameras.main, alpha: 0, duration: 500,
        onComplete: function() {
          self.scene.start('TitleScene');
        },
      });
    };

    this.input.on('pointerdown', goTitle);
    document.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.key === 'Enter') goTitle(e);
    });
  }
}
