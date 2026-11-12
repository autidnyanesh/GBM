import React from "react";

export function WelcomePage() {
  return (
    <section className="gbm-welcome">
      <p className="eyebrow">GOVERNMENT BUSINESS MODULE</p>
      <h1>
        Welcome
        <span>to</span>
        GBM
      </h1>
      <p className="hint">
        Select a module from the bar above. Its menu opens after you choose.
      </p>
    </section>
  );
}
