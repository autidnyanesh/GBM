import React from "react";
import { BadgeCheck, FileText } from "lucide-react";
import { money } from "../../common/format.js";

export function SimpleRows({
  rows,
  cols,
  onVerify,
  role,
  empty = "No records to display.",
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c.replace(/([A-Z])/g, " $1").toUpperCase()}</th>
            ))}
            {onVerify && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              {cols.map((c) => (
                <td key={c}>
                  {c === "status" ? (
                    <span
                      className={`status ${r[c] === "VERIFIED" || r[c] === "ACTIVE" ? "active" : "pending"}`}
                    >
                      <i />
                      {String(r[c] || "—").replace("_", " ")}
                    </span>
                  ) : c === "balance" ? (
                    money(r[c])
                  ) : (
                    String(r[c] ?? "—")
                  )}
                </td>
              ))}
              {onVerify && (
                <td>
                  {r.status === "PENDING" && role === "CHECKER" && (
                    <button
                      className="action-icon verify-action"
                      onClick={() => onVerify(r.id)}
                      title="Verify"
                    >
                      <BadgeCheck size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={20} />
          </div>
          <b>{empty}</b>
        </div>
      )}
    </div>
  );
}
