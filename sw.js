// Service Worker — 首次访问后缓存全部资源，离线秒开
var CACHE = 'galgame-v5';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        '/galgame/',
        '/galgame/index.html',
        '/galgame/js/engine/AudioManager.js',
        '/galgame/js/engine/DialogueManager.js',
        '/galgame/js/engine/StoryData.js',
        '/galgame/js/scenes/BootScene.js',
        '/galgame/js/scenes/TitleScene.js',
        '/galgame/js/scenes/GameScene.js',
        '/galgame/js/scenes/EndingScene.js',
        '/galgame/js/ui/UIManager.js',
        '/galgame/assets/bg/classroom.jpg',
        '/galgame/assets/bg/hallway.jpg',
        '/galgame/assets/bg/library.jpg',
        '/galgame/assets/bg/rooftop.jpg',
        '/galgame/assets/bg/title_bg.jpg',
        '/galgame/assets/bgm/title_theme.mp3',
        '/galgame/assets/bgm/mystery_theme.mp3',
        '/galgame/assets/bgm/calm_piano.mp3',
        '/galgame/assets/bgm/tension.mp3',
        '/galgame/assets/sprites/yuki_default.png',
        '/galgame/assets/sprites/yuki_smile.png',
        '/galgame/assets/sprites/yuki_sad.png',
        '/galgame/assets/sprites/yuki_blush.png',
        '/galgame/assets/sprites/ren_default.png',
        '/galgame/assets/sprites/ren_smile.png',
        '/galgame/assets/sprites/ren_sad.png',
        '/galgame/assets/voice/voice_meet_yuki_00.mp3',
        '/galgame/assets/voice/voice_meet_yuki_02.mp3',
        '/galgame/assets/voice/voice_meet_yuki_04.mp3',
        '/galgame/assets/voice/voice_yuki_explain_00.mp3',
        '/galgame/assets/voice/voice_yuki_explain_01.mp3',
        '/galgame/assets/voice/voice_yuki_explain_03.mp3',
        '/galgame/assets/voice/voice_yuki_explain_04.mp3',
        '/galgame/assets/voice/voice_ask_more_01.mp3',
        '/galgame/assets/voice/voice_ask_more_02.mp3',
        '/galgame/assets/voice/voice_ask_more_04.mp3',
        '/galgame/assets/voice/voice_ask_more_05.mp3',
        '/galgame/assets/voice/voice_ask_more_07.mp3',
        '/galgame/assets/voice/voice_trust_yuki_01.mp3',
        '/galgame/assets/voice/voice_trust_yuki_03.mp3',
        '/galgame/assets/voice/voice_trust_yuki_05.mp3',
        '/galgame/assets/voice/voice_doubt_yuki_02.mp3',
        '/galgame/assets/voice/voice_doubt_yuki_04.mp3',
        '/galgame/assets/voice/voice_hallway_encounter_01.mp3',
        '/galgame/assets/voice/voice_hallway_encounter_03.mp3',
        '/galgame/assets/voice/voice_hallway_encounter_04.mp3',
        '/galgame/assets/voice/voice_hallway_encounter_05.mp3',
        '/galgame/assets/voice/voice_hallway_encounter_07.mp3',
        '/galgame/assets/voice/voice_trio_talk_00.mp3',
        '/galgame/assets/voice/voice_trio_talk_01.mp3',
        '/galgame/assets/voice/voice_trio_talk_02.mp3',
        '/galgame/assets/voice/voice_trio_talk_04.mp3',
        '/galgame/assets/voice/voice_trio_talk_05.mp3',
        '/galgame/assets/voice/voice_rooftop_journey_03.mp3',
        '/galgame/assets/voice/voice_rooftop_journey_06.mp3',
        '/galgame/assets/voice/voice_ask_yuki_past_03.mp3',
        '/galgame/assets/voice/voice_ask_yuki_past_04.mp3',
        '/galgame/assets/voice/voice_ask_yuki_past_05.mp3',
        '/galgame/assets/voice/voice_ask_yuki_past_07.mp3',
        'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(resp) {
      return resp || fetch(e.request);
    })
  );
});
