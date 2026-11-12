import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { isDgmDesignation } from "../common/format.js";
import { schemeById, schemes } from "../common/schemes.js";
import { PpfWorkspace } from "../ppf/PpfWorkspace.jsx";
import { AdminApprovals } from "./AdminApprovals.jsx";
import { AdminMaker } from "./AdminMaker.jsx";
import { AppShell } from "./AppShell.jsx";
import { AuditLog } from "./AuditLog.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { RegistrationScreen } from "./RegistrationScreen.jsx";
import { SchemeHome } from "./SchemeHome.jsx";
import { UserManagement } from "./UserManagement.jsx";
import { WelcomePage } from "./WelcomePage.jsx";

function pageForScheme(schemeId) {
  if (schemeId === "ppf") return "Dashboard";
  if (schemeById(schemeId)) return "Overview";
  return "Home";
}

export function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gbmSession"));
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState(() => {
    try {
      return pageForScheme(
        JSON.parse(localStorage.getItem("gbmSession"))?.schemeId,
      );
    } catch {
      return "Home";
    }
  });
  const [summary, setSummary] = useState({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [sessionNotice, setSessionNotice] = useState("");

  function notify(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 3300);
  }

  function onLogin(sessionData) {
    localStorage.setItem("gbmSession", JSON.stringify(sessionData));
    localStorage.setItem("gbmLastActivityAt", String(Date.now()));
    setSessionNotice("");
    setPage("Home");
    setSession(sessionData);
    window.dispatchEvent(new Event("auth-state-changed"));
  }

  function changeScheme(schemeId) {
    if (!session) return;
    if (schemeId && !schemes.some((item) => item.id === schemeId)) return;
    const next = { ...session, schemeId: schemeId || "" };
    localStorage.setItem("gbmSession", JSON.stringify(next));
    setSession(next);
    setPage(pageForScheme(schemeId));
  }

  function completeRegistration(result, data) {
    setRegistrationNotice(
      result.status === "PENDING"
        ? `Registration for ${data.username} is awaiting DGM-or-above approval.`
        : result.expiresAt
          ? `Temporary Audit User registered; access expires on ${new Date(result.expiresAt).toLocaleDateString()}.`
          : `Registration complete for ${data.username}. You can now sign in.`,
    );
    setRegistering(false);
  }

  if (!session && registering) {
    return (
      <RegistrationScreen
        onBack={() => {
          setRegistering(false);
          setError("");
        }}
        onRegistered={completeRegistration}
        error={error}
        setError={setError}
      />
    );
  }

  if (!session) {
    return (
      <LoginPage
        sessionNotice={sessionNotice}
        registrationNotice={registrationNotice}
        error={error}
        setError={setError}
        onLogin={onLogin}
        onForgotPassword={(event) => {
          event.preventDefault();
          setError("Contact your administrator to reset your password.");
        }}
        onShowRegister={(event) => {
          event.preventDefault();
          setError("");
          setRegistrationNotice("");
          setRegistering(true);
        }}
      />
    );
  }

  const scheme = schemeById(session.schemeId);
  const isPpfWorkspace = scheme?.id === "ppf";

  return (
    <AppShell
      session={session}
      page={page}
      setPage={setPage}
      summary={summary}
      error={error}
      setError={setError}
      notice={notice}
      notify={notify}
      onSessionChange={setSession}
      setSessionNotice={setSessionNotice}
      scheme={scheme}
      onChangeScheme={changeScheme}
    >
      {page === "User management" && session.role === "ADMIN" && (
        <UserManagement session={session} notify={notify} setError={setError} />
      )}
      {page === "Admin maker" && session.role === "OPERATIONS_USER" && (
        <AdminMaker notify={notify} setError={setError} />
      )}
      {page === "Admin approvals" && isDgmDesignation(session.designation) && (
        <AdminApprovals notify={notify} setError={setError} />
      )}
      {page === "Audit log" && <AuditLog setError={setError} />}
      {!scheme && page === "Home" && <WelcomePage />}
      {scheme && !isPpfWorkspace && page === "Overview" && (
        <SchemeHome scheme={scheme} />
      )}
      {isPpfWorkspace && (
        <PpfWorkspace
          session={session}
          page={page}
          setPage={setPage}
          setError={setError}
          notify={notify}
          onSummaryChange={setSummary}
        />
      )}
    </AppShell>
  );
}
