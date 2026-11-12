import React from "react";

export function SchemeHome({ scheme }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">GBM · {scheme.label}</div>
        <h1>{scheme.fullName}</h1>
        <p>You are signed in to this scheme. Its screens open here.</p>
      </div>
    </div>
  );
}
