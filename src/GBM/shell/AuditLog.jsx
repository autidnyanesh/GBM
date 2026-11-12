import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { roleName } from "../common/format.js";
import { req } from "../common/api.js";

const PAGE_SIZE = 20;

export function AuditLog({ setError }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [meta, setMeta] = useState({ totalPages: 1, totalElements: 0, size: PAGE_SIZE });

  useEffect(() => {
    const timer = setTimeout(() => {
      req(`/audit-logs?page=${page}&size=${PAGE_SIZE}&q=${encodeURIComponent(query)}`)
        .then((data) => {
          setRows(data.content || []);
          setMeta(data);
        })
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [page, query]);

  const totalPages = Math.max(meta.totalPages || 0, 1);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SECURITY & COMPLIANCE</div>
          <h1>Audit log</h1>
          <p>Login attempts, sessions, SOL changes, and write API activity.</p>
        </div>
      </div>
      <div className="panel list-panel">
        <div className="list-toolbar">
          <div className="searchbox">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search user, ID, SOL, activity, result or request"
              aria-label="Search audit log"
            />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TIME</th>
                <th>USER</th>
                <th>USER ID</th>
                <th>SOL ID</th>
                <th>ACTIVITY</th>
                <th>RESULT</th>
                <th>REQUEST</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                  <td>
                    {r.username || "Unknown"}
                    {r.userRole ? ` · ${roleName(r.userRole)}` : ""}
                  </td>
                  <td>{r.userIdentifier || "—"}</td>
                  <td>{r.activeSolId || "—"}</td>
                  <td>{r.activity}</td>
                  <td>{r.outcome}</td>
                  <td>
                    {r.httpMethod} {r.endpoint}
                  </td>
                  <td>{r.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="empty-state">
              {query ? "No audit entries match your search." : "No user activity is recorded yet."}
            </div>
          )}
        </div>
        <div className="audit-pager">
          <span>
            {meta.totalElements || 0} events · page {page + 1} of {totalPages}
          </span>
          <button className="outline" type="button" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button
            className="outline"
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
