import React from "react";
import { Upload, BadgeCheck, Search, Trash2 } from "lucide-react";
import { money } from "../../common/format.js";

export function AccountTable({ rows, onVerify, onDelete, onUpload, role }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ACCOUNT HOLDER</th>
            <th>ACCOUNT NUMBER</th>
            <th>OPENING AMOUNT</th>
            <th>STATUS</th>
            <th>OPENED</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <div className="holder-cell">
                  <div className="holder-avatar">
                    {a.holderName
                      ?.split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span>
                    <b>{a.holderName}</b>
                    <small>{a.customerId || "New customer"}</small>
                  </span>
                </div>
              </td>
              <td className="mono">{a.accountNo}</td>
              <td>{money(a.initialSubscription)}</td>
              <td>
                <span
                  className={`status ${a.status === "ACTIVE" ? "active" : a.status === "PENDING" ? "pending" : "neutral"}`}
                >
                  <i />
                  {a.status?.replace("_", " ")}
                </span>
              </td>
              <td>
                {a.createdAt
                  ? new Date(a.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td>
                <div className="row-actions">
                  {a.status === "PENDING" && (
                    <>
                      <label className="action-icon" title="Upload AOF">
                        <Upload size={15} />
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) =>
                            e.target.files[0] &&
                            onUpload(a.id, e.target.files[0]).catch((err) =>
                              alert(err.message),
                            )
                          }
                        />
                      </label>
                      {role === "CHECKER" && (
                        <button
                          className="action-icon verify-action"
                          title="Verify account"
                          onClick={() => onVerify(a.id)}
                        >
                          <BadgeCheck size={16} />
                        </button>
                      )}
                      <button
                        className="action-icon danger-action"
                        title="Delete pending account"
                        onClick={() => onDelete(a.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={20} />
          </div>
          <b>No accounts found</b>
          <p>Try another search or open a new PPF account.</p>
        </div>
      )}
    </div>
  );
}
