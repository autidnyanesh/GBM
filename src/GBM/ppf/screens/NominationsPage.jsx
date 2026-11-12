import React from "react";
import { Search } from "lucide-react";
import { req } from "../../common/api.js";
import { SimpleRows } from "../components/index.js";

export function NominationsPage({ accounts, items, setItems }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ACCOUNT BENEFICIARIES</div>
          <h1>Nominations</h1>
          <p>Review nominees linked to PPF accounts.</p>
        </div>
        <div className="searchbox">
          <Search size={16} />
          <select
            className="nominee-select"
            onChange={async (e) => {
              if (e.target.value) {
                setItems(await req(`/ppf/accounts/${e.target.value}/nominees`));
              }
            }}
          >
            <option value="">Choose account</option>
            {accounts.map((a) => (
              <option value={a.id} key={a.id}>
                {a.accountNo} · {a.holderName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="panel list-panel">
        <SimpleRows
          rows={items}
          cols={[
            "name",
            "dob",
            "relationship",
            "address",
            "percentage",
            "status",
          ]}
        />
      </div>
    </>
  );
}
