import React, { useState } from "react";
import {
  Check,
  FileText,
  LockKeyhole,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { money } from "../../common/format.js";
import { initialNominee } from "../models.js";
import { Field } from "./Field.jsx";

export function Modal({
  type,
  accounts,
  onClose,
  onAccount,
  onTransfer,
  onExtension,
  busy,
}) {
  const [bankCustomer, setBankCustomer] = useState("No");
  const [nominees, setNominees] = useState([initialNominee()]);
  const [localError, setLocalError] = useState("");
  const [selected, setSelected] = useState("");
  const [transactionMode, setTransactionMode] = useState("Cash");
  const [instrumentType, setInstrumentType] = useState("Voucher");
  const [transferType, setTransferType] = useState("OTHER_BANK");
  const [lookup, setLookup] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pan, setPan] = useState("");
  const [form60, setForm60] = useState(true);
  const [panApplied, setPanApplied] = useState("");
  const [aofFile, setAofFile] = useState(null);
  const [aofError, setAofError] = useState("");
  const panIsValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const showPanValidation = pan.length === 10;
  const today = new Date();
  const [phone, setPhone] = useState("+91");
  const maxDateOfBirth = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [birthYear, birthMonth, birthDay] = dateOfBirth
    ? dateOfBirth.split("-").map(Number)
    : [];
  let age = dateOfBirth ? today.getFullYear() - birthYear : null;
  if (
    dateOfBirth &&
    (today.getMonth() + 1 < birthMonth ||
      (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay))
  ) {
    age -= 1;
  }
  const isMinor = age !== null && age < 18;
  async function submit(e) {
    e.preventDefault();
    setLocalError("");
    const f = new FormData(e.target),
      v = Object.fromEntries(f.entries());
    try {
      if (type === "account") {
        if (!aofFile) {
          setAofError("Please attach the required AOF PDF before continuing.");
          return;
        }
        if (
          (!form60 || panApplied === "No") &&
          v.pan &&
          !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.pan)
        )
          throw Error("Enter PAN in the format ABCDE1234F.");
        if (
          (form60 || !v.pan) &&
          !v.aadhaar &&
          (!form60 || !v.enrollmentId)
        )
          throw Error(
            "If PAN and Aadhaar are unavailable, Form 60 and the enrolment ID are required.",
          );
        await onAccount({
          ...v,
          pan: form60 && panApplied !== "No" ? "" : v.pan,
          panApplied: form60 ? panApplied : "",
          panApplicationDate:
            form60 && ["Yes", "No"].includes(panApplied)
              ? ""
              : v.panApplicationDate,
          bankCustomer: bankCustomer === "Yes",
          nominees: nominees.map((n) => ({
            ...n,
            percentage: Number(n.percentage),
          })),
        }, aofFile);
      }
      if (type === "transfer")
        await onTransfer({ ...v, accountId: selected, type: transferType });
      if (type === "extension")
        await onExtension({ ...v, accountId: selected });
    } catch (err) {
      setLocalError(err.message);
    }
  }
  const title =
    type === "account"
      ? "Open a PPF account"
      : type === "transfer"
        ? "Transfer an account out"
        : "Request an extension";
  return (
    <div
      className="ppf-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`ppf-modal ${type === "account" ? "wide-modal" : ""}`}>
        <div className="modal-head">
          <div>
            {/* <div className="eyebrow">
              {type === "account"
                ? "ACCOUNT OPENING"
                : type === "transfer"
                  ? "TRANSFER MANAGEMENT"
                  : "PPF MATURITY"}
            </div> */}
            <h2>{title}</h2>
            <p>
              {type === "account"
                ? "Capture account holder, funding and nominee details."
                : type === "transfer"
                  ? "Enter the destination details for this PPF account."
                  : "Form H is required for account continuation."}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {localError && <div className="error-banner">{localError}</div>}
        <form onSubmit={submit}>
          {type === "account" && (
            <>
              <div className="form-section">
                <h4>Account details</h4>
                {/* <p>
                  Enter customer information and account-opening details.
                </p> */}
                <div className="segmented">
                  <button
                    type="button"
                    className={bankCustomer === "Yes" ? "selected" : ""}
                    onClick={() => setBankCustomer("Yes")}
                  >
                    Existing bank customer
                  </button>
                  <button
                    type="button"
                    className={bankCustomer === "No" ? "selected" : ""}
                    onClick={() => setBankCustomer("No")}
                  >
                    New customer
                  </button>
                </div>
                {bankCustomer === "Yes" && (
                  <div className="form-grid">
                    <Field
                      label="Customer ID"
                      name="customerId"
                      placeholder="e.g. CIF008813"
                      required
                      action={
                        <button
                          type="button"
                          className="btn btn-outline-primary fetch-btn"
                          title="Fetch CBS Details"
                          onClick={() =>
                            setLookupResult(

                            )
                          }
                        >
                          <FaSearch size={13} />

                        </button>
                      }
                    />
                    <Field
                      label="Existing account number"
                      name="sourceAccount"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                )}

                <div className="form-grid">
                  <Field
                    label="Account holder first name"
                    name="holderName"
                    placeholder="First name"
                    required
                  />
                  <Field
                    label="Account holder middle name"
                    name="holderName"
                    placeholder="Middle name"
                  />
                  <Field
                    label="Account holder last name"
                    name="holderName"
                    placeholder="Last name"
                  />
                  <Field
                    label="A/C Holder DOB"
                    name="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    max={maxDateOfBirth}
                    required
                  />
                  <Field
                    label="Aadhaar number"
                    name="aadhaar"
                    placeholder="12 digit number"
                    maxLength="12"
                    numericOnly
                    required
                  />
                  <Field
                    label="Enrolment ID"
                    name="enrollmentId"
                    placeholder=""
                  />
                  <Field
                    label="PAN"
                    name="pan"
                    placeholder="10-character PAN"
                    value={form60 && panApplied === "Yes" ? "FORM60" : pan}
                    onChange={(value) => {
                      setPan(value);
                      if (value && panApplied !== "No") setForm60(false);
                    }}
                    maxLength="10"
                    required={!form60 || panApplied === "No"}
                    readOnly={form60 && panApplied === "Yes"}
                    error={
                      showPanValidation && !panIsValid
                        ? "Enter PAN in the format ABCDE1234F."
                        : undefined
                    }
                    feedback={
                      showPanValidation && panIsValid
                        ? "PAN format is valid."
                        : undefined
                    }
                    feedbackType="success"
                  />
                  <Field
                    label="Aadhaar vault ARK number"
                    name="arkNo"
                    placeholder="Fetched from Aadhaar vault"
                  />
                  <div className="field">
                    <label>Is A/C Holder an NRI<span className="text-danger">*</span></label>
                    <select
                      id="nriStatus"
                      name="nriStatus"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <Field
                    label="InterSol Id"
                    name="interSolId"
                    placeholder="Enter InterSol Id"
                  />
                  <Field
                    label="Phone number"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Field
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                  />
                  <Field
                    label="Father's/Spouse Name"
                    name="fatherSpouseName"
                    placeholder="Enter Father or Spouse Name"
                  />
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label>
                      Subscriber/Guardian address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      placeholder="House, street, city, state and PIN code"
                      rows="2"
                      onChange={(e) =>
                        (e.target.value = e.target.value.toUpperCase())
                      }
                    />

                  </div>

                </div>
                <div className="conditional-row">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      name="form60"
                      value="true"
                      checked={form60}
                      onChange={(e) => {
                        setForm60(e.target.checked);
                        setPanApplied("");
                        if (e.target.checked) setPan("");
                      }}
                    />{" "}
                    PAN unavailable (Form 60)
                  </label>
                </div>
                {form60 && (
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="pan-applied">
                        Is PAN applied?<span className="text-danger">*</span>
                      </label>
                      <select
                        id="pan-applied"
                        name="panApplied"
                        value={panApplied}
                        onChange={(e) => setPanApplied(e.target.value)}
                        // disabled={panApplied === "No"}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {panApplied && (
                      <Field
                        label="PAN application date"
                        name="panApplicationDate"
                        type="date"
                        disabled={panApplied === "No"}
                      />
                    )}


                  </div>
                )}
                {isMinor && (
                  <div>
                    <div className="message_notice">
                      Guardian details are required because the account holder
                      is a minor.
                    </div>
                    <div className="form-grid two mt-2">
                      <Field
                        label="Guardian First name"
                        name="guardianName"
                        placeholder="First Name"
                      />
                      <Field
                        label="Guardian Middle name"
                        name="guardianName"
                        placeholder="Middle Name"
                      />
                      <Field
                        label="Guardian Last name"
                        name="guardianName"
                        placeholder="Last Name"
                      />
                      <div className="field">
                        <label>Guardian's Relationship with minor</label>
                        <select name="guardianRelationship">
                          <option value="">Select</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                        </select>

                      </div>
                      <Field
                        label="DOB of Guardian"
                        name="guardianDob"
                        type="date"
                      />
                    </div>
                  </div>
                )}
                {/* <div className="form-grid two mt-3">
                  <div className="field">
                    <label>Account opening type</label>
                    <select name="accountType">
                      <option value="BRANCH">Branch opening</option>
                      <option value="TRANSFER_IN">
                        Transfer-in (from another bank)
                      </option>
                    </select>
                  </div>
                </div> */}
                {/* <div className="form-grid two transfer-fields">
                  <Field
                    label="Previous bank code (transfer-in)"
                    name="bankCode"
                    placeholder="Bank code"
                  />
                  <Field
                    label="Previous branch code"
                    name="branchCode"
                    placeholder="Branch code"
                  />
                  <div className="field full-field">
                    <label>Year-wise transfer-in details</label>
                    <textarea
                      name="transferYearDetails"
                      rows="2"
                      placeholder="Year and amount from previous bank"
                    />
                  </div>
                </div> */}
              </div>
              <div className="form-section">
                <h4>Other Bank Details</h4>
                <div className="form-grid">
                  <Field
                    label="Bank Name"
                    name="bankName"
                    placeholder="Enter Bank Name"
                  />
                  <Field
                    label="Branch Name"
                    name="branchName"
                    placeholder="Enter Branch Name"
                  />
                  <Field
                    label="Operative Account No."
                    name="operativeAcctNum"
                    placeholder="Enter Operative Account Number"
                  />
                  <Field
                    label="Address1"
                    name="address1"
                    placeholder="Enter Address Line 1"
                  />
                  <Field
                    label="Address2"
                    name="address2"
                    placeholder="Enter Address Line 2"
                  />
                  <Field
                    label="Address3"
                    name="address3"
                    placeholder="Enter Address Line 3"
                  />
                  <Field
                    label="City"
                    name="city"
                    placeholder="Enter City"
                  />
                  <Field
                    label="State"
                    name="state"
                    placeholder="Enter State"
                  />
                  <Field
                    label="Zip code"
                    name="zip"
                    placeholder="Enter Zip code"
                  />

                </div>

              </div>
              <div className="form-section">
                <h4>Deposit amount details</h4>
                <p>Choose how the initial subscription will be deposited.</p>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="transaction-mode">Transaction Mode</label>
                    <select
                      id="transaction-mode"
                      name="transactionMode"
                      value={transactionMode}
                      onChange={(e) => setTransactionMode(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Clearing">Clearing</option>
                    </select>
                  </div>
                  <Field
                    label="Transaction Amount (₹)"
                    name="initialSubscription"
                    type="number"
                    min="500"
                    placeholder="Minimum ₹500"
                    required
                  />
                  {transactionMode === "Cash" && (
                    <Field
                      label="Operative Account No."
                      name="operativeAccountNo"
                    />
                  )}
                  {transactionMode === "Transfer" && (
                    <>
                      <Field
                        label="Operative Account No."
                        name="operativeAccountNo"
                      />
                      {instrumentType === "Cheque" && (
                        <Field
                          label="Instrument Number"
                          name="instrumentNumber"
                          required
                        />
                      )}
                      <Field
                        label="Instrument Date"
                        name="instrumentDate"
                        type="date"
                        required
                      />
                      <div className="field">
                        <label htmlFor="instrument-type">Instrument Type</label>
                        <select
                          id="instrument-type"
                          name="instrumentType"
                          value={instrumentType}
                          onChange={(e) => setInstrumentType(e.target.value)}
                        >
                          <option value="Voucher">Voucher</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                    </>
                  )}
                  {transactionMode === "Clearing" && (
                    <>
                      <Field
                        label="Instrument Number"
                        name="instrumentNumber"
                        required
                      />
                      <Field
                        label="Instrument Date"
                        name="instrumentDate"
                        type="date"
                        required
                      />
                      <Field
                        label="Operative Account No."
                        name="operativeAccountNo"
                      />
                      <Field
                        label="Other Bank Name"
                        name="otherBankName"
                        required
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="form-section">
                <h4>Account Opening Form (AOF)</h4>
                <p>Attach the signed AOF as a PDF (maximum 10 MB).</p>
                <div className="field">
                  <label htmlFor="aof-file">
                    Signed AOF <span className="text-danger">*</span>
                  </label>
                  <label className="aof-upload-card" htmlFor="aof-file">
                    <input
                      id="aof-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) return;
                        if (
                          file.type !== "application/pdf" &&
                          !file.name.toLowerCase().endsWith(".pdf")
                        ) {
                          setAofFile(null);
                          setAofError("Only PDF documents are accepted.");
                          e.target.value = "";
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          setAofFile(null);
                          setAofError("PDF must be 10 MB or smaller.");
                          e.target.value = "";
                          return;
                        }
                        setAofFile(file);
                        setAofError("");
                      }}
                    />
                    <span className="aof-upload-icon">
                      {aofFile ? <FileText size={22} /> : <Upload size={22} />}
                    </span>
                    <span className="aof-upload-copy">
                      <span>{aofFile ? aofFile.name : "Upload signed AOF"}</span>
                      <small>
                        {aofFile
                          ? `${(aofFile.size / (1024 * 1024)).toFixed(2)} MB · PDF attached`
                          : "Choose a PDF document · Maximum 10 MB"}
                      </small>
                    </span>
                    <span className="aof-upload-action">
                      {aofFile ? "Change file" : "Choose PDF"}
                    </span>
                  </label>
                  {aofError && (
                    <small className="field-error" role="alert">
                      {aofError}
                    </small>
                  )}
                </div>
              </div>
              <div className="form-section nominee-section">
                <div className="section-title-row">
                  <div>
                    <h4>
                      Nominees <span className="text-danger">*</span> · up to 4
                    </h4>
                    <p>Nominee percentages must add up to 100%.</p>
                  </div>
                  <button
                    className="outline small-outline"
                    type="button"
                    disabled={nominees.length >= 4}
                    onClick={() => setNominees([...nominees, initialNominee()])}
                  >
                    <Plus size={14} /> Add nominee
                  </button>
                </div>
                {nominees.map((n, i) => (
                  <div className="nominee-edit" key={i}>
                    <div className="nominee-head">
                      <b>Nominee {String(i + 1).padStart(2, "0")}</b>
                      {nominees.length > 1 && (
                        <button
                          type="button"
                          className="remove-nominee"
                          onClick={() =>
                            setNominees(nominees.filter((_, j) => j !== i))
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="form-grid nominee-grid">
                      <Field
                        label="Name"
                        value={n.name}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, name: v } : x,
                            ),
                          )
                        }
                        required
                        placeholder="Nominee full name"
                      />
                      <Field
                        label="Date of birth"
                        type="date"
                        value={n.dob}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, dob: v } : x,
                            ),
                          )
                        }
                        required
                      />
                      <Field
                        label="Relationship"
                        value={n.relationship}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, relationship: v } : x,
                            ),
                          )
                        }
                        placeholder="e.g. Spouse"
                      />
                      <Field
                        label="Share (%)"
                        type="number"
                        min="0.01"
                        max="100"
                        value={n.percentage}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, percentage: v } : x,
                            ),
                          )
                        }
                        required
                      />
                      <Field
                        label="Nominee address"
                        value={n.address}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, address: v } : x,
                            ),
                          )
                        }
                        placeholder="Full address"
                      />
                      <Field
                        label="Guardian (if minor)"
                        value={n.guardianName}
                        onChange={(v) =>
                          setNominees(
                            nominees.map((x, j) =>
                              j === i ? { ...x, guardianName: v } : x,
                            ),
                          )
                        }
                        placeholder="Guardian name"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="privacy-note">
                <LockKeyhole size={15} />
                <span>
                  Aadhaar is masked before it is stored. PAN and identity checks
                  are integration points in this prototype.
                </span>
              </div>
            </>
          )}
          {type === "transfer" && (
            <div className="form-section">
              <h4>Account and destination</h4>
              <div className="field">
                <label>Find PPF account</label>
                <input
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value.toUpperCase())}
                  placeholder="Type account number or holder"
                />
                <div className="account-picker">
                  {accounts
                    .filter(
                      (a) =>
                        !lookup ||
                        `${a.accountNo} ${a.holderName}`
                          .toLowerCase()
                          .includes(lookup.toLowerCase()),
                    )
                    .map((a) => (
                      <button
                        type="button"
                        className={selected == a.id ? "picked" : ""}
                        onClick={() => setSelected(a.id)}
                        key={a.id}
                      >
                        <span>
                          <b>{a.holderName}</b>
                          <small>
                            {a.accountNo} · Balance {money(a.balance)}
                          </small>
                        </span>
                        {selected == a.id && <Check size={16} />}
                      </button>
                    ))}
                </div>
              </div>
              <div className="field">
                <label>Transfer destination</label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value)}
                >
                  <option value="OTHER_BANK">Other bank</option>
                  <option value="WITHIN_BANK">Within bank (another SOL)</option>
                </select>
              </div>
              {transferType === "OTHER_BANK" ? (
                <div className="form-grid two">
                  <Field
                    label="Destination bank code"
                    name="bankCode"
                    required
                  />
                  <Field
                    label="Destination branch code"
                    name="branchCode"
                    required
                  />
                  <div className="field full-field">
                    <label>Transfer through</label>
                    <input value="Pay Order" disabled />
                    <small>
                      Pay-order account is resolved by branch configuration.
                    </small>
                  </div>
                </div>
              ) : (
                <Field label="Transferred to SOL ID" name="solId" required />
              )}
              <div className="hint-banner">
                Accounts with uncleared transactions or active standing
                instructions cannot be transferred out.
              </div>
            </div>
          )}
          {type === "extension" && (
            <div className="form-section">
              <h4>Extension details</h4>
              <div className="field">
                <label>Select active PPF account</label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  required
                >
                  <option value="">Choose account</option>
                  {accounts.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.accountNo} · {a.holderName} · {money(a.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-grid two">
                <Field
                  label="Extension period"
                  name="extensionPeriod"
                  placeholder="e.g. 5 years"
                  required
                />
                <Field
                  label="Current maturity date"
                  name="currentMaturity"
                  type="date"
                  required
                />
                <Field
                  label="New maturity date"
                  name="newMaturity"
                  type="date"
                  required
                />
                <div className="field">
                  <label>Form H submitted</label>
                  <select name="formH">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="hint-banner">
                Submit an extension request within one year of maturity. Frozen
                accounts cannot be extended.
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary"
              disabled={busy || (!selected && type !== "account")}
            >
              {busy
                ? "Saving…"
                : type === "account"
                  ? "Create account"
                  : type === "transfer"
                    ? "Create transfer"
                    : "Submit extension"}
              <span>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
