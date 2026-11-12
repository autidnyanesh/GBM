import React, { useState } from "react";
import { req } from "../common/api.js";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { LandmarkMark } from "./LandmarkMark.jsx";

export function LoginPage({
  sessionNotice,
  registrationNotice,
  error,
  setError,
  onLogin,
  onForgotPassword,
  onShowRegister,
}) {
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget);
      const result = await req("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const role = result.role || result.ROLE;
      const solId = result.solId || result.branchCode || result.BRANCHCODE;
      onLogin({
        ...result,
        email: result.email || result.EMAIL,
        name: result.name || result.NAME,
        role,
        userType: result.userType || result.USERTYPE,
        userIdentifier: result.userIdentifier || result.USERIDENTIFIER,
        solId,
        branchCode: solId,
        activeSolId:
          result.activeSolId ||
          (["OPERATIONS_USER", "ADMIN"].includes(role) ? "098" : solId),
        schemeId: "",
      });
    } catch (loginError) {
      setError(
        loginError.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand light">
          <span className="brand-icon">
            <LandmarkMark />
          </span>
          <span>GBM</span>
        </div>
        <div className="login-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-card">
            <div className="art-top">
              <span className="tiny-square" /> Government business{" "}
              <span className="art-dot" />
            </div>
            <div className="art-label">Schemes in this workspace</div>
            <div className="art-balance">
              PPF <span>· CBDT · SCSS</span>
            </div>
            <div className="art-chart">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="art-foot">
              <span>One sign-in</span>
              <b>Modules open after you sign in</b>
            </div>
          </div>
          <div className="float-chip">
            <span className="chip-icon">
              <ShieldCheck size={17} />
            </span>
            <span>
              <b>Government backed</b>
              <small>Branch staff workspace</small>
            </span>
          </div>
        </div>
        <div className="visual-copy">
          <p className="eyebrow">GOVERNMENT BUSINESS MODULE</p>
          <h1>Sign in to the GBM application.</h1>
          <p>
            After sign-in you land on the GBM home. Choose a module from the
            bar to open its menu.
          </p>
        </div>
        <div className="visual-bottom">
          <span>© 2026 GBM</span>
          <span>Secure banking workspace</span>
        </div>
      </section>
      <section className="login-form-side">
        <div className="mobile-brand brand">
          <span className="brand-icon">
            <LandmarkMark />
          </span>
          <span>GBM</span>
        </div>
        <div className="login-form-wrap">
          <div className="login-overline">
            <span className="overline-line" /> STAFF WORKSPACE
          </div>
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to the GBM application.</p>
          {sessionNotice && <div className="info-banner">{sessionNotice}</div>}
          {registrationNotice && (
            <div className="success-banner">{registrationNotice}</div>
          )}
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <div className="input-icon">
              <UserRound size={17} />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
            <div className="field-row">
              <label htmlFor="password">Password</label>
              <a href="#help" onClick={onForgotPassword}>
                Forgot password?
              </a>
            </div>
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            <button className="primary login-button" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <span>→</span>
            </button>
          </form>
          <div className="login-account-note">
            Use the username and password assigned by your branch administrator.
          </div>
          <div className="login-security">
            <ShieldCheck size={17} />
            <span>Your session is protected with secure sign-in</span>
          </div>
        </div>
        <div className="login-help">
          Need access?{" "}
          <a href="#register" onClick={onShowRegister}>
            Register user
          </a>
        </div>
      </section>
    </main>
  );
}
