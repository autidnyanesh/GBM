import React from "react";

export function Quick({ icon: Icon, label, desc, onClick }) {
  return (
    <button className="quick-item" onClick={onClick}>
      <span className="quick-icon">
        <Icon size={17} />
      </span>
      <span>
        <b>{label}</b>
        <small>{desc}</small>
      </span>
      <span className="quick-arrow">↗</span>
    </button>
  );
}
