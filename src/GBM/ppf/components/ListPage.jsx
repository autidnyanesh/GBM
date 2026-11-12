import React from "react";
import { SimpleRows } from "./SimpleRows.jsx";

export function ListPage({ title, kicker, desc, rows, columns, empty }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{kicker}</div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="panel list-panel">
        <SimpleRows rows={rows} cols={columns} empty={empty} />
      </div>
    </>
  );
}
