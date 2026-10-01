"use client";

import { useEffect, useState } from "react";
import {
  ApprovalLevel,
  StaffRole,
  SUPERADMIN_ROLE_ID,
  addApprovalLevel,
  moveApprovalLevel,
  readRoles,
  readWorkflow,
  removeApprovalLevel,
  resetWorkflow,
  updateApprovalLevel,
} from "@/lib/staff";

/** Approval workflow: ordered levels, each bound to a role with a target and quota. */
export default function ApprovalLevelManager() {
  const [levels, setLevels] = useState<ApprovalLevel[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLevels(readWorkflow());
    setRoles(readRoles());
  }, []);

  function refresh(next: ApprovalLevel[]) {
    setLevels(next);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>Approval levels</h2><p>Applications advance through these levels in order. Each level is signed off by a role.</p></div>
        <div className="admin-panel-actions">
          <span className="admin-count">{levels.length} levels</span>
          <button className="admin-button" type="button" onClick={() => { refresh(addApprovalLevel(roles[0]?.id ?? SUPERADMIN_ROLE_ID)); setMessage("Approval level added."); }}>
            Add level
          </button>
          <button className="admin-button" type="button" onClick={() => { refresh(resetWorkflow()); setMessage("Workflow reset to the default three levels."); }}>
            Reset
          </button>
        </div>
      </div>

      {levels.length === 0 ? (
        <div className="empty-state"><span className="empty-symbol">—</span><h2>No approval levels</h2><p>Add a level to start building the workflow.</p></div>
      ) : (
        <ol className="level-list">
          {levels.map((level, index) => (
            <li className="level-row" key={level.id}>
              <div className="level-order">
                <span>{String(level.order).padStart(2, "0")}</span>
                <div className="level-move">
                  <button className="admin-button admin-button-icon" type="button" onClick={() => refresh(moveApprovalLevel(level.id, -1))} disabled={index === 0} aria-label={`Move ${level.label} earlier`}>↑</button>
                  <button className="admin-button admin-button-icon" type="button" onClick={() => refresh(moveApprovalLevel(level.id, 1))} disabled={index === levels.length - 1} aria-label={`Move ${level.label} later`}>↓</button>
                </div>
              </div>

              <div className="level-fields">
                <div className="field">
                  <label htmlFor={`label-${level.id}`}>Level name</label>
                  <input id={`label-${level.id}`} defaultValue={level.label} maxLength={80}
                    onBlur={(event) => refresh(updateApprovalLevel(level.id, { label: event.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor={`role-${level.id}`}>Signed off by</label>
                  <select id={`role-${level.id}`} value={level.roleId} onChange={(event) => refresh(updateApprovalLevel(level.id, { roleId: event.target.value }))}>
                    {roles.map((role) => <option value={role.id} key={role.id}>{role.label}</option>)}
                  </select>
                </div>
                <div className="field field-narrow">
                  <label htmlFor={`approvals-${level.id}`}>Approvals needed</label>
                  <input id={`approvals-${level.id}`} type="number" min={1} max={20} defaultValue={level.requiredApprovals}
                    onBlur={(event) => refresh(updateApprovalLevel(level.id, { requiredApprovals: Math.max(1, Number(event.target.value) || 1) }))} />
                </div>
                <div className="field field-narrow">
                  <label htmlFor={`sla-${level.id}`}>Target (days)</label>
                  <input id={`sla-${level.id}`} type="number" min={0} max={90} defaultValue={level.slaDays}
                    onBlur={(event) => refresh(updateApprovalLevel(level.id, { slaDays: Math.max(0, Number(event.target.value) || 0) }))} />
                </div>
                <label className="permission-row level-required">
                  <input type="checkbox" checked={level.required} onChange={(event) => refresh(updateApprovalLevel(level.id, { required: event.target.checked }))} />
                  <span><strong>Required</strong><small>Must pass before the next level</small></span>
                </label>
                <button className="admin-button admin-button-danger" type="button" onClick={() => { refresh(removeApprovalLevel(level.id)); setMessage("Approval level removed."); }}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {message ? <p className="admin-message" role="status">{message}</p> : null}
    </section>
  );
}