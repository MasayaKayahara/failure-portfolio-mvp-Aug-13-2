import React, { useState } from "react";
import FailurePortfolioMVP from "./FailurePortfolioMVP";
import "./styles.css";

export default function App() {
  const [tab, setTab] = useState("feed"); // feed | case | need

  return (
    <div className="app">
      {/* TopNav */}
      <header className="topnav">
        <div className="brand">F</div>
        <div className="brand-title">Failure is Capital</div>
        <div className="spacer" />
      </header>

      <div className="layout">
        {/* Left sidebar */}
        <aside className="left">
          <button
            className={\`navbtn \${tab === "feed" ? "active" : ""}\`}
            onClick={() => setTab("feed")}
          >
            フィード（マッチ）
          </button>
          <button
            className={\`navbtn \${tab === "case" ? "active" : ""}\`}
            onClick={() => setTab("case")}
          >
            失敗ポートフォリオ登録
          </button>
          <button
            className={\`navbtn \${tab === "need" ? "active" : ""}\`}
            onClick={() => setTab("need")}
          >
            企業ニーズ登録
          </button>
          <div className="hint">
            ヒント：タグ（例: チャーン, CAC, PMF）でマッチ傾向を確認。
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="panel">
            {tab === "feed" && <FailurePortfolioMVP tabDefault="match" />}
            {tab === "case" && <FailurePortfolioMVP tabDefault="case" />}
            {tab === "need" && <FailurePortfolioMVP tabDefault="need" />}
          </div>
        </main>

        {/* Right sidebar（ダミー） */}
        <aside className="right">
          <div className="card">
            <div className="card-title">注目のタグ</div>
            <div className="pills">
              {["PMF", "チャーン", "オンボーディング", "需要予測", "GTM"].map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">最近の登録（例）</div>
            <div className="pills">
              {["SaaS PM", "ロジ新規事業", "Fintech B2C"].map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottomnav">
        <button className={tab==="feed"?"active":""} onClick={()=>setTab("feed")}>フィード</button>
        <button className={tab==="case"?"active":""} onClick={()=>setTab("case")}>失敗</button>
        <button className={tab==="need"?"active":""} onClick={()=>setTab("need")}>企業</button>
      </nav>
    </div>
  );
}
