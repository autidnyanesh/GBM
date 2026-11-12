import React, { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  BadgeCheck,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  House,
  LogOut,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { roleName, isDgmDesignation } from "../common/format.js";
import { req } from "../common/api.js";
import { schemes } from "../common/schemes.js";
import { LandmarkMark } from "./LandmarkMark.jsx";

export function AppShell({
  session,
  page,
  setPage,
  summary,
  error,
  setError,
  notice,
  notify,
  onSessionChange,
  setSessionNotice,
  scheme,
  onChangeScheme,
  children,
}) {
  const [sols, setSols] = useState([]);
  const [solBusy, setSolBusy] = useState(false);

  useEffect(() => {
    if (!["OPERATIONS_USER", "ADMIN"].includes(session.role)) return;
    let cancelled = false;
    req("/sols")
      .then((list) => {
        if (!cancelled) setSols(list);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });
    return () => {
      cancelled = true;
    };
  }, [session.role, setError]);

  useEffect(() => {
    let timeoutId;
    let lastSharedWrite = 0;
    const clearIdleTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = undefined;
    };
    const armIdleTimer = (lastActivity = Date.now()) => {
      clearIdleTimer();
      if (!localStorage.getItem("gbmSession")) return;
      const remaining = Math.max(
        0,
        3600 * 1000 - (Date.now() - lastActivity),
      );
      timeoutId = window.setTimeout(() => {
        let saved;
        try {
          saved = JSON.parse(localStorage.getItem("gbmSession") || "null");
        } catch {}
        if (!saved?.token) return;
        clearIdleTimer();
        req("/auth/logout", { method: "POST" }).catch(() => {});
        localStorage.removeItem("gbmSession");
        localStorage.removeItem("gbmLastActivityAt");
        window.dispatchEvent(new Event("auth-state-changed"));
        onSessionChange(null);
        setSessionNotice(
          "You were logged out after one hour of inactivity.",
        );
      }, remaining);
    };
    const handleUserActivity = () => {
      if (!localStorage.getItem("gbmSession")) return;
      const now = Date.now();
      if (now - lastSharedWrite >= 1000) {
        localStorage.setItem("gbmLastActivityAt", String(now));
        lastSharedWrite = now;
      }
      armIdleTimer(now);
    };
    const syncAuthState = () => {
      if (localStorage.getItem("gbmSession")) {
        const last =
          Number(localStorage.getItem("gbmLastActivityAt")) || Date.now();
        if (!localStorage.getItem("gbmLastActivityAt"))
          localStorage.setItem("gbmLastActivityAt", String(last));
        armIdleTimer(last);
      } else {
        clearIdleTimer();
      }
    };
    const syncStorage = (event) => {
      if (event?.key === "gbmLastActivityAt") {
        armIdleTimer(Number(event.newValue) || Date.now());
        return;
      }
      if (event?.key && event.key !== "gbmSession") return;
      const saved = localStorage.getItem("gbmSession");
      if (saved) {
        try {
          onSessionChange(JSON.parse(saved));
          armIdleTimer(
            Number(localStorage.getItem("gbmLastActivityAt")) || Date.now(),
          );
        } catch {
          localStorage.removeItem("gbmSession");
          onSessionChange(null);
        }
      } else {
        clearIdleTimer();
        onSessionChange(null);
      }
    };
    const activityEvents = [
      "pointerdown",
      "pointermove",
      "keydown",
      "input",
      "change",
      "click",
      "focusin",
      "scroll",
      "touchstart",
      "wheel",
    ];
    activityEvents.forEach((name) =>
      window.addEventListener(name, handleUserActivity, { passive: true }),
    );
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") handleUserActivity();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("gbm-user-activity", handleUserActivity);
    window.addEventListener("auth-state-changed", syncAuthState);
    window.addEventListener("storage", syncStorage);
    syncAuthState();
    return () => {
      clearIdleTimer();
      activityEvents.forEach((name) =>
        window.removeEventListener(name, handleUserActivity),
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("gbm-user-activity", handleUserActivity);
      window.removeEventListener("auth-state-changed", syncAuthState);
      window.removeEventListener("storage", syncStorage);
    };
  }, [onSessionChange, setSessionNotice]);

  async function changeSol(solId) {
    setSolBusy(true);
    setError("");
    try {
      const result = await req("/session/sol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solId }),
      });
      const next = {
        ...session,
        activeSolId: result.activeSolId,
        token: result.token,
      };
      localStorage.setItem("gbmSession", JSON.stringify(next));
      onSessionChange(next);
      window.dispatchEvent(new Event("auth-state-changed"));
      notify(`Active SOL changed to ${result.activeSolId}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSolBusy(false);
    }
  }

  async function logout() {
    try {
      await req("/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("gbmSession");
    localStorage.removeItem("gbmLastActivityAt");
    window.dispatchEvent(new Event("auth-state-changed"));
    onSessionChange(null);
    setSessionNotice("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <LandmarkMark />
          </span>
          <span>GBM</span>
        </div>
        <div className="side-caption">
          {scheme ? scheme.label : "HOME"}
        </div>
        <nav>
          {[
            ...(scheme?.id === "ppf"
              ? [
                  ["Dashboard", House],
                  ["Accounts", BookOpen],
                  ["AOF inquiry", FileText],
                  ["Transfers", ArrowLeftRight],
                  ["Nominations", Users],
                  ["Extensions", Clock3],
                ]
              : scheme
                ? [["Overview", House]]
                : []),
            ...(session.role === "ADMIN"
              ? [["User management", UserRound]]
              : []),
            ...(session.role === "OPERATIONS_USER"
              ? [["Admin maker", UserRound]]
              : []),
            ...(isDgmDesignation(session.designation)
              ? [["Admin approvals", BadgeCheck]]
              : []),
            ...(["ADMIN", "AUDIT_USER"].includes(session.role)
              ? [["Audit log", FileCheck2]]
              : []),
          ].map(([n, I]) => (
            <button
              key={n}
              className={`nav-item ${page === n ? "active" : ""}`}
              onClick={() => setPage(n)}
            >
              <I size={17} />
              <span>{n}</span>
              {n === "Accounts" && <small>{summary.total || 0}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={16} />
            </div>
            <b>Need a hand?</b>
            <p>Get help with GBM operations</p>
            <a href="#help" onClick={(e) => e.preventDefault()}>
              Visit help centre <span>↗</span>
            </a>
          </div>
          <div className="profile">
            <div className="avatar">
              {session.name
                ?.split(" ")
                .map((x) => x[0])
                .join("")}
            </div>
            <div className="profile-text">
              <b>{session.name}</b>
              <small>
                {roleName(session.role)} · ID {session.userIdentifier || "—"} ·
                SOL ID {session.solId || session.branchCode || "1001"}
              </small>
            </div>
            <button className="icon-btn" title="Sign out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="crumb">
            GBM
            {scheme ? (
              <>
                <span>/</span> {scheme.label}
              </>
            ) : null}
            <span>/</span> <b>{page}</b>
          </div>
          <div className="top-right">
            <div className="module-switch">
              <label htmlFor="active-module">Module</label>
              <select
                id="active-module"
                value={scheme?.id || ""}
                onChange={(e) => onChangeScheme(e.target.value)}
              >
                <option value="">GBM home</option>
                {schemes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} — {item.fullName}
                  </option>
                ))}
              </select>
            </div>
            <span className="live-pill">
              <i /> Systems operational
            </span>
            {["OPERATIONS_USER", "ADMIN"].includes(session.role) && (
              <div className="sol-switch">
                <label htmlFor="active-sol">SOL ID</label>
                <select
                  id="active-sol"
                  value={session.activeSolId || "098"}
                  disabled={solBusy}
                  onChange={(e) => changeSol(e.target.value)}
                >
                  {sols.map((sol) => (
                    <option key={sol.solId} value={sol.solId}>
                      {sol.solId} · {sol.solName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="top-date">Tuesday, 27 October 2026</div>
            <div className="top-avatar">
              {session.name
                ?.split(" ")
                .map((x) => x[0])
                .join("")}
            </div>
          </div>
        </header>
        <div className="content">
          {error && (
            <div className="toast error-toast" onClick={() => setError("")}>
              {error}
              <X size={16} />
            </div>
          )}
          {notice && (
            <div className="toast success-toast">
              {notice}
              <Check size={16} />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
