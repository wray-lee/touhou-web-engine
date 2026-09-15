import type { CharacterId } from '../../../touhou-common/player/CharacterProfile';
import type { DialogueLine } from '../../../touhou-common/ui/DialogueSystem';
import type { StageNumber } from '../types';

/**
 * EoSD stage-side scripts. Taisei ships real dialogue portraits for the
 * playable teams plus Cirno/Elly/Hina/Iku/Kurumi/Scuttle/Wriggle/Yumemi; every
 * other speaker falls back to a monogram badge, so no line is ever faceless.
 */

/** The two members of each playable team, in display order. */
export const TEAM_NAMES: Record<CharacterId, [string, string]> = {
  'reimu-yukari': ['霊夢', '紫'],
  'marisa-alice': ['魔理沙', 'アリス'],
  'sakuya-remilia': ['咲夜', 'レミリア'],
  'youmu-yuyuko': ['妖夢', '幽々子'],
};

/** Boss display names per stage (matches STAGE_METADATA.boss). */
const BOSS_NAMES: Record<StageNumber, string> = {
  1: 'ルミア',
  2: 'リグル',
  3: 'ミスティア',
  4: '慧音',
  5: '鈴仙',
  6: '永琳',
};
/** Opening lines played when the stage loads, spoken by the chosen team. */
const STAGE_INTRO: Record<StageNumber, DialogueLine[][]> = {
  1: [
    [
      {
        speaker: '霊夢',
        text: '暗闇ね……太陽はもう沈んだはずだけど、随分と早い暗がり方ね。',
        mood: 'puzzled',
      },
      { speaker: '紫', text: 'これは自然の夜じゃないわ。誰かが意図して闇を運んできているの。', mood: 'smug' },
      { speaker: '霊夢', text: '面倒ね。光を返してもらうだけよ。', mood: 'normal' },
    ],
    [
      { speaker: '魔理沙', text: 'おい暗すぎだぞ！ 魔法使いに夜道は似合わん！', mood: 'surprised' },
      { speaker: 'アリス', text: '文句を言わないで、とっとと原因を潰しに行くの。', mood: 'annoyed' },
      { speaker: '魔理沙', text: 'そいつはいい、派手にやってやるぜ。', mood: 'happy' },
    ],
    [
      { speaker: '咲夜', text: '屋敷の時計が狂っています。夜が、早すぎる。', mood: 'puzzled' },
      { speaker: 'レミリア', text: 'ふふ、私の力を盗った誰かを、お仕置きしてあげなさい。', mood: 'smug' },
      { speaker: '咲夜', text: '承知しました、ご主人様。', mood: 'normal' },
    ],
    [
      { speaker: '妖夢', text: '真っ暗で庭石が見えません、これは困ります。', mood: 'annoyed' },
      { speaker: '幽々子', text: 'あら、夜が好きな人って意外に多いのよ。探してみましょう？', mood: 'happy' },
      { speaker: '妖夢', text: '幽々子様のためなら、相手は誰でもいいです。', mood: 'normal' },
    ],
  ],
  2: [
    [
      { speaker: '霊夢', text: '秋の虫が騒いでいるわ。それも、ありえない数で。', mood: 'puzzled' },
      { speaker: '紫', text: '月が狂えば虫も狂う。因果はいつも逆から現れるの。', mood: 'smug' },
    ],
    [
      { speaker: '魔理沙', text: '蛍が空を埋めてる！ あんなの初めて見るぞ！', mood: 'surprised' },
      { speaker: 'アリス', text: '人形より数が多いわね。嫌になるわ。', mood: 'annoyed' },
    ],
    [
      { speaker: '咲夜', text: '地上の星が動いています。流星ではありません。', mood: 'puzzled' },
      { speaker: 'レミリア', text: '小さな命が月を数えているのよ。無粋ね。', mood: 'normal' },
    ],
    [
      { speaker: '妖夢', text: '虫の音が耳障りです。庭の虫も落ち着きません。', mood: 'annoyed' },
      { speaker: '幽々子', text: '蛍って綺麗だけど、あれだけあると目障りね。', mood: 'smug' },
    ],
  ],
  3: [
    [
      { speaker: '霊夢', text: '歌が聞こえる……夜雀の歌よ。耳を塞いでも無駄そうね。', mood: 'puzzled' },
      { speaker: '紫', text: '方向感覚を狂わされる前に、声の持ち主を黙らせましょう。', mood: 'normal' },
    ],
    [
      { speaker: '魔理沙', text: 'うっとうしい歌だ！ 耳栓しても抜けてくるぞ！', mood: 'annoyed' },
      { speaker: 'アリス', text: '歌で人を迷わせるなんて、随分と卑怯ね。', mood: 'normal' },
    ],
    [
      { speaker: '咲夜', text: '森の中で三周目です。どうやら道が消えているようです。', mood: 'puzzled' },
      { speaker: 'レミリア', text: '夜雀よ。私の夜に口を利かせはしないわ。', mood: 'smug' },
    ],
    [
      { speaker: '妖夢', text: 'この歌、聞き覚えが……あ、庭で聴いたことがあります。', mood: 'surprised' },
      { speaker: '幽々子', text: 'あら、あなたも歌姫のファンだったの？', mood: 'happy' },
    ],
  ],
  4: [
    [
      { speaker: '霊夢', text: '里が騒いでいるわ。歴史が、書き換えられかけている。', mood: 'annoyed' },
      { speaker: '紫', text: '守るために過去を操る者。一番たちが悪い部類ね。', mood: 'normal' },
    ],
    [
      { speaker: '魔理沙', text: '村の連中が妙に元気だ。何か盛ったな、絶対。', mood: 'puzzled' },
      { speaker: 'アリス', text: '歴史を改変する半人半妖。興味はありますが、危険ですわ。', mood: 'smug' },
    ],
    [
      {
        speaker: '咲夜',
        text: '里の人間が我々を「伝承」と呼んでいます。都合がいいので放置します。',
        mood: 'normal',
      },
      { speaker: 'レミリア', text: '永遠に生きれば神にもなれるのよ。ふふ、便利ね。', mood: 'smug' },
    ],
    [
      {
        speaker: '妖夢',
        text: '幽々子様、この里の記録、あなたが出てくる回が増えています。',
        mood: 'puzzled',
      },
      { speaker: '幽々子', text: 'あら、私ってば有名人。もっと大きく書いてもらいましょう。', mood: 'happy' },
    ],
  ],
  5: [
    [
      { speaker: '霊夢', text: '月が、近い。まるで今にも落ちてきそうよ。', mood: 'surprised' },
      { speaker: '紫', text: 'あの兎、月に使われていたはず。帰還命令が出たのね。', mood: 'normal' },
    ],
    [
      { speaker: '魔理沙', text: '月の兎が本気出してやがった！ 目がおかしいぞ！', mood: 'surprised' },
      { speaker: 'アリス', text: '幻術で視覚を狂わせる……厄介な相手ね。', mood: 'puzzled' },
    ],
    [
      { speaker: '咲夜', text: '月への帰還。ご主人様にとって、それは禁句です。', mood: 'annoyed' },
      { speaker: 'レミリア', text: 'あの手綱を引く兎は、屋敷の者ではない。壊していいわ。', mood: 'smug' },
    ],
    [
      { speaker: '妖夢', text: '月の兎……庭の兎とは格が違うようです。', mood: 'puzzled' },
      { speaker: '幽々子', text: '永い夜を生きる人の目は、だいたい狂ってるのよ。', mood: 'normal' },
    ],
  ],
  6: [
    [
      { speaker: '霊夢', text: 'もう夜が明けない。これは誰かの「意思」で止まっている夜。', mood: 'annoyed' },
      { speaker: '紫', text: '永遠を殺す薬を作る賢者。止めるしかないわ。', mood: 'normal' },
    ],
    [
      { speaker: '魔理沙', text: '朝が来ねぇ！ 俺の朝返せ！', mood: 'annoyed' },
      { speaker: 'アリス', text: '月の賢者……力では勝てない相手だと言われているわ。', mood: 'puzzled' },
    ],
    [
      { speaker: '咲夜', text: '永琳。屋敷の主人を狂わせているのは、あなたですね。', mood: 'annoyed' },
      { speaker: 'レミリア', text: '月を落とすつもりなら、私が先に月を落とす。', mood: 'smug' },
    ],
    [
      { speaker: '妖夢', text: '永夜を終わらせる薬……それは誰のための薬ですか。', mood: 'puzzled' },
      { speaker: '幽々子', text: '永い夜は退屈なの。終わらせてもらいましょう。', mood: 'normal' },
    ],
  ],
};
/** Boss-side lines played right before the encounter, per stage. */
const BOSS_ENCOUNTER: Record<StageNumber, DialogueLine[]> = {
  1: [{ speaker: 'ルミア', text: '暗闇は私のもの。光が欲しいなら、私を越えていきなさい！', mood: 'smug' }],
  2: [
    {
      speaker: 'リグル',
      text: '秋の終わりを告げるのは私たち。月を数えるのを、やめるわけにはいかないの。',
      mood: 'normal',
    },
  ],
  3: [
    { speaker: 'ミスティア', text: '私の歌を聴いた以上、迷子になってもらうわ。夜雀の掟よ！', mood: 'smug' },
  ],
  4: [{ speaker: '慧音', text: '里の歴史は私が守る。外からの干渉は、ここで止める！', mood: 'annoyed' }],
  5: [
    { speaker: '鈴仙', text: '月へ帰らねば。邪魔をするなら、幻覚で視ることをやめさせます。', mood: 'normal' },
  ],
  6: [{ speaker: '永琳', text: '永夜は完成しつつある。貴方たちのご主人も、もう戻れない。', mood: 'smug' }],
};

/** Spell card call-outs, keyed by stage then phase index (1 = first card). */
const SPELL_CALLOUTS: Record<StageNumber, DialogueLine[][]> = {
  1: [[{ speaker: 'ルミア', text: '闇符「デマケーション・サイン」！ 夜を切り分けてあげる！', mood: 'smug' }]],
  2: [[{ speaker: 'リグル', text: '蛍符「地上の流星」！ 秋の夜空を奪います！', mood: 'normal' }]],
  3: [[{ speaker: 'ミスティア', text: '声符「木菟咆哮」！ この歌から逃げられるかしら？', mood: 'smug' }]],
  4: [[{ speaker: '慧音', text: '野符「義満クライシス」！ 歴史を曲げてでも守る！', mood: 'annoyed' }]],
  5: [[{ speaker: '鈴仙', text: '波符「赤眼催眠」！ 貴方の目は、もう私のもの。', mood: 'smug' }]],
  6: [[{ speaker: '永琳', text: '薬符「壺中の大銀河」！ 宇宙の広さを見せてあげる。', mood: 'smug' }]],
};

/** Opening script for a stage, spoken by the team the player picked. */
export function stageIntroDialogue(stage: StageNumber, character: CharacterId): DialogueLine[] {
  const team = STAGE_INTRO[stage][TEAM_INDEX[character]] ?? STAGE_INTRO[stage][0];
  return team.slice();
}

/** Lines played as the stage boss appears. */
export function bossEncounterDialogue(stage: StageNumber, character: CharacterId): DialogueLine[] {
  const [hero] = TEAM_NAMES[character];
  return [
    { speaker: hero, text: 'ここが震源ね……' + BOSS_NAMES[stage] + '、でしたか。', mood: 'normal' },
    ...(BOSS_ENCOUNTER[stage] ?? []),
  ];
}

/** Lines played when the boss commits its first spell card. */
export function spellCardDialogue(stage: StageNumber): DialogueLine[] {
  return (SPELL_CALLOUTS[stage] ?? [])[0]?.slice() ?? [];
}

/** Which of the four team scripts to read for a given playable team. */
const TEAM_INDEX: Record<CharacterId, number> = {
  'reimu-yukari': 0,
  'marisa-alice': 1,
  'sakuya-remilia': 2,
  'youmu-yuyuko': 3,
};
