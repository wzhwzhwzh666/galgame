// ============================================================
//  ENDING SCENE — 结局画面
// ============================================================
import { audio } from '../engine/AudioManager.js';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  init(data) {
    this.endingData = data?.ending || null;
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    audio.init(this);
    this.cameras.main.setBackgroundColor('#0a0a0e');

    // 背景光晕
    this.add.ellipse(cx, height * 0.4, 600, 400, 0xc8a882, 0.03);

    if (!this.endingData) {
      this.add.text(cx, height / 2, '— 完 —', {
        fontFamily: '"Noto Serif SC", Georgia, serif',
        fontSize: '24px', color: '#666',
      }).setOrigin(0.5);
      return;
    }

    const data = this.endingData;

    // 结局类型标签
    const labelText = this.add.text(cx, height * 0.18, data.type || 'END', {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '13px', color: '#c8a882', letterSpacing: '0.3em',
    }).setOrigin(0.5).setAlpha(0);

    // 结局标题
    const titleText = this.add.text(cx, height * 0.24, data.title || '', {
      fontFamily: '"Noto Serif SC", Georgia, serif',
      fontSize: '40px', color: '#e8e0d6', letterSpacing: '0.15em',
    }).setOrigin(0.5).setAlpha(0);

    // 结局正文
    const lines = (data.text || '').split('\n');
    const lineHeight = 28;
    const startY = height * 0.36;
    const maxLines = 16;
    const bodyElements = [];

    lines.slice(0, maxLines).forEach((line, i) => {
      const txt = this.add.text(cx, startY + i * lineHeight, line, {
        fontFamily: '"Noto Serif SC", Georgia, serif',
        fontSize: '16px', color: '#999',
        align: 'center',
        wordWrap: { width: 540 },
      }).setOrigin(0.5, 0).setAlpha(0);
      bodyElements.push(txt);
    });

    // 返回按钮
    const btnY = Math.min(startY + lines.length * lineHeight + 40, height * 0.88);
    const returnBtn = this.add.text(cx, btnY, '返回标题画面', {
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '14px', color: '#c8b8a4', letterSpacing: '0.1em',
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    const btnBg = this.add.graphics();
    btnBg.setAlpha(0);
    returnBtn.on('pointerover', () => {
      btnBg.clear();
      btnBg.lineStyle(1, 0xc8a882, 0.3);
      btnBg.strokeRoundedRect(cx - 70, btnY - 18, 140, 36, 4);
      returnBtn.setColor('#ffffff');
    });
    returnBtn.on('pointerout', () => {
      btnBg.clear();
      returnBtn.setColor('#c8b8a4');
    });
    returnBtn.on('pointerdown', () => this._goToTitle());

    // ---- 动画序列 ----
    // 1. 标签 + 标题先出现
    this.tweens.add({
      targets: [labelText, titleText],
      alpha: 1, duration: 800, delay: 600, ease: 'Power2',
    });

    // 2. 正文逐行淡入
    bodyElements.forEach((el, i) => {
      this.tweens.add({
        targets: el,
        alpha: 1,
        duration: 500,
        delay: 1400 + i * 120,
        ease: 'Power1',
      });
    });

    // 3. 返回按钮最后出现
    const btnDelay = 1600 + bodyElements.length * 120 + 400;
    this.tweens.add({
      targets: [returnBtn, btnBg],
      alpha: 1, duration: 500, delay: btnDelay,
    });

    // 播放结局 BGM
    audio.playBGM('ending');

    // 整体淡入
    this.cameras.main.setAlpha(0);
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 1200 });
  }

  _goToTitle() {
    audio.stopBGM(800);
    this.tweens.add({
      targets: this.cameras.main, alpha: 0, duration: 600,
      onComplete: () => {
        this.scene.start('TitleScene');
      },
    });
  }
}
