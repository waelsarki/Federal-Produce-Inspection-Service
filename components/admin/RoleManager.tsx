"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  STAFF_PERMISSIONS,
  StaffPermission,
  StaffRole,
  createRole,
  deleteRole,
  readRoles,
  updateRole,
} from "@/lib/staff";

/** Role configuration: create roles and choose which permissions each one grants. */
export default function RoleManager() {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  useEffect(() => {
    setRoles(readRoles());
  }, []);

  function refresh(next?: StaffRole[]) {
    setRoles(next ?? readRoles());
  }

  function togglePermission(roleId: string, permission: StaffPermission, enabled: boolean) {
    const rolesNow = readRoles();
    const role = rolesNow.find((entry) => entry.id === roleId);
    if (!role || role.system) return;
    const permissions = enabled ? [...role.permissions, permission] : role.permissions.filter((entry) => entry !== permission);
    refresh(updateRole(roleId, { permissions }));
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftLabel.trim()) return;
    refresh(createRole(draftLabel.trim(), draftDescription.trim(), ["applications.view"]));
    setDraftLabel("");
    setDraftDescription("");
    setMessage("Role created. It starts with view access only — grant permissions below.");
  }

  function handleDelete(roleId: string) {
    const result = deleteRole(roleId);
    refresh(result.roles);
    setMessage(result.error ?? "Role deleted.");
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>Roles</h2><p>Define what each role may do. System roles cannot be deleted.</p></div>
        <span className="admin-count">{roles.length} roles</span>
      </div>

      <ul className="role-list">
        {roles.map((role) => (
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
                <button className="admin-button admin-button-danger" type="button" onClick={() => handleDelete(role.id)} disabled={role.system}>
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
                    <span><strong>{permission.label}</strong><small>{permission.description}</small></span>
                  </label>
                ))}
                {role.system ? <p className="admin-hint">System roles keep every permission.</p> : null}
              </div>
            ) : (
              <p className="role-permission-summary">
                {role.permissions.length} of {STAFF_PERMISSIONS.length} permissions
              </p>
            )}
          </li>
        ))}
      </ul>

      <form className="admin-create" onSubmit={handleCreate}>
        <h3>New role</h3>
        <div className="field-grid">
          <div className="field"><label htmlFor="role-label">Role name</label><input id="role-label" value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} required maxLength={60} placeholder="e.g. Port Coordinator" /></div>
          <div className="field"><label htmlFor="role-description">Description</label><input id="role-description" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} maxLength={160} placeholder="What this role is responsible for" /></div>
        </div>
        <button className="button admin-button" type="submit">Create role</button>
      </form>

      {message ? <p className="admin-message" role="status">{message}</p> : null}
    </section>
  );
}