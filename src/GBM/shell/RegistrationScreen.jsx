import React, { useState, useEffect } from "react";
import { req } from "../common/api.js";
import { LandmarkMark } from "./LandmarkMark.jsx";

export function RegistrationScreen({
  onBack,
  onRegistered,
  error,
  setError,
}) {
  const [sols, setSols] = useState([]);
  const [registrationType, setRegistrationType] = useState("BANK_EMPLOYEE");
  const [solId, setSolId] = useState("");
  const [ein, setEin] = useState("");
  const [hrmsData, setHrmsData] = useState(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    req("/sols")
      .then((list) => {
        setSols(list);
        setSolId(
          list.find((x) => x.solId === "1001")?.solId || list[0]?.solId || "",
        );
      })
      .catch((loadError) => setError(loadError.message));
  }, []);
  function selectType(type) {
    setRegistrationType(type);
    setHrmsData(null);
    setEin("");
    setSolId(
      ["BANK_EMPLOYEE", "BOA"].includes(type)
        ? "098"
        : sols.find((x) => x.solId === "1001")?.solId || sols[0]?.solId || "",
    );
  }
  async function validateEIN() {
    setLookupBusy(true);
    try {
      const details = await req("/auth/hrms-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ein }),
      });
      if (!sols.some((x) => x.solId === details.sol))
        throw Error(
          `HRMS returned SOL ${details.sol}, which is not active in this application.`,
        );
      if (!details.designation)
        throw Error(
          "HRMS grade or position does not match a supported designation. Ask an administrator to map it.",
        );
      setHrmsData(details);
      setSolId(details.sol);
    } catch (e) {
      setHrmsData(null);
      setError(e.message);
    } finally {
      setLookupBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries());
    let data;
    if (registrationType === "BANK_EMPLOYEE") {
      if (!hrmsData) {
        setError("Validate the EIN through HRMS before registering.");
        return;
      }
      data = {
        ...fields,
        registrationType,
        userType: "OPERATIONS_USER",
        employmentType: "BANK_EMPLOYEE",
        ein,
        username: ein,
        userIdentifier: ein,
        displayName: hrmsData.fullName,
        designation: hrmsData.designation,
        solId: hrmsData.sol,
        officialEmail: hrmsData.email,
        grade: hrmsData.grade,
        organization: hrmsData.organization,
        position: hrmsData.position,
        vertical: hrmsData.vertical,
        zone: hrmsData.zone,
        region: hrmsData.region,
        agency: hrmsData.agency,
      };
    } else {
      data = {
        ...fields,
        registrationType,
        userType:
          registrationType === "AUDIT_TEMP" ? "AUDIT_USER" : "OPERATIONS_USER",
        employmentType: registrationType === "BOA" ? "BOA" : "BANK_EMPLOYEE",
        solId,
      };
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await req("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      onRegistered(result, data);
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSubmitting(false);
    }
  }
  const operation = registrationType !== "AUDIT_TEMP";
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand light">
          <span className="brand-icon">
            <LandmarkMark />
          </span>
          <span>
            GBM
          </span>
        </div>
        <div className="visual-copy">
          <p className="eyebrow">STAFF ACCESS</p>
          <h1>Register your staff account.</h1>
          <p>
            Bank employee details are validated through HRMS. BOA access needs
            DGM-or-above approval.
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
          <span>
            GBM
          </span>
        </div>
        <div className="login-form-wrap registration-form">
          <div className="login-overline">
            <span className="overline-line" /> STAFF WORKSPACE
          </div>
          <h2>Create your account</h2>
          <p className="login-sub">
            Choose the registration type that matches your engagement.
          </p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Registration type</label>
              <select
                value={registrationType}
                onChange={(e) => selectType(e.target.value)}
                required
              >
                <option value="BANK_EMPLOYEE">
                  Operations User · Bank employee
                </option>
                <option value="BOA">Operations User · BOA (manual)</option>
                <option value="AUDIT_TEMP">
                  Audit User · Temporary (30 days)
                </option>
              </select>
            </div>
            {registrationType === "BANK_EMPLOYEE" && (
              <>
                <div className="field">
                  <label>Employee Identification Number (EIN)</label>
                  <input
                    value={ein}
                    onChange={(e) => {
                      setEin(e.target.value);
                      setHrmsData(null);
                    }}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="outline"
                  disabled={lookupBusy || !ein.trim()}
                  onClick={validateEIN}
                >
                  {lookupBusy ? "Checking HRMS…" : "Validate EIN with HRMS"}
                </button>
                {hrmsData && (
                  <div className="info-banner">
                    <b>{hrmsData.fullName}</b>
                    <br />
                    EIN {hrmsData.ein} · SOL {hrmsData.sol} ·{" "}
                    {hrmsData.designation}
                    <br />
                    {hrmsData.position} · {hrmsData.organization}
                  </div>
                )}
              </>
            )}
            {registrationType === "BOA" && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input name="displayName" required autoComplete="name" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input
                    name="username"
                    required
                    minLength="3"
                    autoComplete="username"
                  />
                </div>
                <div className="field">
                  <label>User identification number</label>
                  <input name="userIdentifier" required maxLength="255" />
                </div>
                <div className="field">
                  <label>Official email</label>
                  <input name="officialEmail" type="email" required />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" required />
                </div>
                <div className="field">
                  <label>Grade</label>
                  <input name="grade" required />
                </div>
                <div className="field">
                  <label>Organization</label>
                  <input name="organization" required />
                </div>
                <div className="field">
                  <label>Position</label>
                  <input name="position" required />
                </div>
                <div className="field">
                  <label>Vertical</label>
                  <input name="vertical" required />
                </div>
                <div className="field">
                  <label>Zone</label>
                  <input name="zone" required />
                </div>
                <div className="field">
                  <label>Region</label>
                  <input name="region" required />
                </div>
                <div className="field">
                  <label>Agency</label>
                  <input name="agency" />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <select name="designation" defaultValue="M" required>
                    <option value="AM">AM - Assistant Manager</option>
                    <option value="M">M - Manager</option>
                    <option value="AGM">AGM - Assistant General Manager</option>
                    <option value="DGM">DGM - Deputy General Manager</option>
                    <option value="GM">GM - General Manager</option>
                    <option value="CGM">CGM - Chief General Manager</option>
                  </select>
                </div>
              </>
            )}
            {registrationType === "AUDIT_TEMP" && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input name="displayName" required autoComplete="name" />
                </div>
                <div className="field">
                  <label>Username</label>
                  <input
                    name="username"
                    required
                    minLength="3"
                    autoComplete="username"
                  />
                </div>
                <div className="field">
                  <label>User identification number</label>
                  <input name="userIdentifier" required maxLength="255" />
                </div>
                <div className="field">
                  <label>SOL ID</label>
                  <select
                    value={solId}
                    onChange={(e) => setSolId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select SOL ID
                    </option>
                    {sols.map((sol) => (
                      <option key={sol.solId} value={sol.solId}>
                        {sol.solId} · {sol.solName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="info-banner">
                  Temporary Audit User access expires after 30 days.
                </div>
              </>
            )}
            {operation && registrationType === "BOA" && (
              <div className="field">
                <label>SOL ID</label>
                <select
                  value={solId}
                  onChange={(e) => setSolId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select SOL ID
                  </option>
                  {sols.map((sol) => (
                    <option key={sol.solId} value={sol.solId}>
                      {sol.solId} · {sol.solName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {registrationType === "BANK_EMPLOYEE" && (
              <div className="field">
                <label>SOL ID from HRMS</label>
                <input value={hrmsData?.sol || ""} readOnly required />
              </div>
            )}
            <div className="field">
              <label>
                {registrationType === "BANK_EMPLOYEE"
                  ? "AD password"
                  : "Password"}
              </label>
              <input
                name="password"
                type="password"
                required
                minLength="8"
                autoComplete="new-password"
              />
            </div>
            <button
              className="primary login-button"
              disabled={
                submitting || (registrationType === "BANK_EMPLOYEE" && !hrmsData)
              }
            >
              {submitting
                ? "Submitting…"
                : registrationType === "BOA"
                  ? "Submit for DGM approval"
                  : "Register"}
            </button>
          </form>
          <div className="login-help">
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              Back to sign in
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
