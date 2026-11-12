import React from "react";

export function Stat({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">
        <span className="stat-dot" />
        {hint}
      </div>
    </div>
  );
}
