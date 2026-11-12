import React, { useEffect, useMemo, useState } from "react";
import { req } from "../common/api.js";
import { ListPage, Modal } from "./components/index.js";
import {
  AccountsPage,
  DashboardPage,
  ExtensionsPage,
  NominationsPage,
  TransfersPage,
} from "./screens/index.js";

export function PpfWorkspace({
  session,
  page,
  setPage,
  setError,
  notify,
  onSummaryChange,
}) {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [modal, setModal] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = async () => {
    try {
      const [nextAccounts, nextSummary] = await Promise.all([
        req("/ppf/accounts?includeDeleted=true"),
        req("/ppf/summary"),
      ]);
      setAccounts(nextAccounts);
      setSummary(nextSummary);
      onSummaryChange(nextSummary);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    refresh();
  }, [session]);

  useEffect(() => {
    const endpoint = {
      Transfers: "/ppf/transfers",
      Extensions: "/ppf/extensions",
      "AOF inquiry": "/ppf/aof",
    }[page];
    if (!endpoint) return;

    let cancelled = false;
    req(endpoint)
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((error) => {
        if (!cancelled) setError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          (status === "ALL" || account.status === status) &&
          `${account.accountNo} ${account.holderName} ${account.customerId || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [accounts, status, query],
  );

  async function createAccount(data, aofFile) {
    setBusy(true);
    try {
      const form = new FormData();
      form.append(
        "account",
        new Blob([JSON.stringify({ ...data, actor: session.email })], {
          type: "application/json",
        }),
      );
      form.append("file", aofFile);
      await req("/ppf/accounts", {
        method: "POST",
        body: form,
      });
      setModal("");
      notify("PPF account created with AOF and sent for verification");
      await refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadAof(id, file) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("actor", session.email);
      await req(`/ppf/accounts/${id}/aof`, { method: "POST", body: form });
      notify("AOF uploaded");
    } catch (error) {
      setError(error.message);
    }
  }

  async function verifyAccount(id) {
    try {
      await req(`/ppf/accounts/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: session.email }),
      });
      notify("Account verified; AOF and nominees marked verified");
      await refresh();
    } catch (error) {
      setError(error.message);
    }
  }

  async function softDelete(id) {
    try {
      await req(
        `/ppf/accounts/${id}?actor=${encodeURIComponent(session.email)}`,
        { method: "DELETE" },
      );
      notify("Pending account deleted");
      await refresh();
    } catch (error) {
      setError(error.message);
    }
  }

  async function createTransfer(data) {
    try {
      await req("/ppf/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, actor: session.email }),
      });
      setModal("");
      notify("Transfer request created");
      await refresh();
      setPage("Transfers");
    } catch (error) {
      setError(error.message);
    }
  }

  async function verifyTransfer(id) {
    try {
      await req(`/ppf/transfers/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: session.email }),
      });
      notify("Transfer verified");
      setPage("Transfers");
      await refresh();
    } catch (error) {
      setError(error.message);
    }
  }

  async function createExtension(data) {
    try {
      await req("/ppf/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, actor: session.email }),
      });
      setModal("");
      notify("Extension request created");
      setPage("Extensions");
    } catch (error) {
      setError(error.message);
    }
  }

  async function verifyExtension(id) {
    try {
      await req(`/ppf/extensions/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: session.email }),
      });
      notify("Extension verified");
      setItems(await req("/ppf/extensions"));
    } catch (error) {
      setError(error.message);
    }
  }

  const activeAccounts = accounts.filter(
    (account) => account.status === "ACTIVE",
  );

  return (
    <>
      {page === "Dashboard" && (
        <DashboardPage
          session={session}
          summary={summary}
          accounts={accounts}
          setPage={setPage}
          setModal={setModal}
          verifyAccount={verifyAccount}
          softDelete={softDelete}
          uploadAof={uploadAof}
        />
      )}
      {page === "Accounts" && (
        <AccountsPage
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          setModal={setModal}
          rows={filteredAccounts}
          verifyAccount={verifyAccount}
          softDelete={softDelete}
          uploadAof={uploadAof}
          role={session.role}
        />
      )}
      {page === "AOF inquiry" && (
        <ListPage
          title="AOF inquiry"
          kicker="DOCUMENT MANAGEMENT"
          desc="Retrieve account opening forms and upload history."
          rows={items}
          columns={[
            "fileName",
            "accountId",
            "uploadedBy",
            "uploadedAt",
            "verified",
          ]}
          empty="No AOF documents uploaded yet."
        />
      )}
      {page === "Transfers" && (
        <TransfersPage
          items={items}
          setModal={setModal}
          verifyTransfer={verifyTransfer}
          role={session.role}
        />
      )}
      {page === "Extensions" && (
        <ExtensionsPage
          items={items}
          setModal={setModal}
          verifyExtension={verifyExtension}
          role={session.role}
        />
      )}
      {page === "Nominations" && (
        <NominationsPage
          accounts={accounts}
          items={items}
          setItems={setItems}
        />
      )}
      {modal && (
        <Modal
          type={modal}
          accounts={activeAccounts}
          onClose={() => setModal("")}
          onAccount={createAccount}
          onTransfer={createTransfer}
          onExtension={createExtension}
          busy={busy}
        />
      )}
    </>
  );
}
