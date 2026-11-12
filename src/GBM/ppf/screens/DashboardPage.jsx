import React from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Upload,
  Banknote,
  BookOpen,
  Clock3,
  FileCheck2,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { money } from "../../common/format.js";
import { Stat, AccountTable, Quick } from "../components/index.js";

export function DashboardPage({
  session,
  summary,
  accounts,
  setPage,
  setModal,
  verifyAccount,
  softDelete,
  uploadAof,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TUESDAY, 27 OCTOBER 2026</div>
          <h1>
            Good morning, {session.name?.split(" ")[0]} <span>✦</span>
          </h1>
          <p>Here’s what’s happening across your PPF portfolio.</p>
        </div>
        <button className="primary" onClick={() => setModal("account")}>
          <Plus size={17} /> Open a PPF account
        </button>
      </div>
      <section className="stats-grid">
        <Stat
          icon={BookOpen}
          label="Total accounts"
          value={summary.total || 0}
          hint="Across all account types"
          tone="sage"
        />
        <Stat
          icon={Wallet}
          label="Active balance"
          value={money(summary.balance)}
          hint="Interest flag: enabled"
          tone="sand"
        />
        <Stat
          icon={Clock3}
          label="Awaiting verification"
          value={summary.pending || 0}
          hint="Requires checker action"
          tone="blue"
        />
        <Stat
          icon={Activity}
          label="Accounts opened"
          value={summary.total || 0}
          hint="This financial year"
          tone="rose"
        />
      </section>
      <section className="overview-grid">
        <div className="panel account-panel">
          <div className="panel-head">
            <div>
              <h3>Recent accounts</h3>
              <p>Latest PPF account activity</p>
            </div>
            <button className="text-action" onClick={() => setPage("Accounts")}>
              View all <span>→</span>
            </button>
          </div>
          <AccountTable
            rows={accounts.slice(0, 5)}
            onVerify={verifyAccount}
            onDelete={softDelete}
            onUpload={uploadAof}
            role={session.role}
          />
        </div>
        <div className="panel tasks-panel">
          <div className="panel-head">
            <div>
              <h3>Needs your attention</h3>
              <p>Pending items in your workspace</p>
            </div>
            <span className="count-badge">{summary.pending || 0}</span>
          </div>
          {accounts
            .filter((a) => a.status === "PENDING")
            .slice(0, 4)
            .map((a) => (
              <div className="task-row" key={a.id}>
                <div className="task-icon">
                  <FileCheck2 size={17} />
                </div>
                <div>
                  <b>{a.holderName}</b>
                  <small>{a.accountNo} · AOF required</small>
                </div>
                <button
                  title="Open account"
                  onClick={() => setPage("Accounts")}
                >
                  →
                </button>
              </div>
            ))}
          {!summary.pending && (
            <div className="empty-small">
              All caught up <span>✓</span>
            </div>
          )}
          <div className="integration-note">
            <ShieldCheck size={16} />
            <span>
              <b>Secure by design</b>
              <small>Aadhaar identifiers are masked at rest.</small>
            </span>
          </div>
        </div>
      </section>
      <section className="bottom-grid">
        <div className="panel quick-panel">
          <div className="panel-head">
            <div>
              <h3>Quick actions</h3>
              <p>Common PPF operations</p>
            </div>
          </div>
          <div className="quick-grid">
            <Quick
              icon={ArrowDownLeft}
              label="Open new account"
              desc="Branch or transfer-in"
              onClick={() => setModal("account")}
            />
            <Quick
              icon={ArrowUpRight}
              label="Transfer out"
              desc="Move an account"
              onClick={() => setModal("transfer")}
            />
            <Quick
              icon={Upload}
              label="Upload AOF"
              desc="Attach account form"
              onClick={() => setPage("Accounts")}
            />
            <Quick
              icon={Clock3}
              label="Request extension"
              desc="Continue account term"
              onClick={() => setModal("extension")}
            />
          </div>
        </div>
        <div className="panel rate-panel">
          <div className="rate-icon">
            <Banknote size={19} />
          </div>
          <div>
            <div className="eyebrow">PPF INTEREST RATE</div>
            <div className="rate-value">
              7.1% <small>p.a.</small>
            </div>
            <p>Set for the current quarter</p>
          </div>
          <div className="rate-foot">
            <span>Tax benefit under Section 80C</span>
            <span className="rate-leaf">✳</span>
          </div>
        </div>
      </section>
    </>
  );
}
