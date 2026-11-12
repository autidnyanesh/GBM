import React from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { AccountTable } from "../components/index.js";

export function AccountsPage({
  query,
  setQuery,
  status,
  setStatus,
  setModal,
  rows,
  verifyAccount,
  softDelete,
  uploadAof,
  role,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ACCOUNT MANAGEMENT</div>
          <h1>PPF accounts</h1>
          <p>Open, review and maintain PPF account records.</p>
        </div>
        <button className="primary" onClick={() => setModal("account")}>
          <Plus size={17} /> Open an account
        </button>
      </div>
      <div className="panel list-panel">
        <div className="list-toolbar">
          <div className="searchbox">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account, holder or CIF"
            />
          </div>
          <div className="filterbox">
            <Filter size={15} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option>PENDING</option>
              <option>ACTIVE</option>
              <option>CLOSED</option>
              <option>TRANSFER_PENDING</option>
              <option>TRANSFER_OUT</option>
              <option>DELETED</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <button className="outline" onClick={() => setModal("transfer")}>
            <ArrowLeftRight size={15} /> Transfer out
          </button>
        </div>
        <AccountTable
          rows={rows}
          onVerify={verifyAccount}
          onDelete={softDelete}
          onUpload={uploadAof}
          role={role}
        />
      </div>
    </>
  );
}
