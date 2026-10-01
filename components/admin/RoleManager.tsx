"use client";

import { FormEvent, useEffect, useState } from "react";
import PasswordField from "@/components/PasswordField";
import {
  MIN_PASSWORD_LENGTH,
  STAFF_PERMISSIONS,
  StaffAccount,
  StaffPermission,
  StaffRole,
  SUPERADMIN_ROLE_ID,
  createRole,
  createStaffAccount,
  deleteRole,
  deleteStaffAccount,
  readRoles,
  readStaffAccounts,
  updateRole,
} from "@/lib/staff";

/** Role configuration: create roles, choose their permissions, and issue the sign-in accounts that use them. */
export default function RoleManager() {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  function refresh(next?: StaffRole[]) {
    setRoles(next ?? readRoles());
    setAccounts(readStaffAccounts());
  }

  useEffect(() => {
    refresh();
  }, []);

  function togglePermission(roleId: string, permission: StaffPermission, enabled: boolean) {
    const rolesNow = readRoles();
    const role = rolesNow.find((entry) => entry.id === roleId);
    if (!role || role.system) return;
    const permissions = enabled ? [...role.permissions, permission] : role.permissions.filter((entry) => entry !== permission);
    refresh(updateRole(roleId, { permissions }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Read the credentials from the form: PasswordField is uncontrolled, so there
    // is no component state holding the password. Hold the form element here
    // because React clears event.currentTarget once the handler awaits.
    const form = event.currentTarget;
    const data = new FormData(form);
    const label = String(data.get("label") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const name = String(data.get("accountName") ?? "").trim();
    const email = String(data.get("accountEmail") ?? "").trim();
    const password = String(data.get("accountPassword") ?? "");
    if (!label) return;

    const wantsAccount = Boolean(name || email || password);
    if (wantsAccount && !name) {
      setProblem("Enter the name of the person who will sign in, or clear the sign-in fields.");
      return;
    }
    if (wantsAccount && !email) {
      setProblem("Enter an email address for the sign-in, or clear the sign-in fields.");
      return;
    }
    if (wantsAccount && password.length < MIN_PASSWORD_LENGTH) {
      setProblem(`Choose a password of at least ${MIN_PASSWORD_LENGTH} characters, or clear the sign-in fields.`);
      return;
    }

    setBusy(true);
    setProblem("");
    const before = readRoles();
    const after = createRole(label, description, ["applications.view"]);
    const created = after.find((role) => !before.some((old) => old.id === role.id));
    refresh(after);

    if (!wantsAccount || !created) {
      setMessage(`Role "${label}" created. It starts with view access only — grant permissions below.`);
      setBusy(false);
      form.reset();
      setDraftLabel("");
      setDraftDescription("");
      return;
    }

    // The role already exists, so an account failure is reported rather than
    // silently discarding the role the admin just configured.
    const failure = await createStaffAccount(name, email, created.id, password);
    refresh();
    setBusy(false);
    form.reset();
    setDraftLabel("");
    setDraftDescription("");
    if (failure) {
      setProblem(`Role "${label}" was created, but the sign-in was not: ${failure}`);
      setMessage("");
    } else {
      setMessage(`Role "${label}" and a sign-in for ${name} were created. Grant permissions below.`);
    }
  }
  function handleDeleteAccount(account: StaffAccount) {
    setProblem("");
    const failure = deleteStaffAccount(account.id);
    if (failure) setProblem(failure);
    else setMessage(`Removed the sign-in for ${account.fullName}.`);
    refresh();
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>Roles</h2><p>Define what each role may do. System roles cannot be deleted.</p></div>
        <span className="admin-count">{roles.length} roles</span>
      </div>

      <ul className="role-list">
        {roles.map((role) => {
          const holders = accounts.filter((account) => account.roleId === role.id);
          return (
            <li className="role-card" key={role.id}>
              <div className="role-card-head">
                <div>
                  <strong>{role.label}</strong>
                  {role.system ? <span className="role-badge">System</span> : null}
                  <small>{role.description}</small>
                </div>
                <div className="role-card-actions">
                  <button className="admin-button" type="button" onClick={() => setEditing(editing === role.id ? null : role.id)} aria-expanded={editing === role.id}>
                    {editing === role.id ? "Close" : "Permissions"}
                  </button>
                  <button className="admin-button admin-button-danger" type="button" disabled={role.system} onClick={() => { const result = deleteRole(role.id); refresh(result.roles); setProblem(result.error ?? ""); }}>
                    Delete
                  </button>
                </div>
              </div>

              {editing === role.id ? (
                <div className="role-permissions">
                  {STAFF_PERMISSIONS.map((permission) => (
                    <label className="permission-row" key={permission.id}>
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(permission.id)}
                        disabled={role.system}
                        onChange={(event) => togglePermission(role.id, permission.id, event.target.checked)}
                      />
                      <span>
                        <strong>{permission.label}</strong>
                        <small>{permission.description}</small>
                      </span>
                    </label>
                  ))}
                  {role.system ? <p className="admin-hint">System roles keep every permission.</p> : null}
                </div>
              ) : (
                <p className="role-permission-summary">
                  {role.permissions.length} of {STAFF_PERMISSIONS.length} permissions
                </p>
              )}

              <div className="role-holders">
                <span className="role-holders-label">Sign-ins</span>
                {holders.length === 0 ? (
                  <p className="role-holders-empty">No account uses this role yet.</p>
                ) : (
                  <ul>
                    {holders.map((account) => (
                      <li key={account.id}>
                        <span><strong>{account.fullName}</strong><small>{account.email}</small></span>
                        <button
                          className="admin-button admin-button-danger"
                          type="button"
                          onClick={() => handleDeleteAccount(account)}
                          disabled={account.roleId === SUPERADMIN_ROLE_ID}
                          aria-label={`Remove the sign-in for ${account.fullName}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <form className="admin-create" onSubmit={handleCreate}>
        <h3>New role</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="role-label">Role name</label>
            <input id="role-label" name="label" value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} required maxLength={60} placeholder="e.g. Port Coordinator" />
          </div>
          <div className="field">
            <label htmlFor="role-description">Description</label>
            <input id="role-description" name="description" value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} maxLength={160} placeholder="What this role is responsible for" />
          </div>
        </div>

        <fieldset className="role-credentials">
          <legend>Create a sign-in for this role (optional)</legend>
          <p className="admin-hint">
            Leave blank to create the role only. The password is hashed in the browser and never shown again —
            share it out of band and ask the holder to change it after signing in.
          </p>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="role-account-name">Full name</label>
              <input id="role-account-name" name="accountName" maxLength={120} placeholder="Who will sign in" autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="role-account-email">Email address</label>
              <input id="role-account-email" name="accountEmail" type="email" maxLength={254} placeholder="name@example.com" autoComplete="off" />
            </div>
          </div>
          <PasswordField
            id="role-account-password"
            name="accountPassword"
            label={"Initial password (" + MIN_PASSWORD_LENGTH + " characters minimum)"}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={100}
            required={false}
          />
        </fieldset>

        <button className="button admin-button" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create role and sign-in"}
        </button>
      </form>

      {problem ? <p className="admin-message admin-message-error" role="alert">{problem}</p> : null}
      {message ? <p className="admin-message" role="status">{message}</p> : null}
    </section>
  );
}
