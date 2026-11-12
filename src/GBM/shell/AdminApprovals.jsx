import React, { useState, useEffect } from "react";
import { req } from "../common/api.js";

export function AdminApprovals({ notify, setError }) {
  const [rows, setRows] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    Promise.all([req("/admin-change-requests"), req("/registration-approvals")])
      .then(([changes, requests]) => {
        setRows(changes);
        setRegistrations(requests);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    refresh();
  }, []);
  async function decide(id, decision) {
    setBusy(true);
    setError("");
    try {
      await req(`/admin-change-requests/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      notify(
        decision === "APPROVE"
          ? "Change approved and applied."
          : "Change rejected.",
      );
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function decideRegistration(id, decision) {
    setBusy(true);
    setError("");
    try {
      await req(`/registration-approvals/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      notify(
        decision === "APPROVE"
          ? "BOA registration approved for six months."
          : "BOA registration rejected.",
      );
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const pending = rows.filter((r) => r.status === "PENDING");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKER CHECKER</div>
          <h1>Admin approvals</h1>
          <p>
            Only DGM, GM, or CGM Operations Users can approve these requests.
          </p>
        </div>
      </div>
      <div className="panel list-panel">
        <div className="panel-head">
          <div>
            <h3>Administrator changes</h3>
            <p>Changes requested by Admins and Operations User makers.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REQUEST</th>
                <th>MAKER</th>
                <th>USER</th>
                <th>REQUESTED ACCESS</th>
                <th>SOL</th>
                <th>DESIGNATION</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.makerUsername}</td>
                  <td>
                    {r.targetUsername} → {r.username}
                  </td>
                  <td>
                    {r.userType} · {r.role}
                  </td>
                  <td>{r.solId}</td>
                  <td>{r.designation || "—"}</td>
                  <td>{r.status}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() => decide(r.id, "APPROVE")}
                      >
                        Approve
                      </button>
                      <button
                        className="outline"
                        disabled={busy}
                        onClick={() => decide(r.id, "REJECT")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pending.length && (
            <div className="empty-state">
              No administrator changes are awaiting approval.
            </div>
          )}
        </div>
      </div>
      <div className="panel list-panel">
        <div className="panel-head">
          <div>
            <h3>BOA registrations</h3>
            <p>Approved BOA access is valid for up to six months.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>USER ID</th>
                <th>SOL</th>
                <th>DESIGNATION</th>
                <th>REQUESTED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.displayName} · {r.username}
                  </td>
                  <td>{r.userIdentifier}</td>
                  <td>{r.solId}</td>
                  <td>{r.designation}</td>
                  <td>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() => decideRegistration(r.id, "APPROVE")}
                      >
                        Approve
                      </button>
                      <button
                        className="outline"
                        disabled={busy}
                        onClick={() => decideRegistration(r.id, "REJECT")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!registrations.length && (
            <div className="empty-state">
              No BOA registrations are awaiting approval.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
