import React from "react";
import { Plus } from "lucide-react";
import { SimpleRows } from "../components/index.js";

export function ExtensionsPage({ items, setModal, verifyExtension, role }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MATURITY MANAGEMENT</div>
          <h1>PPF extensions</h1>
          <p>Request and verify account extensions with Form H details.</p>
        </div>
        <button className="primary" onClick={() => setModal("extension")}>
          <Plus size={17} /> Request extension
        </button>
      </div>
      <div className="panel list-panel">
        <SimpleRows
          rows={items}
          cols={[
            "accountNo",
            "holderName",
            "balance",
            "extensionPeriod",
            "currentMaturity",
            "newMaturity",
            "formH",
            "status",
          ]}
          onVerify={verifyExtension}
          role={role}
        />
      </div>
    </>
  );
}
