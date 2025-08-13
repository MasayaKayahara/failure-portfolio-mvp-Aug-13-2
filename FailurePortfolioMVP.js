import React, { useEffect, useState } from "react";

// ---- Safe utils ----
const uuid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const STORAGE_KEYS = { cases: "fp_mvp_cases_v1", needs: "fp_mvp_needs_v1" };
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (_) {}
};
const load = (k, fb) => {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : fb;
  } catch (_) {
    return fb;
  }
};
const parseTags = (s) =>
  (s || "")
    .split(/[;,\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toLowerCase());

// ---- seed ----
const seedCases = [
  {
    id: uuid(),
    projectName: "Grocery Delivery MVP",
    industry: "Logistics",
    failureTags: "需要予測, CAC高騰, 地域適合",
    primaryCauseTag: "PMF",
    description: "都心では需要はあったが郊外で稼働率が低迷。",
    learnings: "需要密度の閾値など。",
  },
];
const seedNeeds = [
  {
    id: uuid(),
    company: "Acme Mobility",
    industry: "Logistics",
    problemStatement: "ラストワンマイルで需要密度/配送コストの設計に課題。",
    desiredLearningTags: "需要予測, 地域適合, ローカル提携",
    desiredExperienceTags: "PMF, 配送, CAC",
  },
];

// ---- matching ----
const scoreMatch = (need, fcase) => {
  let s = 0;
  const nL = new Set(parseTags(need.desiredLearningTags));
  const nE = new Set(parseTags(need.desiredExperienceTags));
  const cT = new Set(parseTags(fcase.failureTags));
  const cause = (fcase.primaryCauseTag || "").toLowerCase();
  s += [...cT].filter((t) => nL.has(t)).length * 2;
  if (cause && nE.has(cause)) s += 2;
  if (
    need.industry &&
    fcase.industry &&
    need.industry.toLowerCase() === fcase.industry.toLowerCase()
  )
    s += 2;
  return Math.round(s * 10) / 10;
};
const topMatches = (need, cases, k = 3) =>
  [...cases]
    .map((c) => ({ c, s: scoreMatch(need, c) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k);

// ---- small inputs ----
const Input = ({ label, ...p }) => (
  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
    <span style={{ color: "#374151" }}>{label}</span>
    <input
      {...p}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "8px 10px",
      }}
    />
  </label>
);

// ---- ChipInput ----
function ChipInput({
  label,
  value,
  onChange,
  placeholder = "タグを入力してEnter",
}) {
  const toArr = (s) =>
    (s || "")
      .split(/[;,、\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
  const toCSV = (arr) => arr.join(", ");
  const [chips, setChips] = React.useState(() => toArr(value));
  const [draft, setDraft] = React.useState("");
  React.useEffect(() => setChips(toArr(value)), [value]);

  const commit = (text) => {
    const t = text.trim();
    if (!t || chips.includes(t)) {
      setDraft("");
      return;
    }
    const next = [...chips, t];
    setChips(next);
    setDraft("");
    onChange(toCSV(next));
  };
  const removeAt = (i) => {
    const next = chips.filter((_, idx) => idx !== i);
    setChips(next);
    onChange(toCSV(next));
  };

  return (
    <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
      <span style={{ color: "#374151" }}>{label}</span>
      <div className="chip-input">
        <div className="chip-wrap">
          {chips.map((c, i) => (
            <span key={c + i} className="chip">
              {c}
              <button
                className="chip-x"
                onClick={() => removeAt(i)}
                aria-label={`${c} を削除`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="chip-field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(draft);
              }
              if (e.key === "Backspace" && !draft && chips.length)
                removeAt(chips.length - 1);
            }}
            placeholder={placeholder}
          />
        </div>
      </div>
    </label>
  );
}

export default function FailurePortfolioMVP({ tabDefault = "match" }) {
  const [tab, setTab] = useState(tabDefault);
  const [cases, setCases] = useState(() => load(STORAGE_KEYS.cases, seedCases));
  const [needs, setNeeds] = useState(() => load(STORAGE_KEYS.needs, seedNeeds));
  useEffect(() => save(STORAGE_KEYS.cases, cases), [cases]);
  useEffect(() => save(STORAGE_KEYS.needs, needs), [needs]);

  const [c, setC] = useState({
    id: uuid(),
    projectName: "",
    industry: "",
    failureTags: "",
    primaryCauseTag: "",
    description: "",
    learnings: "",
  });
  const [n, setN] = useState({
    id: uuid(),
    company: "",
    industry: "",
    problemStatement: "",
    desiredLearningTags: "",
    desiredExperienceTags: "",
  });

  return (
    <div className="mvp">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab("match")}>マッチ</button>
        <button onClick={() => setTab("case")}>失敗登録</button>
        <button onClick={() => setTab("need")}>企業登録</button>
      </div>

      {tab === "match" && (
        <div className="feed">
          {needs.map((nd) => {
            const ranked = topMatches(nd, cases, 3);
            return (
              <article key={nd.id} className="feed-card">
                <header className="feed-head">
                  <div className="feed-title">
                    <div className="feed-company">{nd.company}</div>
                    {nd.industry && (
                      <span className="feed-badge">{nd.industry}</span>
                    )}
                  </div>
                  <div className="feed-score">
                    {ranked.length
                      ? `Best score: ${ranked[0].s}`
                      : "No candidates yet"}
                  </div>
                </header>

                {nd.problemStatement && (
                  <p className="feed-problem">{nd.problemStatement}</p>
                )}

                <div className="feed-tags">
                  {(nd.desiredLearningTags || "")
                    .split(/[;,\n]/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                </div>

                {!!ranked.length && (
                  <div className="feed-matches">
                    {ranked.map(({ c, s }) => (
                      <div key={c.id} className="match-row">
                        <div className="match-main">
                          <div className="match-title">
                            {c.projectName || "(no title)"}
                          </div>
                          <div className="match-sub">
                            {c.industry || "—"} ・ {c.primaryCauseTag || "—"}
                          </div>
                        </div>
                        <div className="match-score">{s}</div>
                      </div>
                    ))}
                  </div>
                )}

                <footer className="feed-actions">
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      alert("詳細ダイジェスト（将来：モーダル表示）")
                    }
                  >
                    詳細を見る
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() =>
                      alert("面談打診（将来：フォーム/メール起動）")
                    }
                  >
                    面談を打診
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {tab === "case" && (
        <div style={{ display: "grid", gap: 8, maxWidth: 560 }}>
          <Input
            label="プロジェクト名"
            value={c.projectName}
            onChange={(e) => setC({ ...c, projectName: e.target.value })}
          />
          <Input
            label="業界"
            value={c.industry}
            onChange={(e) => setC({ ...c, industry: e.target.value })}
          />
          <ChipInput
            label="失敗タグ"
            value={c.failureTags}
            onChange={(csv) => setC({ ...c, failureTags: csv })}
          />
          <Input
            label="主因タグ"
            value={c.primaryCauseTag}
            onChange={(e) => setC({ ...c, primaryCauseTag: e.target.value })}
          />
          <Input
            label="説明"
            value={c.description}
            onChange={(e) => setC({ ...c, description: e.target.value })}
          />
          <Input
            label="学び"
            value={c.learnings}
            onChange={(e) => setC({ ...c, learnings: e.target.value })}
          />
          <button
            onClick={() => {
              setCases([c, ...cases]);
              setC({
                id: uuid(),
                projectName: "",
                industry: "",
                failureTags: "",
                primaryCauseTag: "",
                description: "",
                learnings: "",
              });
            }}
          >
            登録する
          </button>
        </div>
      )}

      {tab === "need" && (
        <div style={{ display: "grid", gap: 8, maxWidth: 560 }}>
          <Input
            label="会社名"
            value={n.company}
            onChange={(e) => setN({ ...n, company: e.target.value })}
          />
          <Input
            label="業界"
            value={n.industry}
            onChange={(e) => setN({ ...n, industry: e.target.value })}
          />
          <Input
            label="課題"
            value={n.problemStatement}
            onChange={(e) => setN({ ...n, problemStatement: e.target.value })}
          />
          <ChipInput
            label="欲しい学びタグ"
            value={n.desiredLearningTags}
            onChange={(csv) => setN({ ...n, desiredLearningTags: csv })}
          />
          <ChipInput
            label="求める経験タグ"
            value={n.desiredExperienceTags}
            onChange={(csv) => setN({ ...n, desiredExperienceTags: csv })}
          />
          <button
            onClick={() => {
              setNeeds([n, ...needs]);
              setN({
                id: uuid(),
                company: "",
                industry: "",
                problemStatement: "",
                desiredLearningTags: "",
                desiredExperienceTags: "",
              });
            }}
          >
            登録する
          </button>
        </div>
      )}
    </div>
  );
}
