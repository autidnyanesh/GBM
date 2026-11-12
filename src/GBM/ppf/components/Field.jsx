import React from "react";

export function Field({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  value,
  onChange,
  error,
  feedback,
  feedbackType = "error",
  action,
  numericOnly = false,
  min,
  max,
  maxLength,
  disabled = false,
}) {
  function handleChange(e) {
    const nextValue = numericOnly
      ? e.target.value.replace(/\D/g, "").slice(0, maxLength)
      : ["text", "email", "search", "tel", "url"].includes(type)
        ? e.target.value.toUpperCase()
        : e.target.value;
    if (e.target.value !== nextValue) e.target.value = nextValue;
    onChange?.(nextValue);
  }

  return (
    <div className="field">
      <label>
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <div className={action ? "input-group" : undefined}>
        <input
          className={action ? "form-control" : undefined}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          maxLength={maxLength}
          inputMode={numericOnly ? "numeric" : undefined}
          pattern={numericOnly ? "[0-9]*" : undefined}
        />
        {action}
      </div>
      {error && <small className="field-error">{error}</small>}
      {feedback && (
        <small className={`field-${feedbackType}`}>{feedback}</small>
      )}
    </div>
  );
}
