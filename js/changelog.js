/** package.json の version が正。npm version / npm run release:* で自動同期される */
export const APP_VERSION = '1.0.4';

/**
 * アプリ内「更新履歴」に表示するデータ。
 *
 * ## 記載ルール
 * - ユーザーが画面で体感できる変更のみを書く
 * - 内部実装・CI/CD・インフラ・依存関係の更新は記載しない
 *
 * 新しい順。リリース時に先頭へ追記してください。
 */
export const CHANGELOG = [
  {
    version: '1.0.4',
    date: '2026-06-15',
    changes: [
      'カードの色（赤・黒）が正しく表示されるよう修正',
    ],
  },
  {
    version: '1.0.3',
    date: '2026-06-15',
    changes: [
      'スタート画面と PWA のアイコンが正しく表示されるよう修正',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-15',
    changes: [
      'クロンダイク（Klondike）ソリティア — ドラッグ／タップ操作、ダブルタップで組札へ移動',
      '配札・移動・山札めくりのアニメーション、組札へ自動配置ボタン',
      '手数・所要時間・ベガススコアの表示、クリア時のおめでとう画面',
      'ゲーム中の自動保存、スタート画面からの再開・新規開始',
      '記録画面 — プレイ数・クリア率・モード別成績',
      'ランキング — 所要時間・手数順のベスト記録',
      '設定 — サウンド、ベガス／累計ベガスモード、簡単移動',
      'フッターメニュー、PWA 対応（ホーム画面への追加）、更新履歴の表示',
    ],
  },
];

/** ISO 形式 (YYYY-MM-DD) を表示用に整形 */
export function formatChangelogDate(date) {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (full) {
    return `${Number(full[1])}年${Number(full[2])}月${Number(full[3])}日`;
  }
  return date;
}
