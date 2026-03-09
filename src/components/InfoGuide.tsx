import { X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function InfoGuide({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <h2 className="text-xl font-black text-white">設置ガイド</h2>
        <button
          onClick={onClose}
          className="btn-press w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8">
        {/* Diagram */}
        <div className="flex justify-center">
          <DartboardDiagram />
        </div>

        {/* Measurements */}
        <div>
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">
            公式寸法（ソフトダーツ）
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { label: '高さ（ブル中心）', value: '173 cm', icon: '↕', color: 'text-amber-400' },
              { label: 'スローライン距離', value: '244 cm', icon: '↔', color: 'text-cyan-400' },
              { label: '対角線距離', value: '293 cm', icon: '↗', color: 'text-green-400' },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-slate-900 rounded-2xl px-4 py-4 border border-slate-800"
              >
                <span className={`text-3xl font-black w-10 text-center ${color}`}>{icon}</span>
                <div className="flex-1">
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">
            設置のポイント
          </h3>
          <div className="flex flex-col gap-2">
            {[
              'ボードはしっかりした壁に水平・垂直に取り付ける',
              'ブル（中心）の高さ 173cm を床から計測する',
              'スローラインはボード面から 244cm の位置に設ける',
              '後ろの壁や床にダーツ飛散防止マットを敷くと安心',
              '照明はボードを均一に照らす位置に設置する',
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 bg-slate-900 rounded-xl px-4 py-3 border border-slate-800">
                <span className="text-cyan-500 font-black text-sm mt-0.5">{i + 1}.</span>
                <span className="text-slate-300 text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game rules summary */}
        <div>
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">
            ゲームルール早見表
          </h3>
          <div className="flex flex-col gap-3">
            <RuleCard
              title="01 ゲーム"
              color="cyan"
              rules={[
                '初期得点（301/501）から3投の合計を引く',
                'ちょうど「0」にした人の勝ち',
                '0未満になると「バースト」→そのターン無効',
                '最後はどのエリアでも上がれる（オープンアウト）',
              ]}
            />
            <RuleCard
              title="クリケット"
              color="amber"
              rules={[
                '15〜20とBULLのみが有効エリア',
                '同じ数字に3マーク→「オープン」して得点権獲得',
                '全員がオープンすると「クローズ」→加点不可',
                '全エリアオープン＆最高得点者が勝利',
              ]}
            />
            <RuleCard
              title="カウントアップ"
              color="green"
              rules={[
                '8ラウンド（24投）の合計得点を競う',
                'どこに当たっても得点加算',
                '最も高い合計得点の人が勝利',
                '同点の場合はタイ（引き分け）',
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RuleCard({ title, color, rules }: { title: string; color: string; rules: string[] }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 border-cyan-800 bg-cyan-900/10',
    amber: 'text-amber-400 border-amber-800 bg-amber-900/10',
    green: 'text-green-400 border-green-800 bg-green-900/10',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color]}`}>
      <h4 className="font-black text-base mb-2">{title}</h4>
      <ul className="flex flex-col gap-1">
        {rules.map((r, i) => (
          <li key={i} className="text-slate-300 text-xs flex gap-2">
            <span className="opacity-60">・</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DartboardDiagram() {
  return (
    <svg viewBox="0 0 340 420" className="w-full max-w-xs" style={{ maxHeight: 320 }}>
      {/* Floor */}
      <line x1="0" y1="380" x2="340" y2="380" stroke="#334155" strokeWidth="2" />

      {/* Wall */}
      <line x1="60" y1="20" x2="60" y2="380" stroke="#475569" strokeWidth="2" strokeDasharray="6,4" />

      {/* Dartboard on wall */}
      <circle cx="60" cy="173" r="36" fill="#1e293b" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="60" cy="173" r="26" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="60" cy="173" r="16" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="60" cy="173" r="6"  fill="#f87171" />
      <circle cx="60" cy="173" r="2"  fill="white" />

      {/* Height arrow */}
      <line x1="20" y1="380" x2="20" y2="173" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrowUp)" markerStart="url(#arrowDown)" />
      <text x="28" y="285" fill="#fbbf24" fontSize="11" fontWeight="bold">173cm</text>

      {/* Throwing person silhouette */}
      {/* head */}
      <circle cx="290" cy="195" r="12" fill="#334155" />
      {/* body */}
      <line x1="290" y1="207" x2="290" y2="270" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      {/* throwing arm */}
      <line x1="290" y1="220" x2="240" y2="230" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
      <line x1="240" y1="230" x2="220" y2="215" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
      {/* dart in hand */}
      <line x1="220" y1="215" x2="195" y2="210" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {/* legs */}
      <line x1="290" y1="270" x2="270" y2="330" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
      <line x1="290" y1="270" x2="305" y2="330" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
      {/* feet */}
      <line x1="270" y1="330" x2="255" y2="335" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
      <line x1="305" y1="330" x2="315" y2="335" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

      {/* Throw line on floor */}
      <line x1="290" y1="380" x2="290" y2="370" stroke="#22d3ee" strokeWidth="2" />
      <rect x="275" y="370" width="30" height="4" fill="#22d3ee" rx="2" />
      <text x="271" y="365" fill="#22d3ee" fontSize="9">スローライン</text>

      {/* Distance arrow (horizontal) */}
      <line x1="60" y1="395" x2="290" y2="395" stroke="#22d3ee" strokeWidth="1.5" markerEnd="url(#arrowRight)" markerStart="url(#arrowLeft)" />
      <text x="140" y="413" fill="#22d3ee" fontSize="11" fontWeight="bold">244cm</text>

      {/* Diagonal line */}
      <line x1="60" y1="173" x2="290" y2="380" stroke="#4ade80" strokeWidth="1" strokeDasharray="5,3" />
      <text x="155" y="270" fill="#4ade80" fontSize="9" transform="rotate(43,155,270)">293cm</text>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,6 L3,0 L6,6" fill="#fbbf24" />
        </marker>
        <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
          <path d="M0,6 L3,0 L6,6" fill="#fbbf24" />
        </marker>
        <marker id="arrowRight" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#22d3ee" />
        </marker>
        <marker id="arrowLeft" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6" fill="#22d3ee" />
        </marker>
      </defs>
    </svg>
  )
}
