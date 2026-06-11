// ============================================================
//  DIALOGUE MANAGER — 对话推进逻辑（纯数据层，无 UI 依赖）
// ============================================================

const SAVE_KEY_PREFIX = 'galgame_v2_save_';

export class DialogueManager {
  constructor(story) {
    this.story = story;
    this.reset();
  }

  reset() {
    this.currentNode = this.story.startNode;
    this.entryIndex = 0;
    this.flags = {};
    this.history = [];    // [{node, entryIndex}]
    this.backlog = [];    // [{char, text}]
    this.ended = false;
  }

  get node() {
    return this.story.nodes[this.currentNode] || null;
  }

  get currentEntry() {
    const n = this.node;
    if (!n || !n.entries) return null;
    if (this.entryIndex < n.entries.length) {
      return n.entries[this.entryIndex];
    }
    return null;
  }

  get isAtChoices() {
    const n = this.node;
    return !!(n && n.choices && this.entryIndex >= (n.entries ? n.entries.length : 0));
  }

  get isAtEnding() {
    const n = this.node;
    return !!(n && n.ending);
  }

  /**
   * 推进对话。返回值：
   *   { type: 'dialogue', entry } — 显示对话条目
   *   { type: 'choices' }        — 显示选项
   *   { type: 'ending' }         — 进入结局
   *   { type: 'end' }            — 没有更多内容
   */
  advance() {
    const n = this.node;
    if (!n) return { type: 'end' };

    // 如果有结局，展示结局
    if (n.ending) return { type: 'ending' };

    // 如果在对话条目中
    if (n.entries && this.entryIndex < n.entries.length) {
      const entry = n.entries[this.entryIndex];
      this.entryIndex++;
      this.backlog.push({ char: entry.char, text: entry.text });

      if (this.entryIndex >= n.entries.length) {
        if (n.choices) return { type: 'choices' };
        if (n.next) return { type: 'end_of_node' };
      }
      return { type: 'dialogue', entry };
    }

    // 当前节点只有选择，没有对话条目 → 直接返回 'choices'
    if (n.choices && (!n.entries || this.entryIndex >= n.entries.length)) {
      return { type: 'choices' };
    }

    // 没有更多条目，自动跳转
    if (n.next) {
      this.goTo(n.next);
      return this.advance();
    }

    return { type: 'end' };
  }

  goTo(nodeId) {
    this.history.push({ node: this.currentNode, entryIndex: this.entryIndex });
    this.currentNode = nodeId;
    this.entryIndex = 0;
  }

  makeChoice(choiceIndex) {
    const n = this.node;
    if (!n || !n.choices) return false;
    const option = n.choices.options[choiceIndex];
    if (!option) return false;
    this.goTo(option.next);
    return true;
  }

  /** 获取当前角色信息 */
  getCharInfo(entry) {
    if (!entry || !entry.char) return null;
    for (const cid of Object.keys(this.story.characters)) {
      if (this.story.characters[cid].name === entry.char) {
        return this.story.characters[cid];
      }
    }
    return null;
  }

  // ---- 存档系统 ----
  serialize() {
    return {
      currentNode: this.currentNode,
      entryIndex: this.entryIndex,
      flags: { ...this.flags },
      backlog: this.backlog.slice(-200),
      timestamp: Date.now(),
    };
  }

  deserialize(data) {
    if (!data) return false;
    this.currentNode = data.currentNode || this.story.startNode;
    this.entryIndex = data.entryIndex || 0;
    this.flags = data.flags || {};
    this.backlog = data.backlog || [];
    this.history = [];
    this.ended = false;
    return true;
  }

  save(slot) {
    const data = this.serialize();
    // 添加摘要信息
    const node = this.node;
    if (node) {
      if (node.ending) {
        data.summary = `[结局] ${node.ending.title}`;
      } else if (this.currentEntry) {
        const prefix = this.currentEntry.char ? this.currentEntry.char + ': ' : '';
        data.summary = prefix + this.currentEntry.text.slice(0, 30);
      }
      const bg = this.story.backgrounds[node.bg];
      if (bg) data.bgLabel = bg.label || '';
    }
    try {
      localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
    } catch (e) {
      console.warn('存档失败:', e);
    }
  }

  load(slot) {
    try {
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  hasAnySave() {
    try {
      return !!localStorage.getItem(SAVE_KEY_PREFIX + '0');
    } catch (e) {
      return false;
    }
  }
}
