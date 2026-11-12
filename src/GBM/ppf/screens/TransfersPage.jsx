import React from "react";
import { Plus } from "lucide-react";
import { SimpleRows } from "../components/index.js";

export function TransfersPage({ items, setModal, verifyTransfer, role }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ACCOUNT MOVEMENT</div>
          <h1>Transfers</h1>
          <p>Manage transfer-out requests to another bank or branch.</p>
        </div>
        <button className="primary" onClick={() => setModal("transfer")}>
          <Plus size={17} /> New transfer
        </button>
      </div>
      <div className="panel list-panel">
        <SimpleRows
          rows={items}
          cols={[
            "accountNo",
            "holderName",
            "type",
            "bankCode",
            "branchCode",
            "solId",
            "status",
          ]}
          onVerify={verifyTransfer}
          role={role}
        />
      </div>
    </>
  );
}
