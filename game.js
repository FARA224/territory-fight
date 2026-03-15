// Game Configuration
const GRID_SIZE = 10;
const RED = 1;
const BLUE = -1;
const EMPTY = 0;
const RED_BLOCK = 2; // Made into a 2x2 block
const BLUE_BLOCK = -2;

// Elements
const elApp = document.getElementById('app');
const elLobby = document.getElementById('lobby');
const elGameView = document.getElementById('game-view');
const elResult = document.getElementById('result');
const elBoard = document.getElementById('play-board');
const elBoardContainer = document.getElementById('play-board-container');

const elScoreRed = document.getElementById('score-red');
const elScoreBlue = document.getElementById('score-blue');
const elInfoRed = document.getElementById('info-red');
const elInfoBlue = document.getElementById('info-blue');
const elCpuThinking = document.getElementById('cpu-thinking');
const elCursorFollower = document.getElementById('cursor-follower');
const elComboText = document.getElementById('combo-text');

const btnStart = document.getElementById('btn-start');
const btnToLobby = document.getElementById('btn-to-lobby');
const btnRestart = document.getElementById('btn-restart');
const elToast = document.getElementById('toast');

// Bottom Menu Bar Elements
const btnPass = document.getElementById('btn-pass');
const btnSpecial = document.getElementById('btn-special');
const btnSkill = document.getElementById('btn-skill');

// In-Game Menu & Settings Elements
const btnIngameMenu = document.getElementById('btn-ingame-menu');
const elIngameMenuOverlay = document.getElementById('ingame-menu-overlay');
const elSettingsOverlay = document.getElementById('settings-overlay');
const elRestartConfirmOverlay = document.getElementById('restart-confirm-overlay');
const btnResume = document.getElementById('btn-resume');
const btnSettings = document.getElementById('btn-settings');
const btnSettingsClose = document.getElementById('btn-settings-close');
const btnIgRestart = document.getElementById('btn-ig-restart');
const btnIgLobby = document.getElementById('btn-ig-lobby');
const btnConfirmRestart = document.getElementById('btn-confirm-restart');
const btnCancelRestart = document.getElementById('btn-cancel-restart');
const volSlider = document.getElementById('vol-slider');
const themeSwitch = document.getElementById('theme-switch');
const elAwakeningGauge = document.getElementById('awakening-gauge');
const elLobbyCurrentTitle = document.getElementById('lobby-current-title');
const titleSelect = document.getElementById('title-select');

// Lobby additional UI
const elTrophyCount = document.getElementById('trophy-count');
const elCoinCount = document.getElementById('coin-count');
const colorSwatches = document.querySelectorAll('.swatch');

// Audio Elements
const seSet = document.getElementById('se-set');
const seResult = document.getElementById('se-result');
const seResultLast = document.getElementById('se-result-last');
const seResultLoss = document.getElementById('se-result-loss');
const seButton = document.getElementById('se-button');
const seStart = document.getElementById('se-start');
const seCancel = document.getElementById('se-cancel');

// Result Screen Elements
const resRedRow = document.getElementById('res-red-row');
const resBlueRow = document.getElementById('res-blue-row');
const resRedScore = document.getElementById('res-red-score');
const resBlueScore = document.getElementById('res-blue-score');
const resTitle = document.getElementById('res-title');
const resButtons = document.getElementById('res-buttons');

// App State
let board = [];
let cells = []; // DOM elements 2D array
let currentPlayer = RED; // 1 = Red, -1 = Blue
let scoreRed = 0;
let scoreBlue = 0;
let isGameOver = false;
let consecutiveBlocksRed = 0;
let consecutiveBlocksBlue = 0;

let awakeningCooldownMax = 0; // ms
let awakeningCooldownCurrent = 0; // ms
let awakeningInterval = null;

// ----- Skills Data -----
// Rarity: rare(緑), srare(水), urare(紫), prare(黄)
const SKILL_DATA = [
    // Rare (10) - 2~3 pieces, simple basic shapes
    { id: 'r1', name: '縦一直線', rarity: 'rare', pattern: [[0,-1],[0,0],[0,1]] },
    { id: 'r2', name: '横一直線', rarity: 'rare', pattern: [[-1,0],[0,0],[1,0]] },
    { id: 'r3', name: '右上がり', rarity: 'rare', pattern: [[-1,1],[0,0],[1,-1]] },
    { id: 'r4', name: '右下がり', rarity: 'rare', pattern: [[-1,-1],[0,0],[1,1]] },
    { id: 'r5', name: '縦並び (2)', rarity: 'rare', pattern: [[0,0],[0,1]] },
    { id: 'r6', name: '横並び (2)', rarity: 'rare', pattern: [[0,0],[1,0]] },
    { id: 'r7', name: 'ナナメ (2)', rarity: 'rare', pattern: [[0,0],[1,-1]] },
    { id: 'r8', name: '逆ナナメ (2)', rarity: 'rare', pattern: [[0,0],[1,1]] },
    { id: 'r9', name: 'L字 (小)', rarity: 'rare', pattern: [[0,-1],[0,0],[1,0]] },
    { id: 'r10', name: '逆L字 (小)', rarity: 'rare', pattern: [[0,-1],[0,0],[-1,0]] },

    // SRare (Double Rare)(10) - 3~4 pieces, slightly complex
    { id: 'sr1', name: '縦4連', rarity: 'srare', pattern: [[0,-2],[0,-1],[0,0],[0,1]] },
    { id: 'sr2', name: '横4連', rarity: 'srare', pattern: [[-1,0],[0,0],[1,0],[2,0]] },
    { id: 'sr3', name: '斜め4連', rarity: 'srare', pattern: [[-1,1],[0,0],[1,-1],[2,-2]] },
    { id: 'sr4', name: '逆斜め4連', rarity: 'srare', pattern: [[-1,-1],[0,0],[1,1],[2,2]] },
    { id: 'sr5', name: '大きめL字', rarity: 'srare', pattern: [[0,-2],[0,-1],[0,0],[1,0],[2,0]] },
    { id: 'sr6', name: 'T字', rarity: 'srare', pattern: [[-1,0],[0,0],[1,0],[0,1]] },
    { id: 'sr7', name: '逆T字', rarity: 'srare', pattern: [[-1,0],[0,0],[1,0],[0,-1]] },
    { id: 'sr8', name: '十字 (小)', rarity: 'srare', pattern: [[0,-1],[-1,0],[0,0],[1,0],[0,1]] },
    { id: 'sr9', name: '四角', rarity: 'srare', pattern: [[0,0],[1,0],[0,1],[1,1]] },
    { id: 'sr10', name: '斜め四角', rarity: 'srare', pattern: [[0,-1],[-1,0],[1,0],[0,1]] },

    // URare (Triple Rare)(10) - 4~5 pieces, powerful
    { id: 'ur1', name: '縦5連', rarity: 'urare', pattern: [[0,-2],[0,-1],[0,0],[0,1],[0,2]] },
    { id: 'ur2', name: '横5連', rarity: 'urare', pattern: [[-2,0],[-1,0],[0,0],[1,0],[2,0]] },
    { id: 'ur3', name: 'X字型', rarity: 'urare', pattern: [[-1,-1],[1,-1],[0,0],[-1,1],[1,1]] },
    { id: 'ur4', name: 'V字', rarity: 'urare', pattern: [[-1,-1],[0,0],[1,-1]] },
    { id: 'ur5', name: '逆V字', rarity: 'urare', pattern: [[-1,1],[0,0],[1,1]] },
    { id: 'ur6', name: '大十字', rarity: 'urare', pattern: [[0,-2],[0,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[0,1],[0,2]] },
    { id: 'ur7', name: 'U字', rarity: 'urare', pattern: [[-1,-1],[-1,0],[0,1],[1,1],[2,0],[2,-1]] },
    { id: 'ur8', name: '星型', rarity: 'urare', pattern: [[0,-1],[-1,0],[1,0],[0,1]] },
    { id: 'ur9', name: '斜めX', rarity: 'urare', pattern: [[-2,-1],[0,-1],[2,-1],[-1,0],[1,0]] },
    { id: 'ur10', name: 'ジグザグ', rarity: 'urare', pattern: [[-1,-1],[-1,0],[0,0],[0,1],[1,1]] },

    // PRare (Perfect Rare)(10) - 5+ pieces, game altering
    { id: 'pr1', name: '全方位カッター', rarity: 'prare', pattern: [[0,-2],[0,2],[-2,0],[2,0],[0,0]] },
    { id: 'pr2', name: '爆風', rarity: 'prare', pattern: [[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]] },
    { id: 'pr3', name: '縦貫通', rarity: 'prare', pattern: [[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[0,4]] },
    { id: 'pr4', name: '横貫通', rarity: 'prare', pattern: [[-4,0],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[4,0]] },
    { id: 'pr5', name: 'ナナメ断絶', rarity: 'prare', pattern: [[-4,-4],[-3,-3],[-2,-2],[-1,-1],[0,0],[1,1],[2,2],[3,3],[4,4]] },
    { id: 'pr6', name: '逆ナナメ断絶', rarity: 'prare', pattern: [[-4,4],[-3,3],[-2,2],[-1,1],[0,0],[1,-1],[2,-2],[3,-3],[4,-4]] },
    { id: 'pr7', name: 'ダブルL', rarity: 'prare', pattern: [[-1,-1],[-1,0],[0,0],[1,0],[1,1]] },
    { id: 'pr8', name: '市松模様', rarity: 'prare', pattern: [[-1,-1],[1,-1],[-2,0],[0,0],[2,0],[-1,1],[1,1]] },
    { id: 'pr9', name: 'リング', rarity: 'prare', pattern: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]] },
    { id: 'pr10', name: 'マスター', rarity: 'prare', pattern: [[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[-3,0],[-2,0],[-1,0],[1,0],[2,0],[3,0]] }
];

const AWAKENING_DATA = [
    // Rare (10)
    { id: 'a1', name: 'トリプル・ステップ', rarity: 'rare', desc: 'このターン、さらに2枚おはじきを置ける' },
    { id: 'a2', name: 'クイック・ショット', rarity: 'rare', desc: 'このターン、さらに1枚おはじきを置ける' },
    { id: 'a7', name: 'プチ・ヒール', rarity: 'rare', desc: 'ランダムな敵おはじきを1つ消去する' },
    { id: 'a8', name: 'サーチ・ライト', rarity: 'rare', desc: '次に置く場所の周囲をハイライトする' },
    { id: 'a9', name: 'ミニ・ウォール', rarity: 'rare', desc: '次に置くおはじきは1ターン上書きされない' },
    { id: 'a10', name: 'ダブル・タップ', rarity: 'rare', desc: '置いたおはじきの隣にランダムに1つ追加' },
    { id: 'a11', name: 'スモール・インパクト', rarity: 'rare', desc: '周囲1マスの敵おはじきを消去する' },
    { id: 'a12', name: 'コイン・ボーナス', rarity: 'rare', desc: 'この試合で得られるコインが少し増える' },
    { id: 'a13', name: 'スピード・ブースト', rarity: 'rare', desc: 'このターンの思考時間が短縮される' },
    { id: 'a14', name: 'ラッキー・セブン', rarity: 'rare', desc: '7%の確率で2枚追加で置ける' },

    // SRare (10)
    { id: 'a3', name: 'エリア・スイープ', rarity: 'srare', desc: '周囲3x3ママス内の敵おはじきを消去する' },
    { id: 'a4', name: 'クロス・ブレイズ', rarity: 'srare', desc: '十字方向に敵おはじきを消去する' },
    { id: 'a15', name: 'ミドル・インパクト', rarity: 'srare', desc: '周囲2マスの敵おはじきを消去する' },
    { id: 'a16', name: 'アイアン・ガード', rarity: 'srare', desc: 'このターンの配置は次のターン上書きされない' },
    { id: 'a17', name: 'チェイン・リアクション', rarity: 'srare', desc: '置いた場所から直線上に2つおはじきを追加' },
    { id: 'a18', name: 'ターゲット・ロック', rarity: 'srare', desc: '一番近い敵おはじきを3つ消去する' },
    { id: 'a19', name: 'パワー・サージ', rarity: 'srare', desc: 'このターンに置くおはじきがブロックになりやすくなる' },
    { id: 'a20', name: 'エナジー・ドレイン', rarity: 'srare', desc: '敵のスコアを少し奪う' },
    { id: 'a21', name: 'ダブル・ムーブ', rarity: 'srare', desc: 'このターン、さらに2枚おはじきを置ける' },
    { id: 'a22', name: 'シールド・ジェネレータ', rarity: 'srare', desc: '周囲の自分のおはじきを保護する' },

    // URare (10)
    { id: 'a5', name: '不落の要塞', rarity: 'urare', desc: 'このターンの配置は2ターンの間上書きされない' },
    { id: 'a23', name: 'メガ・インパクト', rarity: 'urare', desc: '周囲5x5マスの敵おはじきを消去する' },
    { id: 'a24', name: 'スター・ダスト', rarity: 'urare', desc: 'ランダムな位置に5つおはじきを置く' },
    { id: 'a25', name: 'ライトニング・ストライク', rarity: 'urare', desc: '縦横斜めに雷を放ち敵を消去する' },
    { id: 'a26', name: 'グラビティ・ホール', rarity: 'urare', desc: '中心に向かって周囲の敵おはじきを引き寄せ消去' },
    { id: 'a27', name: 'ハイパー・ステップ', rarity: 'urare', desc: 'このターン、さらに3枚おはじきを置ける' },
    { id: 'a28', name: 'ダイヤモンド・シールド', rarity: 'urare', desc: 'このターンの配置は3ターンの間上書きされない' },
    { id: 'a29', name: 'スコア・マルチプライヤー', rarity: 'urare', desc: 'このターンに作るブロックのスコアが2倍になる' },
    { id: 'a30', name: 'ヴォイド・エクスプロージョン', rarity: 'urare', desc: '盤面の敵おはじきを10%消去する' },
    { id: 'a31', name: 'クアッド・コア', rarity: 'urare', desc: '一度に4枚のおはじきを正方形に並べて置く' },

    // PRare (10)
    { id: 'a6', name: '神速の一手', rarity: 'prare', desc: 'このターン、さらに4枚おはじきを置ける' },
    { id: 'a32', name: 'アルティメット・エンド', rarity: 'prare', desc: '盤面の全ての敵おはじきを消去する' },
    { id: 'a33', name: 'ゴッド・ブレス', rarity: 'prare', desc: 'この試合中、自分のおはじきが全て保護される' },
    { id: 'a34', name: 'タイム・ストップ', rarity: 'prare', desc: '2ターンの間、相手は行動できない' },
    { id: 'a35', name: 'ギャラクシー・バースト', rarity: 'prare', desc: '盤面全域に大爆発を起こし敵を壊滅させる' },
    { id: 'a36', name: 'パーフェクト・ウォール', rarity: 'prare', desc: '自分のおはじきが絶対に上書きされなくなる' },
    { id: 'a37', name: 'マスター・オブ・フィールド', rarity: 'prare', desc: '盤面の半分を自分の色に塗り替える' },
    { id: 'a38', name: 'インフィニティ・ターン', rarity: 'prare', desc: 'このターン、無限におはじきを置ける(5秒間)' },
    { id: 'a39', name: 'ジャッジメント・デイ', rarity: 'prare', desc: '相手のスコアを0にし、自分のスコアを加算する' },
    { id: 'a40', name: 'レボリューション', rarity: 'prare', desc: '自分と相手のおはじきを全て入れ替える' }
];

const REWARD_LEVELS = [
    { threshold: 50, name: "500 コイン", type: "coins", value: 500 },
    { threshold: 100, name: "UR / PR スキルカード", type: "skill_high" },
    { threshold: 150, name: "1000 コイン", type: "coins", value: 1000 },
    { threshold: 200, name: "覚醒術カード", type: "awakening" },
    { threshold: 250, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 300, name: "PR スキルカード", type: "skill_prare" },
    { threshold: 350, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 400, name: "UR / PR 覚醒術カード", type: "awakening_high" },
    { threshold: 450, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 500, name: "称号: 初心者卒業", type: "title", titleName: "初心者卒業" },
    { threshold: 550, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 600, name: "PR スキル & 覚醒術", type: "both_prare" },
    { threshold: 650, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 700, name: "PR スキルパック", type: "skill_prare" },
    { threshold: 750, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 800, name: "PR 覚醒術パック", type: "awakening_high" },
    { threshold: 850, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 900, name: "称号: 熟練おはじき師", type: "title", titleName: "熟練おはじき師" },
    { threshold: 950, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 1000, name: "全てのスキル解放", type: "all_skills" },
    { threshold: 1050, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 1100, name: "称号: 真の支配者", type: "title", titleName: "真の支配者" },
    { threshold: 1150, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 1200, name: "称号: 伝説の戦士", type: "title", titleName: "伝説の戦士" },
    { threshold: 1250, name: "1500 コイン", type: "coins", value: 1500 },
    { threshold: 1300, name: "称号: 究極の神", type: "title", titleName: "究極の神" }
];

let playerData = {
    unlockedSkills: [], 
    equippedSkills: [null, null, null],
    unlockedAwakenings: [],
    equippedAwakening: null,
    coins: 500,
    hasRolledFreeGacha: false,
    hasRolledFreeAwakening: false,
    lastTrophyRewardLevel: 0,
    rewardClaimedTrophies: 0,
    unlockedTitles: ["おはじき初心者"],
    currentTitle: "おはじき初心者"
};

function loadPlayerData() {
    let saved = localStorage.getItem('territorySkills');
    if (saved) {
        playerData = JSON.parse(saved);
        if(!playerData.equippedSkills) playerData.equippedSkills = [null, null, null];
        if(playerData.unlockedAwakenings === undefined) playerData.unlockedAwakenings = [];
        if(playerData.equippedAwakening === undefined) playerData.equippedAwakening = null;
        if(playerData.coins === undefined) playerData.coins = 500;
        if(playerData.hasRolledFreeGacha === undefined) playerData.hasRolledFreeGacha = false;
        if(playerData.hasRolledFreeAwakening === undefined) playerData.hasRolledFreeAwakening = false; // NEW
        if(playerData.lastTrophyRewardLevel === undefined) playerData.lastTrophyRewardLevel = 0;
        if(playerData.rewardClaimedTrophies === undefined) playerData.rewardClaimedTrophies = 0;
        if(playerData.unlockedTitles === undefined) playerData.unlockedTitles = ["おはじき初心者"];
        if(playerData.currentTitle === undefined) playerData.currentTitle = "おはじき初心者";
    }
}
// Audio Unlock for Mobile
let isAudioUnlocked = false;
function unlockAudio() {
    if (isAudioUnlocked) return;
    const audios = [seSet, seResult, seResultLast, seResultLoss, seButton, seStart, seCancel];
    audios.forEach(a => {
        if (a) {
            a.play().then(() => {
                a.pause();
                a.currentTime = 0;
            }).catch(() => {});
        }
    });
    isAudioUnlocked = true;
}

function savePlayerData() {
    localStorage.setItem('territorySkills', JSON.stringify(playerData));
}

function renderTitleSelection() {
    if (!titleSelect) return;
    titleSelect.innerHTML = '';
    playerData.unlockedTitles.forEach(title => {
        const opt = document.createElement('option');
        opt.value = title;
        opt.innerText = title;
        if (playerData.currentTitle === title) opt.selected = true;
        titleSelect.appendChild(opt);
    });
}

if (titleSelect) {
    titleSelect.addEventListener('change', () => {
        playerData.currentTitle = titleSelect.value;
        if (elLobbyCurrentTitle) elLobbyCurrentTitle.innerText = playerData.currentTitle;
        savePlayerData();
    });
}

function updateLobbyUIWithTitle() {
    if (elLobbyCurrentTitle) elLobbyCurrentTitle.innerText = playerData.currentTitle;
    renderTitleSelection();
}

loadPlayerData();
updateLobbyUIWithTitle();

// Update Top Bar Displays
function updateLobbyTopBar() {
    if(elTrophyCount) elTrophyCount.innerText = storedTrophies;
    if(elCoinCount) elCoinCount.innerText = playerData.coins;
}

// ----- Lobby Elements -----
const lobbyNavBtns = document.querySelectorAll('.lobby-nav-btn');
const lobbyTabs = document.querySelectorAll('.lobby-tab');
const equippedCardsContainer = document.getElementById('equipped-cards-container');
const equippedAwakeningContainer = document.getElementById('equipped-awakening-container');

// Inventory Selection
const inventoryOverlay = document.getElementById('inventory-overlay');
const inventoryCardsContainer = document.getElementById('inventory-cards-container');
const btnCloseInventory = document.getElementById('btn-close-inventory');

// Gacha
const btnRollGacha = document.getElementById('btn-roll-gacha');
const gachaResultOverlay = document.getElementById('gacha-result-overlay');
const gachaResultContent = document.getElementById('gacha-result-content');
const btnCloseGacha = document.getElementById('btn-close-gacha');
// Slider
const gachaSlider = document.getElementById('gacha-slider');
const gachaDots = document.querySelectorAll('.gacha-dot');
let currentGachaSlide = 0;

// Trophy Rewards
const trophyTrigger = document.getElementById('trophy-ui-trigger');
const trophyRewardOverlay = document.getElementById('trophy-reward-overlay');
const trophyRewardBar = document.getElementById('trophy-reward-bar');
const trophyRewardText = document.getElementById('trophy-reward-text');
const btnCloseTrophyReward = document.getElementById('btn-close-trophy-reward');
const rewardClaimSection = document.getElementById('reward-claim-section');
const btnClaimReward = document.getElementById('btn-claim-reward');

// Match Rewards UI
const resRewardsDisplay = document.getElementById('match-rewards-display');
const resCoinsValue = document.getElementById('reward-coins');
const resTrophiesValue = document.getElementById('reward-trophies');

// Ingame Skills
const ingameSkillOverlay = document.getElementById('ingame-skill-overlay');
const ingameCardsContainer = document.getElementById('ingame-cards-container');
const btnCloseSkill = document.getElementById('btn-close-skill');
let skillAimOverlay = document.getElementById('skill-aim-overlay');
let elStartOverlay = document.getElementById('start-sequence-overlay');
let elStartText = document.getElementById('start-sequence-text');

let isAimingSkill = false;
let activeSkillPattern = null;
let activeSkillId = null;
let lastTappedSkillCell = null;
let skillCooldowns = {}; // { skillId: remainingSeconds }

// Update cooldowns every second
setInterval(() => {
    if (isGameOver) return;
    for (let id in skillCooldowns) {
        if (skillCooldowns[id] > 0) {
            skillCooldowns[id]--;
            // If the ingame skill menu is open, it might need refreshing, 
            // but for now we refresh when it's opened.
            // If the cooldown just finished, we might want to refresh the UI if it's visible.
            if (skillCooldowns[id] === 0 && !ingameSkillOverlay.classList.contains('hidden')) {
                renderIngameSkills();
            }
        }
    }
}, 1000);

// App State

// Click listener to unlock audio
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

// Init trophies
let storedTrophies = parseInt(localStorage.getItem('territoryTrophies') || '0');
updateLobbyTopBar();

const colorPairs = {
    '#ff4757': '#2ed573',
    '#2ed573': '#ff4757',
    '#1e90ff': '#ffa502',
    '#ffa502': '#1e90ff',
    '#ffd32a': '#9c88ff',
    '#9c88ff': '#ffd32a'
};

// Initialize Game
function initGame() {
    // Hide UI
    elLobby.classList.add('hidden');
    elResult.classList.add('hidden');

    // Reset Board
    elBoard.innerHTML = '';
    board = [];
    cells = [];
    currentPlayer = RED;
    scoreRed = 0;
    scoreBlue = 0;
    isGameOver = false;
    consecutiveBlocksRed = 0;
    consecutiveBlocksBlue = 0;

    updateScoreUI();
    setTurnUI();
    usedSkillsInGame = [];
    isAimingSkill = false;
    skillAimOverlay.classList.add('hidden');
    clearAimHighlight();

    // Reset Awakening Cooldown
    if (awakeningInterval) clearInterval(awakeningInterval);
    awakeningCooldownCurrent = 0;
    awakeningCooldownMax = 0;
    btnSpecial.disabled = false;
    elAwakeningGauge.style.width = "0%";

    // Start Cooldown immediately if skill is equipped
    if (playerData.equippedAwakening) {
        let ad = AWAKENING_DATA.find(a => a.id === playerData.equippedAwakening);
        if (ad) {
            let cd = 15000;
            if (ad.rarity === 'srare') cd = 30000;
            else if (ad.rarity === 'urare') cd = 45000;
            else if (ad.rarity === 'prare') cd = 60000;
            startAwakeningCooldown(cd);
        }
    }

    // Create 10x10 grid
    for (let y = 0; y < GRID_SIZE; y++) {
        let row = [];
        let rowDOM = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            row.push(EMPTY);

            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', () => handleCellClick(x, y));

            // For hover highlight
            cell.addEventListener('mouseenter', () => handleCellHover(x, y));
            cell.addEventListener('mouseleave', () => handleCellOut(x, y));

            elBoard.appendChild(cell);
            rowDOM.push(cell);
        }
        board.push(row);
        cells.push(rowDOM);
    }

    // Initial Placements
    // CPU: Blue at Top-Left (0, 0)
    placePiece(0, 0, BLUE, false);
    // Player: Red at Bottom-Right (19, 19)
    placePiece(GRID_SIZE - 1, GRID_SIZE - 1, RED, false);

    updatePlaceableHighlight();

    // Enable custom cursor
    elCursorFollower.classList.add('active');

    // Start Intro Sequence
    triggerStartSequence();
    
    // Attempt to hide address bar on some mobile browsers
    window.scrollTo(0, 1);
}

async function triggerStartSequence() {
    elStartOverlay.classList.remove('hidden');
    elStartText.innerText = "";
    elStartText.classList.remove('start-pop-anim');
    
    // Disable interaction
    elBoard.style.pointerEvents = "none";
    
    const word = "GAME";
    for (let i = 0; i < word.length; i++) {
        elStartText.innerText += word[i];
        await new Promise(r => setTimeout(r, 200));
    }
    
    await new Promise(r => setTimeout(r, 500));
    elStartText.innerText = "";
    
    await new Promise(r => setTimeout(r, 500));
    
    elStartText.innerText = "START!";
    elStartText.classList.add('start-pop-anim');
    playAudio(seStart);
    
    await new Promise(r => setTimeout(r, 1200));
    
    elStartOverlay.classList.add('hidden');
    elBoard.style.pointerEvents = "auto";
}

// Hover event for placeable
function handleCellHover(x, y) {
    if (isGameOver) return;
    
    if (isAimingSkill && activeSkillPattern) {
        // Skill Aim Mode
        clearAimHighlight();
        activeSkillPattern.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                const cell = cells[ny][nx];
                cell.classList.add('skill-aim-target');
                // Check if it's an enemy piece that will be overwritten
                if (board[ny][nx] === BLUE || board[ny][nx] === BLUE_BLOCK) {
                    cell.classList.add('overwrite');
                }
            }
        });
        return;
    }

    if (currentPlayer !== RED) return;
    
    if (isValidMove(x, y, RED)) {
        cells[y][x].classList.add('placeable');
    }
}
function handleCellOut(x, y) {
    cells[y][x].classList.remove('placeable');
    clearAimHighlight();
}
function clearAimHighlight() {
    for (const row of cells) {
        for (const cell of row) {
            cell.classList.remove('skill-aim-target', 'overwrite', 'skill-candidate');
        }
    }
}

// Render Board visuals based on state
function renderBoard() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const val = board[y][x];
            const cell = cells[y][x];

            // Clean classes
            cell.className = 'cell';

            if (val === RED) cell.classList.add('red');
            else if (val === BLUE) cell.classList.add('blue');
            else if (val === RED_BLOCK) cell.classList.add('red', 'block');
            else if (val === BLUE_BLOCK) cell.classList.add('blue', 'block');
        }
    }
}

// Place piece
function placePiece(x, y, player, checkBlocks = true) {
    // Awakening Effects for special placements
    if (awakeningActive) {
        const ad = AWAKENING_DATA.find(a => a.id === playerData.equippedAwakening);
        if (ad && (ad.id === 'a3' || ad.id === 'a4')) {
            // Area clearing effects
            if (ad.id === 'a3') {
                // 3x3 sweep
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                            if (board[ny][nx] === BLUE) board[ny][nx] = EMPTY;
                        }
                    }
                }
            } else if (ad.id === 'a4') {
                // Cross blaze
                for (let i = 0; i < GRID_SIZE; i++) {
                    if (board[y][i] === BLUE) board[y][i] = EMPTY;
                    if (board[i][x] === BLUE) board[i][x] = EMPTY;
                }
            }
            showToast(`${ad.name} !!`);
            awakeningActive = false; // consumed
            btnSpecial.classList.remove('active-awakening');
            btnSpecial.style.boxShadow = "";
        }
    }

    board[y][x] = player;

    // Play Set Sound effect
    playAudio(seSet);

    renderBoard();

    if (checkBlocks) {
        let newBlocks = detectBlocks(player);
        if (newBlocks > 0) {
            if (player === BLUE) triggerBoardShake();
            
            if (player === RED) {
                consecutiveBlocksRed += newBlocks;
                if (consecutiveBlocksRed >= 2) triggerComboText(consecutiveBlocksRed);
            } else {
                consecutiveBlocksBlue += newBlocks;
                if (consecutiveBlocksBlue >= 2) triggerComboText(consecutiveBlocksBlue);
            }
        } else {
            if (player === RED) consecutiveBlocksRed = 0;
            else consecutiveBlocksBlue = 0;
        }
        updateScore();
    }
}

// Detect 2x2 blocks
function detectBlocks(player) {
    // Scan the board to find 2x2 squares of identical pieces that are NOT already blocks
    // Note: requirements state "ブロックは2×2単位でカウントする 重複してカウントしない"
    // Meaning we greedy convert 2x2 of 1s to 2s, and 2x2 of -1s to -2s.
    let formed = 0;

    for (let y = 0; y < GRID_SIZE - 1; y++) {
        for (let x = 0; x < GRID_SIZE - 1; x++) {
            // Check RED
            if (board[y][x] === RED && board[y][x + 1] === RED &&
                board[y + 1][x] === RED && board[y + 1][x + 1] === RED) {
                // Form Red Block
                board[y][x] = RED_BLOCK;
                board[y][x + 1] = RED_BLOCK;
                board[y + 1][x] = RED_BLOCK;
                board[y + 1][x + 1] = RED_BLOCK;
                if (player === RED) formed++;
            }

            // Check BLUE
            if (board[y][x] === BLUE && board[y][x + 1] === BLUE &&
                board[y + 1][x] === BLUE && board[y + 1][x + 1] === BLUE) {
                // Form Blue Block
                board[y][x] = BLUE_BLOCK;
                board[y][x + 1] = BLUE_BLOCK;
                board[y + 1][x] = BLUE_BLOCK;
                board[y + 1][x + 1] = BLUE_BLOCK;
                if (player === BLUE) formed++;
            }
        }
    }
    if (formed > 0) renderBoard();
    return formed;
}

function triggerComboText(count) {
    elComboText.innerText = count + "ブロック" + (count > 2 ? "!!!" : "!");
    elComboText.classList.remove('hidden');
    elComboText.classList.remove('combo-anim');
    void elComboText.offsetWidth; // trigger reflow
    elComboText.classList.add('combo-anim');
}

function triggerBoardShake() {
    elBoardContainer.classList.remove('board-shake');
    void elBoardContainer.offsetWidth; // trigger reflow
    elBoardContainer.classList.add('board-shake');
    setTimeout(() => {
        elBoardContainer.classList.remove('board-shake');
    }, 500);
}



function updateScore() {
    // Score is simply number of blocks * 10.
    // Since each 2x2 block contains 4 BLOCK cells
    let redBlockCells = 0;
    let blueBlockCells = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (board[y][x] === RED_BLOCK) redBlockCells++;
            if (board[y][x] === BLUE_BLOCK) blueBlockCells++;
        }
    }

    scoreRed = Math.floor(redBlockCells / 4) * 10;
    scoreBlue = Math.floor(blueBlockCells / 4) * 10;

    updateScoreUI();
}

function updateScoreUI() {
    elScoreRed.innerText = scoreRed;
    elScoreBlue.innerText = scoreBlue;
}

// Validity Check
function isValidMoveOnBoard(x, y, player, checkBoard) {
    const currentVal = checkBoard[y][x];

    // Check 1 & 2: Cannot place on own or any block
    if (Math.abs(currentVal) === 2) return false; // Blocks are invulnerable
    if (currentVal === player) return false; // Cannot place on own

    // Must be adjacent to an existing Ohajiki of the SAME color
    let isAdjacent = false;
    const playerBlock = player * 2; // 2 for RED, -2 for BLUE

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue; // Skip center
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
                const neighbor = checkBoard[ny][nx];
                if (neighbor === player || neighbor === playerBlock) {
                    isAdjacent = true;
                    break;
                }
            }
        }
        if (isAdjacent) break;
    }

    return isAdjacent;
}

function isValidMove(x, y, player) {
    return isValidMoveOnBoard(x, y, player, board);
}

function hasAnyValidMoveOnBoard(player, checkBoard) {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (isValidMoveOnBoard(x, y, player, checkBoard)) {
                return true;
            }
        }
    }
    return false;
}

function hasAnyValidMove(player) {
    return hasAnyValidMoveOnBoard(player, board);
}

function showToast(msg) {
    elToast.innerText = msg;
    elToast.classList.remove('hidden');

    // reset animation
    elToast.style.animation = 'none';
    elToast.offsetHeight; // trigger reflow
    elToast.style.animation = null;

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        elToast.classList.add('hidden');
    }, 2000);
}

// Turn Handling
async function handleCellClick(x, y) {
    if (isGameOver) return;

    if (isAimingSkill && activeSkillPattern) {
        // Two-step placement for mobile/touch
        if (lastTappedSkillCell && lastTappedSkillCell.x === x && lastTappedSkillCell.y === y) {
            // Execute Skill on second tap
            activeSkillPattern.forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                    // Ignore blocks rule: overwrite forcefully
                    if (board[ny][nx] !== RED && board[ny][nx] !== RED_BLOCK) {
                        placePiece(nx, ny, RED);
                    }
                }
            });
            showToast("スキル発動!");
            cancelSkillAim();
            
            // Apply cooldown based on rarity
            let sd = SKILL_DATA.find(s => s.id === activeSkillId);
            if (sd) {
                let cd = 10; // Rare
                if (sd.rarity === 'srare') cd = 20;
                else if (sd.rarity === 'urare') cd = 30;
                else if (sd.rarity === 'prare') cd = 60;
                skillCooldowns[sd.id] = cd;
            }
            
            // Pass turn
            currentPlayer = BLUE;
            setTurnUI();
            handleTurnTransition();
        } else {
            // First tap: preview and set as candidate
            lastTappedSkillCell = { x, y };
            handleCellHover(x, y); // trigger highlight
            cells[y][x].classList.add('skill-candidate');
            showToast("もう一度タップで発動！");
        }
        return;
    }

    if (currentPlayer !== RED) return;

    if (!isValidMove(x, y, RED)) {
        showToast("そこには置けません");
        return;
    }

    // Place player piece
    placePiece(x, y, RED);

    if (movesRemaining > 0) {
        movesRemaining--;
        showToast(`あと ${movesRemaining + 1} 回置けます！`);
        updatePlaceableHighlight();
    } else {
        // Switch turn to blue
        currentPlayer = BLUE;
        setTurnUI();
        handleTurnTransition();
    }
}

function setTurnUI() {
    if (currentPlayer === RED) {
        elInfoRed.classList.add('active-turn');
        elInfoBlue.classList.remove('active-turn');
        elBoardContainer.classList.add('turn-red');
        elBoardContainer.classList.remove('turn-blue');
        elCpuThinking.classList.add('hidden');
        updatePlaceableHighlight();
    } else {
        elInfoBlue.classList.add('active-turn');
        elInfoRed.classList.remove('active-turn');
        elBoardContainer.classList.add('turn-blue');
        elBoardContainer.classList.remove('turn-red');
        elCpuThinking.classList.remove('hidden');
        clearPlaceableHighlight();
    }
}

function updatePlaceableHighlight() {
    if (currentPlayer !== RED) return;
}

function clearPlaceableHighlight() {
    for (const row of cells) {
        for (const cell of row) {
            cell.classList.remove('placeable');
        }
    }
}

function isBoardFull() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (board[y][x] === EMPTY) {
                return false;
            }
        }
    }
    return true;
}

async function handleTurnTransition() {
    if (isBoardFull()) {
        endGame();
        return;
    }

    if (currentPlayer === RED) {
        // Player turn start: reset awakening states if it was BLUE's turn before
        // (Actually it resets every time it's RED's turn)
        awakeningActive = false;
        movesRemaining = 0;
        btnSpecial.classList.remove('active-awakening');
        btnSpecial.style.boxShadow = "";
        updatePlaceableHighlight();
    }

    if (!hasAnyValidMove(currentPlayer)) {
        // Try other player
        const other = currentPlayer === RED ? BLUE : RED;
        if (!hasAnyValidMove(other)) {
            endGame();
            return;
        } else {
            // Swap back if no moves
            currentPlayer = other;
            setTurnUI();
            if (currentPlayer === BLUE) {
                doCPUTurn();
            }
        }
    } else {
        if (currentPlayer === BLUE) {
            doCPUTurn();
        }
    }
}

// CPU AI Logic
function simulateMove(currentBoard, x, y, player) {
    let nextB = currentBoard.map(row => [...row]);
    nextB[y][x] = player;

    const BLOCK = player === RED ? RED_BLOCK : BLUE_BLOCK;
    const TARGET = player === RED ? RED : BLUE;

    // Check 2x2 around placed piece to form blocks
    for (let dy = -1; dy <= 0; dy++) {
        for (let dx = -1; dx <= 0; dx++) {
            const cy = y + dy;
            const cx = x + dx;
            if (cy >= 0 && cy < GRID_SIZE - 1 && cx >= 0 && cx < GRID_SIZE - 1) {
                if ((nextB[cy][cx] === TARGET || nextB[cy][cx] === BLOCK) &&
                    (nextB[cy][cx + 1] === TARGET || nextB[cy][cx + 1] === BLOCK) &&
                    (nextB[cy + 1][cx] === TARGET || nextB[cy + 1][cx] === BLOCK) &&
                    (nextB[cy + 1][cx + 1] === TARGET || nextB[cy + 1][cx + 1] === BLOCK)) {
                    nextB[cy][cx] = BLOCK;
                    nextB[cy][cx + 1] = BLOCK;
                    nextB[cy + 1][cx] = BLOCK;
                    nextB[cy + 1][cx + 1] = BLOCK;
                }
            }
        }
    }
    return nextB;
}

function countBlocks(b, blockVal) {
    let count = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (b[y][x] === blockVal) count++;
        }
    }
    return count / 4;
}

function calculateMoveScore(b, x, y, player) {
    let score = 0;
    const target = player === BLUE ? RED : BLUE;
    const playerBlock = player * 2;
    const targetBlock = target * 2;

    // 2 相手ブロックの破壊 (opponent piece replacement) +90
    if (b[y][x] === target) score += 90;

    const nextB = simulateMove(b, x, y, player);

    // 1 ブロック完成 (complete a block) +100
    const playerBlocksBefore = countBlocks(b, playerBlock);
    const playerBlocksAfter = countBlocks(nextB, playerBlock);
    if (playerBlocksAfter > playerBlocksBefore) score += 100;

    // 4 相手のブロック形成阻止 (prevent opponent block) +70
    if (isValidMoveOnBoard(x, y, target, b)) {
        let opponentSim = simulateMove(b, x, y, target);
        if (countBlocks(opponentSim, targetBlock) > countBlocks(b, targetBlock)) {
            score += 70;
        }
    }

    // 3 自分ブロックの防御 (defend block / setup) +80
    let isAlmostBlock = false;
    for (let dy = -1; dy <= 0; dy++) {
        for (let dx = -1; dx <= 0; dx++) {
            let cy = y + dy;
            let cx = x + dx;
            if (cy >= 0 && cy < GRID_SIZE - 1 && cx >= 0 && cx < GRID_SIZE - 1) {
                let pCount = 0;
                let emptyCount = 0;
                const cells = [nextB[cy][cx], nextB[cy][cx + 1], nextB[cy + 1][cx], nextB[cy + 1][cx + 1]];
                for (let v of cells) {
                    if (v === player || v === playerBlock) pCount++;
                    if (v === EMPTY || v === target) emptyCount++;
                }
                if (pCount === 3 && emptyCount === 1) isAlmostBlock = true;
            }
        }
    }
    if (isAlmostBlock) score += 80;

    // 5 盤面中央への配置 +20
    if (x >= 3 && x <= 6 && y >= 3 && y <= 6) score += 20;

    // 6 自分のおはじきの隣接拡張 +10
    score += 10;

    // 7 相手が次のターンでブロックを作れる配置 -100
    let enemyCanBlock = false;
    let targetMoves = getValidMovesOnBoard(target, nextB);
    for (let m of targetMoves) {
        let oppSim = simulateMove(nextB, m.x, m.y, target);
        if (countBlocks(oppSim, targetBlock) > countBlocks(nextB, targetBlock)) {
            enemyCanBlock = true;
            break;
        }
    }
    if (enemyCanBlock) score -= 100;

    return score;
}

function getValidMovesOnBoard(player, b) {
    let moves = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (isValidMoveOnBoard(x, y, player, b)) {
                moves.push({ x, y });
            }
        }
    }
    return moves;
}

function simMinimax(b, depth, alpha, beta, isMaxPlayer) {
    if (depth === 0) return 0;

    let p = isMaxPlayer ? BLUE : RED;
    let moves = getValidMovesOnBoard(p, b);
    
    if (moves.length === 0) {
        let oppMoves = getValidMovesOnBoard(isMaxPlayer ? RED : BLUE, b);
        if (oppMoves.length === 0) return 0;
        return simMinimax(b, depth - 1, alpha, beta, !isMaxPlayer);
    }

    if (isMaxPlayer) {
        let maxEval = -Infinity;
        for (let m of moves) {
            let sc = calculateMoveScore(b, m.x, m.y, BLUE);
            let nb = simulateMove(b, m.x, m.y, BLUE);
            let ev = sc + simMinimax(nb, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, ev);
            alpha = Math.max(alpha, ev);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let m of moves) {
            let sc = calculateMoveScore(b, m.x, m.y, RED);
            let nb = simulateMove(b, m.x, m.y, RED);
            let ev = -sc + simMinimax(nb, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, ev);
            beta = Math.min(beta, ev);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

const CPU_SEARCH_DEPTH = 3;

async function doCPUTurn() {
    if (isGameOver) return;

    let validMoves = getValidMovesOnBoard(BLUE, board);
    if (validMoves.length === 0) {
        handleTurnTransition();
        return;
    }

    const thinkTime = 700 + Math.random() * 800;
    await new Promise(res => setTimeout(res, thinkTime));

    let candidates = [];
    let bestScore = -Infinity;

    for (let move of validMoves) {
        let baseScore = calculateMoveScore(board, move.x, move.y, BLUE);
        let nextB = simulateMove(board, move.x, move.y, BLUE);

        let totalScore = baseScore + simMinimax(nextB, CPU_SEARCH_DEPTH - 1, -Infinity, Infinity, false);

        if (totalScore > bestScore) {
            bestScore = totalScore;
            candidates = [move];
        } else if (totalScore === bestScore) {
            candidates.push(move);
        }
    }

    let chosen = candidates[Math.floor(Math.random() * candidates.length)];

    placePiece(chosen.x, chosen.y, BLUE);

    currentPlayer = RED;
    setTurnUI();
    handleTurnTransition();
}

function endGame() {
    isGameOver = true;
    elCursorFollower.classList.remove('active');

    // Show Result sequence
    elResult.classList.remove('hidden');

    // Sequence
    setTimeout(() => {
        resRedRow.classList.remove('hidden');
        resRedRow.classList.add('don-anim');
        resRedScore.innerText = scoreRed; // should match already
        playAudio(seResult);
    }, 1000);

    setTimeout(() => {
        resBlueRow.classList.remove('hidden');
        resBlueRow.classList.add('don-anim');
        resBlueScore.innerText = scoreBlue;
        playAudio(seResult);
    }, 2000);

    setTimeout(() => {
        resTitle.classList.remove('hidden');
        resTitle.classList.add('don-anim');

        if (scoreRed > scoreBlue) {
            resTitle.innerText = "勝利!!";
            resTitle.className = "result-title red don-anim";
            
            // Add trophies & Coins
            let trophyGain = 10;
            let coinGain = 100;
            
            storedTrophies += trophyGain;
            localStorage.setItem('territoryTrophies', storedTrophies);
            
            playerData.coins += coinGain; 
            
            // Result UI
            resRewardsDisplay.classList.remove('hidden');
            resCoinsValue.innerText = coinGain;
            resTrophiesValue.innerText = trophyGain;
            
            // Check for 30 trophy reward
            if (storedTrophies - playerData.lastTrophyRewardLevel >= 30) {
                playerData.coins += 1000;
                playerData.lastTrophyRewardLevel += 30; // update threshold
                showToast("トロフィーボーナス！ 1000コイン獲得！");
            }
            
            savePlayerData();
            updateLobbyTopBar();
            
        } else if (scoreBlue > scoreRed) {
            resTitle.innerText = "敗北...";
            resTitle.className = "result-title blue don-anim";
            playAudio(seResultLoss);
            return; // Skip the seResultLast play below
        } else {
            resTitle.innerText = "引き分け";
            resTitle.className = "result-title don-anim";
        }
        playAudio(seResultLast);
    }, 3000);

    setTimeout(() => {
        resButtons.classList.remove('hidden');
        resButtons.classList.add('fade-in');
    }, 3800);
}

// Mouse Follower Logic
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Lerp cursor position
    cursorX += (mouseX - cursorX) * 0.2; // Delay factor
    cursorY += (mouseY - cursorY) * 0.2;

    elCursorFollower.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;

    requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);


// Event Listeners
btnStart.addEventListener('click', () => {
    initGame();
});

if (btnToLobby) {
    btnToLobby.addEventListener('click', () => {
        elResult.classList.add('hidden');
        elLobby.classList.remove('hidden');
        elLobby.classList.add('fade-in');

        // Reset result UI bounds
        resRedRow.classList.add('hidden');
        resRedRow.classList.remove('don-anim');
        resBlueRow.classList.add('hidden');
        resBlueRow.classList.remove('don-anim');
        resTitle.classList.add('hidden');
        resTitle.classList.remove('don-anim');
        resButtons.classList.add('hidden');
        resButtons.classList.remove('fade-in');
    });
}

if (btnRestart) {
    btnRestart.addEventListener('click', () => {
        // Reset result bounds
        resRedRow.classList.add('hidden');
        resRedRow.classList.remove('don-anim');
        resBlueRow.classList.add('hidden');
        resBlueRow.classList.remove('don-anim');
        resTitle.classList.add('hidden');
        resTitle.classList.remove('don-anim');
        resButtons.classList.add('hidden');
        resButtons.classList.remove('fade-in');

        initGame();
    });
}

// Bottom Menu Bar Event Listeners
if (btnPass) {
    btnPass.addEventListener('click', () => {
        if (currentPlayer !== RED || isGameOver || isAimingSkill) return;

        currentPlayer = BLUE;
        setTurnUI();
        handleTurnTransition();
    });
}

let awakeningActive = false;
let movesRemaining = 0;

btnSpecial.addEventListener('click', () => {
    if (currentPlayer !== RED || isGameOver || isAimingSkill) return;
    if (awakeningActive) {
        showToast("すでに覚醒しています！");
        return;
    }
    if (!playerData.equippedAwakening) {
        showToast("覚醒術が装備されていません");
        return;
    }
    
    activateAwakening();
});

function startAwakeningCooldown(durationMs) {
    awakeningCooldownMax = durationMs;
    awakeningCooldownCurrent = durationMs;
    
    if (awakeningInterval) clearInterval(awakeningInterval);
    
    btnSpecial.disabled = true;
    
    awakeningInterval = setInterval(() => {
        if (isGameOver) return;
        
        awakeningCooldownCurrent -= 100;
        if (awakeningCooldownCurrent <= 0) {
            awakeningCooldownCurrent = 0;
            clearInterval(awakeningInterval);
            btnSpecial.disabled = false;
            elAwakeningGauge.style.width = "0%";
        } else {
            const percent = (awakeningCooldownCurrent / awakeningCooldownMax) * 100;
            elAwakeningGauge.style.width = percent + "%";
        }
    }, 100);
}

function activateAwakening() {
    const ad = AWAKENING_DATA.find(a => a.id === playerData.equippedAwakening);
    if (!ad) return;

    awakeningActive = true;
    btnSpecial.classList.add('active-awakening');
    btnSpecial.style.boxShadow = "0 0 20px #ffd32a";
    showToast(`${ad.name} 発動！！`);

    // Cooldown duration based on rarity
    let cd = 15000; // Rare
    if (ad.rarity === 'srare') cd = 30000;
    else if (ad.rarity === 'urare') cd = 45000;
    else if (ad.rarity === 'prare') cd = 60000;
    
    startAwakeningCooldown(cd);

    // Effects
    if (ad.id === 'a1') movesRemaining += 2; // Triple
    else if (ad.id === 'a2') movesRemaining += 1; // Quick
    else if (ad.id === 'a6') movesRemaining += 4; // God
    // Other effects would be handled in placePiece or similar if they were area effects
}

btnSkill.addEventListener('click', () => {
    if (currentPlayer !== RED || isGameOver || isAimingSkill) return;
    renderIngameSkills();
    ingameSkillOverlay.classList.remove('hidden');
});

btnCloseSkill.addEventListener('click', () => {
    ingameSkillOverlay.classList.add('hidden');
});

skillAimOverlay.addEventListener('click', () => {
    cancelSkillAim();
});

function cancelSkillAim() {
    isAimingSkill = false;
    activeSkillPattern = null;
    activeSkillId = null;
    lastTappedSkillCell = null;
    skillAimOverlay.classList.add('hidden');
    clearAimHighlight();
}

function renderIngameSkills() {
    ingameCardsContainer.innerHTML = '';
    
    let validEquipped = playerData.equippedSkills.filter(v => v);
    if(validEquipped.length === 0){
        ingameCardsContainer.innerHTML = '<p>装備しているスキルがありません</p>';
        return;
    }

    // Calculate current RED basic blocks
    let redBlockCells = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (board[y][x] === RED_BLOCK) redBlockCells++;
        }
    }
    let currentBlocks = Math.floor(redBlockCells / 4);

    validEquipped.forEach(skillId => {
        let sd = SKILL_DATA.find(s => s.id === skillId);
        if(!sd) return;
        
        let reqBlocks = 2; // RARE
        if (sd.rarity === 'srare') reqBlocks = 3;
        else if (sd.rarity === 'urare') reqBlocks = 5;
        else if (sd.rarity === 'prare') reqBlocks = 10;

        let el = generateSkillCardEl(sd);
        
        // Add block requirement label
        let reqLabel = document.createElement('div');
        reqLabel.style.fontSize = '0.7rem';
        reqLabel.style.fontWeight = 'bold';
        reqLabel.style.marginTop = '2px';
        reqLabel.style.color = currentBlocks >= reqBlocks ? '#2ed573' : '#ff4757';
        reqLabel.innerText = `必要ブロック: ${reqBlocks} (現在: ${currentBlocks})`;
        el.appendChild(reqLabel);
        
        const cdLeft = skillCooldowns[skillId] || 0;

        if (cdLeft > 0) {
            el.classList.add('cooldown');
            let timerEl = document.createElement('div');
            timerEl.className = 'cooldown-timer';
            timerEl.innerText = cdLeft + 's';
            el.appendChild(timerEl);
            el.style.pointerEvents = 'none';
        } else if (currentBlocks < reqBlocks) {
            el.style.opacity = '0.5';
            el.style.filter = 'grayscale(100%)';
            el.style.pointerEvents = 'none';
        } else {
            el.addEventListener('click', () => {
                isAimingSkill = true;
                activeSkillPattern = sd.pattern;
                activeSkillId = sd.id;
                ingameSkillOverlay.classList.add('hidden');
                skillAimOverlay.classList.remove('hidden');
            });
        }
        ingameCardsContainer.appendChild(el);
    });
}

// In-Game Menu & Settings Event Listeners
if (btnIngameMenu) {
    btnIngameMenu.addEventListener('click', () => {
        elIngameMenuOverlay.classList.remove('hidden');
    });
}

btnResume.addEventListener('click', () => {
    elIngameMenuOverlay.classList.add('hidden');
});

btnSettings.addEventListener('click', () => {
    elIngameMenuOverlay.classList.add('hidden');
    elSettingsOverlay.classList.remove('hidden');
});

btnSettingsClose.addEventListener('click', () => {
    elSettingsOverlay.classList.add('hidden');
    // If we're not in Lobby, go back to Ingame Menu
    if (elLobby.classList.contains('hidden') && elResult.classList.contains('hidden')) {
        elIngameMenuOverlay.classList.remove('hidden');
    }
});

// Settings Handlers (both in-game and lobby versions)
function handleVolInput(e) { updateVolume(e.target.value); }
function handleThemeInput(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}
if (volSlider) volSlider.addEventListener('input', handleVolInput);
const elLobbyVol = document.getElementById('lobby-vol-slider');
if (elLobbyVol) elLobbyVol.addEventListener('input', handleVolInput);

if (themeSwitch) themeSwitch.addEventListener('change', handleThemeInput);
const elLobbyTheme = document.getElementById('lobby-theme-switch');
if (elLobbyTheme) elLobbyTheme.addEventListener('change', handleThemeInput);

document.getElementById('btn-reset-data').addEventListener('click', () => {
    if(confirm("全てのスキルとトロフィーのエータを初期化します。よろしいですか？")) {
        localStorage.clear();
        location.reload();
    }
});

if (btnIgRestart) {
    btnIgRestart.addEventListener('click', () => {
        elIngameMenuOverlay.classList.add('hidden');
        elRestartConfirmOverlay.classList.remove('hidden');
    });
}

if (btnConfirmRestart) {
    btnConfirmRestart.addEventListener('click', () => {
        elRestartConfirmOverlay.classList.add('hidden');
        initGame();
    });
}

if (btnCancelRestart) {
    btnCancelRestart.addEventListener('click', () => {
        elRestartConfirmOverlay.classList.add('hidden');
        elIngameMenuOverlay.classList.remove('hidden');
    });
}

if (btnIgLobby) {
    btnIgLobby.addEventListener('click', () => {
        // Make sure all screens properly shut down
        elIngameMenuOverlay.classList.add('hidden');
        elLobby.classList.remove('hidden');
        elLobby.classList.add('fade-in');
    });
}

// Color Selection Logic
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        // Deselect others
        colorSwatches.forEach(s => s.classList.remove('selected'));
        // Select this
        e.currentTarget.classList.add('selected');

        let p1Color = e.currentTarget.dataset.color;
        let p2Color = colorPairs[p1Color] || '#2f3542';

        document.documentElement.style.setProperty('--red-color', p1Color);
        document.documentElement.style.setProperty('--blue-color', p2Color);
    });
});

// Audio Helper
function playAudio(audioElem) {
    if (!audioElem) return;
    audioElem.currentTime = 0;
    audioElem.play().catch(e => console.warn("Audio autoplay blocked", e));
}

function updateVolume(val) {
    const v = parseFloat(val);
    if (seSet) seSet.volume = v;
    if (seResult) seResult.volume = v;
    if (seResultLast) seResultLast.volume = v;
    if (seResultLoss) seResultLoss.volume = v;
    if (seButton) seButton.volume = v;
    if (seStart) seStart.volume = v;
    if (seCancel) seCancel.volume = v;
    volSlider.value = v;
    document.getElementById('lobby-vol-slider').value = v;
}

// Initial vol application
updateVolume(volSlider.value);

// Global Button Sound Listener
document.addEventListener('click', (e) => {
    let btn = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
    if (btn) {
        // Play cancel sound for specific buttons
        if (btn.id === 'btn-close-skill' || 
            btn.id === 'btn-close-gacha' || 
            btn.id === 'btn-close-odds' || 
            btn.id === 'btn-close-inventory' || 
            btn.id === 'btn-close-trophy-reward' || 
            btn.id === 'btn-cancel-restart' ||
            btn.id === 'btn-settings-close' ||
            btn.classList.contains('secondary-btn') && (btn.innerText.includes('キャンセル') || btn.innerText.includes('閉じる'))
        ) {
            playAudio(seCancel);
        } else {
            playAudio(seButton);
        }
    }
});

// --- Lobby Specific Logic ---

// Tab Switching
lobbyNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Deselect all
        lobbyNavBtns.forEach(b => b.classList.remove('active'));
        lobbyTabs.forEach(t => t.classList.add('hidden'));

        // Select clicked
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.remove('hidden');
        renderLobbyEquippedCards(); // refresh just in case
    });
});

// Render cards
function generateSkillCardEl(skillData) {
    let el = document.createElement('div');
    el.className = `skill-card ${skillData.rarity}`;
    
    let titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.innerText = skillData.name;
    
    let grid = document.createElement('div');
    grid.className = 'card-grid';
    // 5x5 grid visualization
    for (let gy = -2; gy <= 2; gy++) {
        for (let gx = -2; gx <= 2; gx++) {
            let cell = document.createElement('div');
            cell.className = 'card-grid-cell';
            if (gy === 0 && gx === 0) cell.classList.add('center');
            
            let isPart = skillData.pattern.find(p => p[0] === gx && p[1] === gy);
            if(isPart) cell.classList.add('active');
            
            grid.appendChild(cell);
        }
    }
    
    el.appendChild(titleEl);
    el.appendChild(grid);
    return el;
}

function renderLobbyEquippedCards() {
    equippedCardsContainer.innerHTML = '';
    // Skills (slots 0, 1, 2)
    for(let i=0; i<3; i++) {
        let skillId = playerData.equippedSkills[i];
        if (skillId) {
            let sd = SKILL_DATA.find(s => s.id === skillId);
            if (sd) {
                let el = generateSkillCardEl(sd);
                el.addEventListener('click', () => openInventory(i));
                equippedCardsContainer.appendChild(el);
            }
        } else {
            let el = document.createElement('div');
            el.className = 'empty-card-slot';
            el.innerText = '未装備';
            el.addEventListener('click', () => openInventory(i));
            equippedCardsContainer.appendChild(el);
        }
    }

    // Awakening (separate slot)
    equippedAwakeningContainer.innerHTML = '';
    if (playerData.equippedAwakening) {
        let ad = AWAKENING_DATA.find(a => a.id === playerData.equippedAwakening);
        if (ad) {
            let el = generateAwakeningCardEl(ad);
            el.addEventListener('click', () => openAwakeningInventory());
            equippedAwakeningContainer.appendChild(el);
        }
    } else {
        let el = document.createElement('div');
        el.className = 'empty-card-slot';
        el.style.width = '120px';
        el.innerText = '覚醒術未装備';
        el.addEventListener('click', () => openAwakeningInventory());
        equippedAwakeningContainer.appendChild(el);
    }
}

function generateAwakeningCardEl(ad) {
    let el = document.createElement('div');
    el.className = `skill-card awakening ${ad.rarity}`;
    el.innerHTML = `
        <div class="card-title">${ad.name}</div>
        <div style="font-size: 0.6rem; color: #57606f; margin-top: 5px; text-align: center;">[覚醒術]</div>
        <div style="font-size: 0.55rem; color: #747d8c; margin-top: 8px; text-align: center; padding: 0 4px; line-height: 1.2;">${ad.desc}</div>
    `;
    return el;
}

let pickingSlotIndex = 0;
let pickingType = 'skill'; // 'skill' or 'awakening'

function openInventory(slotIndex) {
    pickingType = 'skill';
    pickingSlotIndex = slotIndex;
    inventoryOverlay.classList.remove('hidden');
    renderInventoryModal();
}

function openAwakeningInventory() {
    pickingType = 'awakening';
    inventoryOverlay.classList.remove('hidden');
    renderInventoryModal();
}

function renderInventoryModal() {
    inventoryCardsContainer.innerHTML = '';
    
    if (pickingType === 'awakening') {
        if (playerData.unlockedAwakenings.length === 0) {
            inventoryCardsContainer.innerHTML = '<p style="color: #a4b0be; margin-top: 20px;">所持している覚醒術がありません</p>';
            return;
        }
        playerData.unlockedAwakenings.forEach(id => {
            let ad = AWAKENING_DATA.find(a => a.id === id);
            if(!ad) return;
            let el = generateAwakeningCardEl(ad);
            el.classList.add('card-selectable');
            if (playerData.equippedAwakening === id) el.classList.add('selected');
            el.addEventListener('click', () => {
                playerData.equippedAwakening = id;
                savePlayerData();
                renderLobbyEquippedCards();
                renderInventoryModal();
            });
            inventoryCardsContainer.appendChild(el);
        });
    } else {
        // Skill picking
        let uniqueUnlocked = [...new Set(playerData.unlockedSkills)];
        if (uniqueUnlocked.length === 0) {
            inventoryCardsContainer.innerHTML = '<p style="color: #a4b0be; margin-top: 20px;">所持しているスキルがありません</p>';
            return;
        }
        uniqueUnlocked.forEach(id => {
            let sd = SKILL_DATA.find(s => s.id === id);
            if(!sd) return;
            let el = generateSkillCardEl(sd);
            el.classList.add('card-selectable');
            if (playerData.equippedSkills[pickingSlotIndex] === id) el.classList.add('selected');
            el.addEventListener('click', () => {
                // If this skill is already equipped in another slot, unequip it there? No, allow duplicates if they have multiple cards?
                // Actually the requirement says "player starts with no unlocked skills", so we treat them as unique unlocks.
                playerData.equippedSkills[pickingSlotIndex] = id;
                savePlayerData();
                renderLobbyEquippedCards();
                renderInventoryModal();
            });
            inventoryCardsContainer.appendChild(el);
        });
    }
}

btnCloseInventory.addEventListener('click', () => {
    inventoryOverlay.classList.add('hidden');
});


const btnRollAwakening = document.getElementById('btn-roll-awakening');

function updateGachaBtnText() {
    if (!playerData.hasRolledFreeGacha) {
        btnRollGacha.innerText = "1回引く (初回無料)";
    } else {
        btnRollGacha.innerText = "1回引く (1000コイン)";
    }
    
    if (!playerData.hasRolledFreeAwakening) {
        btnRollAwakening.innerText = "1回引く (初回無料)";
    } else {
        btnRollAwakening.innerText = "1回引く (1500コイン)";
    }
}
updateGachaBtnText();

// Gacha Slider Mouse/Touch Drag
const gachaSliderContainer = document.querySelector('.gacha-slider-container');
let isDraggingSlider = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;

gachaSliderContainer.addEventListener('mousedown', dragStart);
gachaSliderContainer.addEventListener('touchstart', dragStart);
gachaSliderContainer.addEventListener('mouseup', dragEnd);
gachaSliderContainer.addEventListener('mouseleave', dragEnd);
gachaSliderContainer.addEventListener('touchend', dragEnd);
gachaSliderContainer.addEventListener('mousemove', dragging);
gachaSliderContainer.addEventListener('touchmove', dragging);

function dragStart(e) {
    isDraggingSlider = true;
    startX = getPositionX(e);
    animationID = requestAnimationFrame(animation);
    gachaSlider.classList.add('no-transition');
}

function dragging(e) {
    if (isDraggingSlider) {
        const currentX = getPositionX(e);
        currentTranslate = prevTranslate + currentX - startX;
    }
}

function dragEnd() {
    isDraggingSlider = false;
    cancelAnimationFrame(animationID);
    gachaSlider.classList.remove('no-transition');

    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -100 && currentGachaSlide < 1) {
        currentGachaSlide++;
    } else if (movedBy > 100 && currentGachaSlide > 0) {
        currentGachaSlide--;
    }

    setPositionByIndex();
}

function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

function animation() {
    setSliderPosition();
    if (isDraggingSlider) requestAnimationFrame(animation);
}

function setSliderPosition() {
    gachaSlider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
    currentTranslate = currentGachaSlide * -gachaSliderContainer.offsetWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    gachaDots.forEach((d, i) => d.classList.toggle('active', i === currentGachaSlide));
}

btnRollGacha.addEventListener('click', () => {
    rollGacha('skill');
});

btnRollAwakening.addEventListener('click', () => {
    rollGacha('awakening');
});

function rollGacha(type) {
    let cost = 0;
    if (type === 'skill') {
        cost = playerData.hasRolledFreeGacha ? 1000 : 0;
    } else {
        cost = playerData.hasRolledFreeAwakening ? 1500 : 0;
    }
    
    if (playerData.coins < cost) {
        showToast("コインが足りません！");
        return;
    }

    playerData.coins -= cost;
    if (type === 'skill') playerData.hasRolledFreeGacha = true;
    else playerData.hasRolledFreeAwakening = true;
    
    updateLobbyTopBar();
    updateGachaBtnText();
    savePlayerData();

    // Determine Rarity
    let r = Math.random() * 100;
    let selectedRarity = 'rare';
    if (r < 5) selectedRarity = 'prare';
    else if (r < 20) selectedRarity = 'urare';
    else if (r < 50) selectedRarity = 'srare';
    else selectedRarity = 'rare';
    
    // Pick card
    let picked;
    if (type === 'skill') {
        let pool = SKILL_DATA.filter(s => s.rarity === selectedRarity);
        picked = pool[Math.floor(Math.random() * pool.length)];
        playerData.unlockedSkills.push(picked.id);
    } else {
        let pool = AWAKENING_DATA.filter(a => a.rarity === selectedRarity);
        picked = pool[Math.floor(Math.random() * pool.length)];
        playerData.unlockedAwakenings.push(picked.id);
    }
    
    // Trigger animation
    const machine = type === 'skill' ? document.querySelector('.gacha-machine') : document.querySelector('.awakening-machine');
    const display = machine.querySelector('.gacha-display');
    display.innerHTML = '<span>!!</span>';
    
    // Show overlay
    gachaResultOverlay.classList.remove('hidden');
    gachaResultContent.innerHTML = ''; 
    
    let el = type === 'skill' ? generateSkillCardEl(picked) : generateAwakeningCardEl(picked);
    el.style.width = '140px'; 
    el.style.height = '200px'; 
    el.classList.add(`gacha-anim-${selectedRarity}`);
    gachaResultContent.appendChild(el);
    
    savePlayerData();
    
    // Auto-hide
    setTimeout(() => {
        if (!gachaResultOverlay.classList.contains('hidden')) {
            gachaResultOverlay.classList.add('hidden');
            gachaResultContent.innerHTML = '';
        }
    }, 5000);

    setTimeout(() => {
        display.innerHTML = type === 'skill' ? '<span>?</span>' : '<span>!</span>';
    }, 1000);
}

// Trophy Rewards logic
trophyTrigger.addEventListener('click', () => {
    updateTrophyRewardUI();
    trophyRewardOverlay.classList.remove('hidden');
});

btnCloseTrophyReward.addEventListener('click', () => {
    trophyRewardOverlay.classList.add('hidden');
});

const trophyRewardList = document.getElementById('trophy-reward-list');

const btnShowOdds = document.getElementById('btn-show-odds');
const gachaOddsOverlay = document.getElementById('gacha-odds-overlay');
const btnCloseOdds = document.getElementById('btn-close-odds');
const oddsItemsList = document.getElementById('odds-items-list');
const oddsTabBtns = document.querySelectorAll('.odds-tab-btn');

let currentOddsType = 'skill';

btnShowOdds.addEventListener('click', () => {
    gachaOddsOverlay.classList.remove('hidden');
    renderOddsList();
});

btnCloseOdds.addEventListener('click', () => {
    gachaOddsOverlay.classList.add('hidden');
});

oddsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        oddsTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentOddsType = btn.dataset.type;
        renderOddsList();
    });
});

function renderOddsList() {
    oddsItemsList.innerHTML = '';
    const data = currentOddsType === 'skill' ? SKILL_DATA : AWAKENING_DATA;
    
    // Sort by rarity
    const rarityOrder = { 'prare': 0, 'urare': 1, 'srare': 2, 'rare': 3 };
    const sorted = [...data].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    
    sorted.forEach(item => {
        let el = currentOddsType === 'skill' ? generateSkillCardEl(item) : generateAwakeningCardEl(item);
        el.style.transform = 'scale(0.8)';
        el.style.margin = '-10px';
        oddsItemsList.appendChild(el);
    });
}

function updateTrophyRewardUI() {
    let progress = storedTrophies % 50;
    trophyRewardBar.style.width = `${(progress / 50) * 100}%`;
    trophyRewardText.innerText = `${progress} / 50`;
    
    // Reward List Rendering
    trophyRewardList.innerHTML = '';
    REWARD_LEVELS.forEach(reward => {
        const item = document.createElement('div');
        const isAchieved = storedTrophies >= reward.threshold;
        const isClaimed = playerData.rewardClaimedTrophies >= reward.threshold;
        const isCurrent = storedTrophies < reward.threshold && (storedTrophies >= reward.threshold - 50);
        
        item.className = `reward-item ${isAchieved ? 'achieved' : (isCurrent ? 'current' : 'locked')}`;
        
        let statusText = '未達成';
        let statusClass = 'status-locked';
        if (isClaimed) {
            statusText = '獲得済み';
            statusClass = 'status-achieved';
        } else if (isAchieved) {
            statusText = '受取可能';
            statusClass = 'status-claimable';
        }

        item.innerHTML = `
            <div class="reward-icon-box">${getRewardIcon(reward.type)}</div>
            <div class="reward-details">
                <span class="reward-threshold">${reward.threshold} トロフィー</span>
                <span class="reward-name">${reward.name}</span>
            </div>
            <span class="reward-status ${statusClass}">${statusText}</span>
        `;
        trophyRewardList.appendChild(item);
    });

    const nextReward = REWARD_LEVELS.find(r => r.threshold > playerData.rewardClaimedTrophies);
    if (nextReward && storedTrophies >= nextReward.threshold) {
        rewardClaimSection.classList.remove('hidden');
    } else {
        rewardClaimSection.classList.add('hidden');
    }
}

function getRewardIcon(type) {
    if (type.includes('skill')) return '🃏';
    if (type.includes('awakening')) return '🔥';
    if (type.includes('coins')) return '💰';
    return '🏆';
}

btnClaimReward.addEventListener('click', () => {
    const nextReward = REWARD_LEVELS.find(r => r.threshold > playerData.rewardClaimedTrophies);
    if (!nextReward || storedTrophies < nextReward.threshold) return;

    handleReward(nextReward);
    
    playerData.rewardClaimedTrophies = nextReward.threshold;
    savePlayerData();
    
    showToast(`報酬獲得！ ${nextReward.name} を入手しました！`);
    updateTrophyRewardUI();
    updateLobbyTopBar();
});

function handleReward(reward) {
    let pool, picked;
    switch(reward.type) {
        case 'skill_high':
            pool = SKILL_DATA.filter(s => s.rarity === 'urare' || s.rarity === 'prare');
            picked = pool[Math.floor(Math.random() * pool.length)];
            playerData.unlockedSkills.push(picked.id);
            break;
        case 'awakening':
            picked = AWAKENING_DATA[Math.floor(Math.random() * AWAKENING_DATA.length)];
            playerData.unlockedAwakenings.push(picked.id);
            break;
        case 'coins':
            playerData.coins += reward.value;
            break;
        case 'skill_prare':
            pool = SKILL_DATA.filter(s => s.rarity === 'prare');
            picked = pool[Math.floor(Math.random() * pool.length)];
            playerData.unlockedSkills.push(picked.id);
            break;
        case 'awakening_high':
            pool = AWAKENING_DATA.filter(a => a.rarity === 'urare' || a.rarity === 'prare');
            picked = pool[Math.floor(Math.random() * pool.length)];
            playerData.unlockedAwakenings.push(picked.id);
            break;
        case 'both_prare':
            // One PR skill
            pool = SKILL_DATA.filter(s => s.rarity === 'prare');
            picked = pool[Math.floor(Math.random() * pool.length)];
            playerData.unlockedSkills.push(picked.id);
            // One PR awakening
            pool = AWAKENING_DATA.filter(a => a.rarity === 'prare');
            picked = pool[Math.floor(Math.random() * pool.length)];
            playerData.unlockedAwakenings.push(picked.id);
            break;
        case 'all_skills':
            SKILL_DATA.forEach(s => {
                if(!playerData.unlockedSkills.includes(s.id)) playerData.unlockedSkills.push(s.id);
            });
            break;
        case 'title':
            if (!playerData.unlockedTitles.includes(reward.titleName)) {
                playerData.unlockedTitles.push(reward.titleName);
            }
            break;
    }
}

btnCloseGacha.addEventListener('click', () => {
    gachaResultOverlay.classList.add('hidden');
    gachaResultContent.innerHTML = '';
});

btnCloseTrophyReward.addEventListener('click', () => {
    trophyRewardOverlay.classList.add('hidden');
});

// Drag scroll for trophy reward list
function initTrophyDragScroll() {
    let isDown = false;
    let startX;
    let scrollLeft;
    let startTime;
    let startScrollX;

    const getX = (e) => {
        if (e.type.includes('mouse')) return e.pageX;
        return e.touches ? e.touches[0].pageX : 0;
    };

    const startDrag = (e) => {
        isDown = true;
        trophyRewardList.classList.add('active-drag');
        startX = getX(e);
        scrollLeft = trophyRewardList.scrollLeft;
        startTime = Date.now();
        startScrollX = scrollLeft;
    };

    const endDrag = (e) => {
        if (!isDown) return;
        isDown = false;
        trophyRewardList.classList.remove('active-drag');
        
        // Momentum
        const duration = Date.now() - startTime;
        const moved = trophyRewardList.scrollLeft - startScrollX;
        if (duration < 250 && Math.abs(moved) > 20) {
            const velocity = moved / duration;
            const momentum = velocity * 300;
            trophyRewardList.scrollTo({
                left: trophyRewardList.scrollLeft + momentum,
                behavior: 'smooth'
            });
        }
    };

    const moveDrag = (e) => {
        if (!isDown) return;
        const x = getX(e);
        const walk = (x - startX) * 2; 
        trophyRewardList.scrollLeft = scrollLeft - walk;
    };

    trophyRewardList.addEventListener('mousedown', startDrag);
    trophyRewardList.addEventListener('touchstart', startDrag, { passive: true });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
    
    trophyRewardList.addEventListener('mousemove', moveDrag);
    trophyRewardList.addEventListener('touchmove', moveDrag, { passive: true });
}

initTrophyDragScroll();
renderLobbyEquippedCards();
