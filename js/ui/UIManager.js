// ============================================================
//  UI MANAGER — DOM Overlay 事件绑定与状态管理
//  设置面板 / 存档读档 / 对话履历 / 快捷菜单
// ============================================================
import { audio } from '../engine/AudioManager.js';

const SPEED_LABELS = ['', '最慢', '慢', '中', '快', '最快'];

export class UIManager {
  constructor() {
    /** DOM refs */
    this.$settings = null;
    this.$saveload = null;
    this.$backlog = null;
    this.$quickMenu = null;
    this.$textboxContainer = null;

    /** 状态 */
    this.saveMode = 'save'; // 'save' | 'load'
    this.autoMode = false;
    this.autoTimer = null;

    this._bound = false;
  }

  /**
   * 在 Phaser Game 创建后调用一次
   */
  init() {
    if (this._bound) return;
    this._bound = true;

    this.$settings = document.getElementById('settings-overlay');
    this.$saveload = document.getElementById('saveload-overlay');
    this.$backlog = document.getElementById('backlog-overlay');
    this.$quickMenu = document.getElementById('quick-menu');
    this.$textboxContainer = document.getElementById('textbox-container');

    this._bindQuickMenu();
    this._bindSettings();
    this._bindSaveLoad();
    this._bindBacklog();

    // 初始恢复设置值
    this._restoreSettings();
  }

  // ==================== Quick Menu ====================
  _bindQuickMenu() {
    document.getElementById('btn-backlog')?.addEventListener('click', () => this.openBacklog());
    document.getElementById('btn-save')?.addEventListener('click', () => this.openSaveLoad('save'));
    document.getElementById('btn-load')?.addEventListener('click', () => this.openSaveLoad('load'));
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());
  }

  // ==================== Settings ====================
  _bindSettings() {
    document.getElementById('btn-settings-close')?.addEventListener('click', () => this.closeSettings());

    const speedSlider = document.getElementById('speed-slider');
    speedSlider?.addEventListener('input', () => {
      const v = parseInt(speedSlider.value);
      document.getElementById('speed-label').textContent = SPEED_LABELS[v] || '中';
      this._saveSettings();
    });

    const bgmSlider = document.getElementById('bgm-vol-slider');
    bgmSlider?.addEventListener('input', () => {
      const v = parseInt(bgmSlider.value) / 100;
      document.getElementById('bgm-vol-label').textContent = Math.round(v * 100) + '%';
      audio.setBGMVolume(v);
    });

    const voiceSlider = document.getElementById('voice-vol-slider');
    voiceSlider?.addEventListener('input', () => {
      const v = parseInt(voiceSlider.value) / 100;
      document.getElementById('voice-vol-label').textContent = Math.round(v * 100) + '%';
      audio.setVoiceVolume(v);
    });

    document.getElementById('btn-auto-mode')?.addEventListener('click', (e) => {
      this.autoMode = !this.autoMode;
      e.target.textContent = this.autoMode ? '开启' : '关闭';
      if (this.autoMode) {
        e.target.classList.add('active');
      } else {
        e.target.classList.remove('active');
        if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }
      }
    });
  }

  openSettings() {
    this.$settings?.classList.remove('hidden');
  }

  closeSettings() {
    this.$settings?.classList.add('hidden');
  }

  _restoreSettings() {
    try {
      const raw = localStorage.getItem('galgame_v2_settings');
      if (raw) {
        const data = JSON.parse(raw);
        // 文字速度
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) speedSlider.value = data.textSpeed || 3;
        document.getElementById('speed-label').textContent = SPEED_LABELS[data.textSpeed || 3] || '中';
        // 音量（AudioManager 自己会从 localStorage 读，但滑块需要同步）
        const bgmSlider = document.getElementById('bgm-vol-slider');
        if (bgmSlider) bgmSlider.value = Math.round(audio.bgmVolume * 100);
        document.getElementById('bgm-vol-label').textContent = Math.round(audio.bgmVolume * 100) + '%';
        const voiceSlider = document.getElementById('voice-vol-slider');
        if (voiceSlider) voiceSlider.value = Math.round(audio.voiceVolume * 100);
        document.getElementById('voice-vol-label').textContent = Math.round(audio.voiceVolume * 100) + '%';
      }
    } catch (e) { /* ignore */ }
  }

  _saveSettings() {
    try {
      const speedSlider = document.getElementById('speed-slider');
      localStorage.setItem('galgame_v2_settings', JSON.stringify({
        textSpeed: speedSlider ? parseInt(speedSlider.value) : 3,
      }));
    } catch (e) { /* ignore */ }
  }

  /** 获取当前文字速度 (1-5) */
  getTextSpeed() {
    const slider = document.getElementById('speed-slider');
    return slider ? parseInt(slider.value) : 3;
  }

  // ==================== Save / Load ====================
  _bindSaveLoad() {
    document.getElementById('btn-saveload-close')?.addEventListener('click', () => this.closeSaveLoad());
  }

  openSaveLoad(mode) {
    this.saveMode = mode;
    const title = document.getElementById('saveload-title');
    if (title) title.textContent = mode === 'save' ? '存 档' : '读 档';
    this._renderSaveSlots();
    this.$saveload?.classList.remove('hidden');
  }

  closeSaveLoad() {
    this.$saveload?.classList.add('hidden');
  }

  _renderSaveSlots() {
    const container = document.getElementById('save-slots');
    if (!container) return;

    const dm = window.__VN?.dialogue;
    if (!dm) return;

    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const data = dm.load(i);
      const slot = document.createElement('div');
      slot.className = 'save-slot' + (data ? '' : ' empty');

      const num = document.createElement('span');
      num.className = 'save-slot-num';
      num.textContent = '#' + (i + 1);

      const info = document.createElement('span');
      info.className = 'save-slot-info';
      if (data && data.summary) {
        info.textContent = data.summary;
      } else if (data) {
        info.textContent = '—';
      } else {
        info.textContent = '空';
      }

      const date = document.createElement('span');
      date.className = 'save-slot-date';
      if (data && data.timestamp) {
        date.textContent = new Date(data.timestamp).toLocaleString('zh-CN');
      }

      slot.appendChild(num);
      slot.appendChild(info);
      slot.appendChild(date);

      slot.addEventListener('click', () => {
        if (this.saveMode === 'save') {
          dm.save(i);
          this._renderSaveSlots();
        } else {
          // 读档
          if (data) {
            dm.deserialize(data);
            this.closeSaveLoad();
            // 通知 GameScene 重绘
            this._notifyGameScene();
          }
        }
      });

      container.appendChild(slot);
    }
  }

  _notifyGameScene() {
    // 通过 Phaser 场景管理器触发重绘
    const game = window.__VN?._game;
    if (!game) return;
    const scene = game.scene.getScene('GameScene');
    if (scene && scene.scene.isActive()) {
      scene.renderScene();
      scene.advanceGame();
      return;
    }
    // 如果在标题画面读档 → DM 已经加载了状态，直接过渡到游戏
    const titleScene = game.scene.getScene('TitleScene');
    if (titleScene && titleScene.scene.isActive()) {
      // 停止标题 BGM，过渡到游戏场景
      const { audio } = window.__VN;
      if (audio) audio.stopBGM(600);
      titleScene.cameras.main.setAlpha(1);
      titleScene.tweens.add({
        targets: titleScene.cameras.main,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          titleScene.scene.start('GameScene');
        },
      });
    }
  }

  // ==================== Backlog ====================
  _bindBacklog() {
    document.getElementById('backlog-close')?.addEventListener('click', () => this.closeBacklog());
  }

  openBacklog() {
    const dm = window.__VN?.dialogue;
    if (!dm) return;

    const content = document.getElementById('backlog-content');
    if (!content) return;

    content.innerHTML = '';
    dm.backlog.forEach((entry) => {
      const div = document.createElement('div');
      div.className = 'backlog-entry';
      if (entry.char) {
        const charEl = document.createElement('div');
        charEl.className = 'backlog-char';
        charEl.textContent = entry.char;
        div.appendChild(charEl);
      }
      const textEl = document.createElement('div');
      textEl.className = 'backlog-text';
      textEl.textContent = entry.text;
      div.appendChild(textEl);
      content.appendChild(div);
    });

    // 滚动到底部
    const overlay = document.getElementById('backlog-overlay');
    if (overlay) {
      overlay.scrollTop = overlay.scrollHeight;
    }

    this.$backlog?.classList.remove('hidden');
  }

  closeBacklog() {
    this.$backlog?.classList.add('hidden');
  }
}

// 全局单例
export const uiManager = new UIManager();
