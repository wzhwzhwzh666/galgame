// ============================================================
//  STORY DATA — 视觉小说剧情脚本
//  图片路径指向 assets/ 目录，缺失时引擎自动使用 CSS 渐变回退
//  语音路径同理，缺失静默跳过
// ============================================================

export const StoryData = {
  meta: {
    title: '黄昏教室',
    subtitle: 'A Visual Novel',
  },

  // ---- 角色定义 ----
  characters: {
    yuki: {
      id: 'yuki',
      name: '雪',
      color: '#a8c8d8',
      sprites: {
        default: 'assets/sprites/yuki_default.png',
        smile: 'assets/sprites/yuki_smile.png',
        sad: 'assets/sprites/yuki_sad.png',
        blush: 'assets/sprites/yuki_blush.png',
      },
      // CSS fallback 颜色（立绘加载失败时用 Graphics 绘制剪影）
      fallback: {
        hair: '#c8d8e8',
        skin: '#f0e8e0',
        outfit: '#8a9aaa',
        accent: '#b8c8d8',
      },
      // 剪影身高比例 (vh)
      heightRatio: 0.55,
    },
    ren: {
      id: 'ren',
      name: '莲',
      color: '#c8a080',
      sprites: {
        default: 'assets/sprites/ren_default.png',
        smile: 'assets/sprites/ren_smile.png',
        sad: 'assets/sprites/ren_sad.png',
      },
      fallback: {
        hair: '#6b5040',
        skin: '#f5e6d8',
        outfit: '#c8c0b8',
        accent: '#d8d0c8',
      },
      heightRatio: 0.55,
    },
    sensei: {
      id: 'sensei',
      name: '老师',
      color: '#889098',
      sprites: {
        default: 'assets/sprites/sensei_default.png',
      },
      fallback: {
        hair: '#3a3040',
        skin: '#f2ece6',
        outfit: '#505868',
        accent: '#889098',
      },
      heightRatio: 0.58,
    },
  },

  // ---- 背景定义 ----
  backgrounds: {
    classroom: {
      src: 'assets/bg/classroom.jpg',
      gradient: 'linear-gradient(170deg, #2a2030 0%, #1a1825 30%, #1a1520 60%, #252030 100%)',
      label: '空教室',
    },
    hallway: {
      src: 'assets/bg/hallway.jpg',
      gradient: 'linear-gradient(180deg, #1a1820 0%, #1a1520 30%, #201a28 70%, #151018 100%)',
      label: '走廊',
    },
    rooftop: {
      src: 'assets/bg/rooftop.jpg',
      gradient: 'linear-gradient(180deg, #4a3040 0%, #6a4050 25%, #c87060 45%, #e89860 55%, #3a2040 80%, #1a1028 100%)',
      label: '天台 · 黄昏',
    },
    library: {
      src: 'assets/bg/library.jpg',
      gradient: 'linear-gradient(175deg, #1a1822 0%, #181420 30%, #201a2a 60%, #141018 100%)',
      label: '图书室',
    },
    void_bg: {
      src: '',
      gradient: 'radial-gradient(ellipse at center, #0a0a18 0%, #050510 100%)',
      label: '???',
    },
  },

  // ---- BGM 注册表 ----
  bgm: {
    title: { src: 'assets/bgm/title_theme.mp3', label: '标题曲', volume: 0.7 },
    mystery: { src: 'assets/bgm/mystery_theme.mp3', label: '谜之旋律', volume: 0.6 },
    calm: { src: 'assets/bgm/calm_piano.mp3', label: '静谧钢琴', volume: 0.5 },
    tension: { src: 'assets/bgm/tension.mp3', label: '紧张', volume: 0.65 },
    ending: { src: 'assets/bgm/ending_theme.mp3', label: '尾声', volume: 0.6 },
  },

  // ---- 故事节点 ----
  startNode: 'start',

  nodes: {
    // ===== Opening =====
    start: {
      bg: 'classroom',
      sprites: [],
      entries: [
        { char: null, text: '睁开眼睛的时候，教室里只剩下黄昏的光。' },
        { char: null, text: '橙红色的光从窗外斜斜地照进来，在黑板上切出一道长长的影子。课桌椅整整齐齐地排列着，仿佛刚刚放学，又仿佛已经过去了很久。' },
        { char: null, text: '头疼。记忆像被雾气笼罩，什么都想不起来。' },
        { char: null, text: '我为什么会在这里？现在是什么时候？' },
        { char: null, text: '——甚至连自己的名字，也记不太清了。' },
        { char: null, text: '就在这时，身后传来了轻轻的脚步声。' },
      ],
      next: 'meet_yuki',
    },

    // ===== Meet Yuki =====
    meet_yuki: {
      bg: 'classroom',
      bgm: 'mystery',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'enter' }],
      entries: [
        { char: '???', text: '……你醒了。',
          voice: 'assets/voice/voice_meet_yuki_00.mp3' },
        { char: null, text: '声音很轻，像是怕惊扰什么似的。我转过身，看到一个银色短发的少女站在教室后门，逆着光，表情看不分明。' },
        { char: '???', text: '你也是……"留在这里"的人吧。',
          voice: 'assets/voice/voice_meet_yuki_02.mp3' },
        { char: null, text: '"留在这里"是什么意思？我正要开口问，她轻轻摇了摇头。' },
        { char: '???', text: '我叫雪。你呢？',
          voice: 'assets/voice/voice_meet_yuki_04.mp3' },
        { char: null, text: '我张了张嘴，没有说出任何名字。' },
      ],
      next: 'yuki_explain',
    },

    yuki_explain: {
      bg: 'classroom',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'focus' }],
      entries: [
        { char: '雪', text: '果然……你也一样。',
          voice: 'assets/voice/voice_yuki_explain_00.mp3' },
        { char: '雪', text: '这里是黄昏教室。永远停留在放学后的地方。忘记了自己是谁的人，会来到这里。',
          voice: 'assets/voice/voice_yuki_explain_01.mp3' },
        { char: null, text: '她说这些话的时候，眼睛一直望着窗外那片不变的夕阳。语气平静得像是说过很多次。' },
        { char: '雪', text: '想要离开这里，只有两个办法。',
          voice: 'assets/voice/voice_yuki_explain_03.mp3' },
        { char: '雪', text: '一：想起自己是谁。二：……在黄昏结束之前，找到"门"。',
          voice: 'assets/voice/voice_yuki_explain_04.mp3' },
        { char: null, text: '她转过头来看着我，光线落在她侧脸上，那双眼睛的颜色浅得近乎透明。' },
      ],
      next: 'choice_first',
    },

    // ===== First Choice =====
    choice_first: {
      bg: 'classroom',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'focus' }],
      choices: {
        options: [
          { text: '相信她，和她一起行动', next: 'trust_yuki' },
          { text: '保持警惕，自己探索', next: 'doubt_yuki' },
          { text: '再问她一些问题', next: 'ask_more' },
        ],
      },
    },

    ask_more: {
      bg: 'classroom',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'sad', state: 'focus' }],
      entries: [
        { char: null, text: '"你在这里多久了？"我问道。' },
        { char: '雪', text: '……很久了。久到我已经放弃了数日子。',
          voice: 'assets/voice/voice_ask_more_01.mp3' },
        { char: '雪', text: '太阳永远不会落下去，所以这里没有"天数"这个概念。',
          voice: 'assets/voice/voice_ask_more_02.mp3' },
        { char: null, text: '她的声音里有一丝疲惫。那不是装出来的。' },
        { char: '雪', text: '不过，你不是第一个来到这里的人。之前也有人……他们有的找到了门，有的没有。',
          voice: 'assets/voice/voice_ask_more_04.mp3' },
        { char: '雪', text: '没找到的人……慢慢地就消失了。连记忆都不剩。',
          voice: 'assets/voice/voice_ask_more_05.mp3' },
        { char: null, text: '教室里安静了几秒。窗外那片黄昏依旧静止。' },
        { char: '雪', text: '所以，你打算怎么办？',
          voice: 'assets/voice/voice_ask_more_07.mp3' },
      ],
      next: 'choice_first',
    },

    // ===== Trust Yuki =====
    trust_yuki: {
      bg: 'hallway',
      bgm: 'calm',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'smile', state: 'focus' }],
      entries: [
        { char: null, text: '我点了点头。至少在这个陌生的地方，有一个人愿意伸出手，总比自己一个人摸索要好。' },
        { char: '雪', text: '嗯。那跟我来吧。',
          voice: 'assets/voice/voice_trust_yuki_01.mp3' },
        { char: null, text: '她推开教室的后门，外面是一条长长的走廊。两侧是更多教室的门，每一扇都紧闭着。' },
        { char: '雪', text: '我之前探索过大部分楼层。"门"最可能出现的地方……',
          voice: 'assets/voice/voice_trust_yuki_03.mp3' },
        { char: null, text: '她停了停，仿佛在斟酌措辞。' },
        { char: '雪', text: '……是天台。不过那里……有点不一样。',
          voice: 'assets/voice/voice_trust_yuki_05.mp3' },
      ],
      next: 'hallway_encounter',
    },

    // ===== Doubt Yuki =====
    doubt_yuki: {
      bg: 'hallway',
      bgm: 'calm',
      sprites: [],
      entries: [
        { char: null, text: '我决定保持警惕。这个叫"雪"的少女虽然看起来没有恶意，但她说的每一句话都太不真实了。' },
        { char: null, text: '"我自己走走看。"我说。' },
        { char: '雪', text: '……我知道了。没关系，每个人一开始都这样。',
          voice: 'assets/voice/voice_doubt_yuki_02.mp3' },
        { char: null, text: '她没有阻拦的意思，只是指了指走廊尽头。' },
        { char: '雪', text: '如果真的想离开的话，去天台看看吧。我会在那里等你。',
          voice: 'assets/voice/voice_doubt_yuki_04.mp3' },
        { char: null, text: '她说完就转身走了，脚步声很快消失在走廊深处。我一个人站在空旷的走廊里，四周安静得能听到自己的心跳。' },
      ],
      next: 'hallway_alone',
    },

    // ===== Hallway Encounter =====
    hallway_encounter: {
      bg: 'hallway',
      sprites: [
        { char: 'yuki', pos: 'left', expression: 'default', state: 'focus' },
        { char: 'ren', pos: 'right', expression: 'smile', state: 'enter' },
      ],
      entries: [
        { char: null, text: '走在走廊里的时候，前方的一扇门突然打开了。' },
        { char: '???', text: '啊！找到你们了！',
          voice: 'assets/voice/voice_hallway_encounter_01.mp3' },
        { char: null, text: '一个深色头发的少年从门后探出头来，表情充满了欣喜。' },
        { char: '莲', text: '太好了，我还以为今天就我一个人了呢。',
          voice: 'assets/voice/voice_hallway_encounter_03.mp3' },
        { char: '雪', text: '……莲。你今天也在。',
          voice: 'assets/voice/voice_hallway_encounter_04.mp3' },
        { char: '莲', text: '当然啊！我不在的话谁帮你们找"门"啊？',
          voice: 'assets/voice/voice_hallway_encounter_05.mp3' },
        { char: null, text: '莲看起来很开朗，和雪形成了鲜明的对比。他朝我爽朗地笑了笑。' },
        { char: '莲', text: '你是新来的吧？别担心，我们会帮你出去的。',
          voice: 'assets/voice/voice_hallway_encounter_07.mp3' },
      ],
      next: 'trio_talk',
    },

    hallway_alone: {
      bg: 'library',
      sprites: [],
      entries: [
        { char: null, text: '我沿着走廊走了一阵。每间教室看起来都一样——空荡荡的，被黄昏的光浸透。' },
        { char: null, text: '然后我发现了一间不是教室的房间。门牌上写着"图书室"。' },
        { char: null, text: '推开门，里面是一排排书架。和教室一样，这里也笼罩在橙黄的光线中。' },
        { char: null, text: '在阅览桌上，我看到了一本摊开的笔记本。' },
        { char: null, text: '上面写着一些断断续续的文字，笔迹潦草：' },
        { char: null, text: '"第37次。依然没有找到出口。但我发现了一件事——那个叫雪的女孩，她在这里的时间比任何人都长。问她为什么，她从来不说。"' },
        { char: null, text: '第37次？意思是有人在这里尝试了37次？' },
        { char: null, text: '我继续往下翻，但后面的页面都是空白的。只是在最后一页，写着一行小字：' },
        { char: null, text: '"去天台。不管怎样，天台是唯一的希望。"' },
      ],
      next: 'rooftop_journey',
    },

    trio_talk: {
      bg: 'hallway',
      sprites: [
        { char: 'yuki', pos: 'left', expression: 'default', state: 'focus' },
        { char: 'ren', pos: 'right', expression: 'default', state: 'focus' },
      ],
      entries: [
        { char: '莲', text: '我们已经找到了一些线索。天台那扇铁门，每到"某个时刻"就会变得不一样。',
          voice: 'assets/voice/voice_trio_talk_00.mp3' },
        { char: '雪', text: '不是时间。这里没有时间。是……感觉。当你足够想离开的时候，门就会出现。',
          voice: 'assets/voice/voice_trio_talk_01.mp3' },
        { char: '莲', text: '对对，就是那种"非走不可"的感觉！',
          voice: 'assets/voice/voice_trio_talk_02.mp3' },
        { char: null, text: '他们两人的话听起来像谜语，但在这种地方，也许谜语才是唯一的真实。' },
        { char: '莲', text: '走吧，一起去天台。说不定这次就是最后一次了！',
          voice: 'assets/voice/voice_trio_talk_04.mp3' },
        { char: '雪', text: '……嗯。',
          voice: 'assets/voice/voice_trio_talk_05.mp3' },
      ],
      next: 'rooftop_journey',
    },

    // ===== Rooftop =====
    rooftop_journey: {
      bg: 'rooftop',
      bgm: 'tension',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'enter' }],
      entries: [
        { char: null, text: '通往天台的楼梯很长。每走一步，光线就变得更暖、更浓。' },
        { char: null, text: '推开天台的门，迎面而来的是铺天盖地的黄昏。' },
        { char: null, text: '天空被染成了金橙色和深紫色的交织，太阳悬在地平线上方一寸的地方，一动不动。整个世界像是一幅油画，安静得不真实。' },
        { char: '雪', text: '就是这里。',
          voice: 'assets/voice/voice_rooftop_journey_03.mp3' },
        { char: null, text: '她指着天台中央。那里有一扇孤零零的门，没有墙壁支撑，就那么立在空地上。' },
        { char: null, text: '门框里透出微弱的光，和周围的夕阳颜色截然不同——那是白色的、清冷的光。' },
        { char: '雪', text: '这就是"门"。但它不会一直开着。',
          voice: 'assets/voice/voice_rooftop_journey_06.mp3' },
      ],
      next: 'rooftop_choice',
    },

    rooftop_choice: {
      bg: 'rooftop',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'focus' }],
      choices: {
        options: [
          { text: '走向那扇门', next: 'approach_door' },
          { text: '先问问雪关于她自己的事', next: 'ask_yuki_past' },
        ],
      },
    },

    ask_yuki_past: {
      bg: 'rooftop',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'sad', state: 'focus' }],
      entries: [
        { char: null, text: '"你呢？"我看着她。"你为什么不走？"' },
        { char: '雪', text: '…………' },
        { char: null, text: '她沉默了很久。风吹过天台，她的短发轻轻飘动。' },
        { char: '雪', text: '我……很久以前就找到这扇门了。',
          voice: 'assets/voice/voice_ask_yuki_past_03.mp3' },
        { char: '雪', text: '但是我没有进去。因为进去了，就意味着把这里的一切都忘掉。',
          voice: 'assets/voice/voice_ask_yuki_past_04.mp3' },
        { char: '雪', text: '包括那些曾经在这里、后来消失了的人。如果我也忘了，他们就真的不存在了。',
          voice: 'assets/voice/voice_ask_yuki_past_05.mp3' },
        { char: null, text: '她的声音很平静，但我听出了一种很深的孤独。' },
        { char: '雪', text: '不过……你不一样。你应该回去。回到有"明天"的世界里。',
          voice: 'assets/voice/voice_ask_yuki_past_07.mp3' },
        { char: null, text: '她朝我笑了笑。那是很淡的笑容，但在不变的黄昏里，成了唯一真实的东西。' },
      ],
      next: 'rooftop_choice',
    },

    approach_door: {
      bg: 'rooftop',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'blush', state: 'dim' }],
      entries: [
        { char: null, text: '我一步一步走向天台中央的那扇门。' },
        { char: null, text: '门框里透出的白光越来越亮，却一点也不刺眼。它很温柔，像是在邀请。' },
        { char: null, text: '走到门前的时候，我停下了脚步。透过门扉，我隐约看到了——' },
        { char: null, text: '一个普通的早晨，阳光照进教室。黑板上写着值日生的名字。同学们在聊天。' },
        { char: null, text: '那是"日常"。那是"明天"。' },
      ],
      next: 'final_choice',
    },

    // ===== Final Choice =====
    final_choice: {
      bg: 'rooftop',
      sprites: [{ char: 'yuki', pos: 'left', expression: 'default', state: 'dim' }],
      choices: {
        options: [
          { text: '跨过那扇门，回到日常', next: 'ending_escape' },
          { text: '回头走向雪', next: 'ending_together' },
          { text: '站在原地，哪里也不去', next: 'ending_linger' },
        ],
      },
    },

    // ===== ENDINGS =====
    ending_escape: {
      bg: 'void_bg',
      sprites: [],
      ending: {
        type: 'ENDING 01',
        title: '归还',
        text: '你跨过了门。\n白光吞没了一切。\n\n再次睁开眼睛的时候，\n你坐在自己的课桌前。\n窗外是普通的傍晚，太阳正在缓缓落下。\n同学们在收拾书包，值日生在擦黑板。\n\n一切都那么普通，那么真实。\n\n你低头看了看自己的笔记本，\n第一页写着你的名字。\n\n你想起来了。\n\n只是偶尔，在黄昏时分，\n你会想起那个银色短发的少女——\n和那片永远不会结束的夕阳。\n\n然后你告诉自己：\n那只是一场梦。\n\n但那场梦里，有人还在等。',
      },
    },

    ending_together: {
      bg: 'rooftop',
      sprites: [{ char: 'yuki', pos: 'center', expression: 'blush', state: 'focus' }],
      ending: {
        type: 'ENDING 02',
        title: '黄昏之约',
        text: '你转过身，走回她的身边。\n\n雪看着你，眼里第一次出现了惊讶。\n\n"为什么？"\n\n你笑了笑，没有回答。\n\n你们并肩坐在天台边缘，\n看着那片永不沉落的夕阳。\n\n也许有一天门会再次打开。\n也许不会。\n\n但至少——\n在这不变的黄昏里，\n她不再是一个人了。\n\n而你，也终于不再是一个人了。',
      },
    },

    ending_linger: {
      bg: 'void_bg',
      sprites: [],
      ending: {
        type: 'ENDING 03',
        title: '迷途',
        text: '你站在原地。\n\n哪条路都不想选。\n\n白光渐渐黯淡下去，\n门开始变得透明。\n\n你想伸手，但已经来不及了。\n\n最后，你发现自己回到了那间空教室。\n还是黄昏的光，还是整齐的课桌椅。\n\n但这一次——\n你连"想要离开"的感觉\n都开始忘记了。\n\n黄昏教室一如既往地安静。\n等待着下一个人睁开双眼。',
      },
    },
  },
};
