"use client";

import React from "react";

export default function AdminSettingsPage() {
  return (
    <main className="dashboard-content settings-page-content" id="settings-page-content">
      <div className="settings-section">
        
        <div className="settings-block">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 className="settings-block-title">Team & Admins</h2>
            <p className="settings-block-subtitle">Manage your organization's members, invite new contributors, and control access levels across the botanical ledger.</p>
          </div>

          <div className="settings-notice">
            <div className="settings-notice-icon">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div>
              <h4 className="settings-notice-title">Security Protocol: Temporary Passwords</h4>
              <p className="settings-notice-copy">Invited members will receive a secure temporary password via email valid for 24 hours. They must reset it upon first login.</p>
            </div>
          </div>

          <div className="settings-team-grid">
            {/* Invite Form Card */}
            <div className="settings-card">
              <h3 className="settings-card-title" style={{ fontSize: '1.125rem' }}>Invite Member</h3>
              <form className="settings-invite-form">
                <div className="settings-field-wrap">
                  <label className="settings-field-label">Email Address</label>
                  <input type="email" className="settings-input" placeholder="colleague@ppd-targets.com" />
                </div>
                <div className="settings-field-wrap">
                  <label className="settings-field-label">Assigned Role</label>
                  <select className="settings-select">
                    <option>Content Editor</option>
                    <option>Moderator</option>
                    <option>Super Admin</option>
                  </select>
                </div>
                <button type="submit" className="settings-send-btn" style={{ marginTop: '8px' }}>Send Invite</button>
              </form>
            </div>

            {/* Member List Card */}
            <div className="settings-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="settings-member-tabs">
                  <button className="settings-tab active">Active Members (12)</button>
                  <button className="settings-tab">Pending Invites (3)</button>
                </div>
              </div>
              
              <ul className="settings-member-list">
                <li className="settings-member-row" style={{ padding: '16px 32px', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="settings-member-left">
                    <div className="settings-member-avatar">EH</div>
                    <div className="settings-member-meta">
                      <span className="settings-member-name">Elena Halvorsen</span>
                      <span className="settings-member-email">elena@botanical.io</span>
                    </div>
                  </div>
                  <div className="settings-member-right">
                    <span className="settings-role-pill settings-role-super">Super Admin</span>
                    <span className="settings-member-last-active">2 mins ago</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}>more_vert</span>
                  </div>
                </li>

                <li className="settings-member-row" style={{ padding: '16px 32px', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="settings-member-left">
                    <div className="settings-member-avatar">JM</div>
                    <div className="settings-member-meta">
                      <span className="settings-member-name">Julian Moss</span>
                      <span className="settings-member-email">j.moss@botanical.io</span>
                    </div>
                  </div>
                  <div className="settings-member-right">
                    <span className="settings-role-pill settings-role-editor">Content Editor</span>
                    <span className="settings-member-last-active">5 hours ago</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}>more_vert</span>
                  </div>
                </li>

                <li className="settings-member-row" style={{ padding: '16px 32px', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="settings-member-left">
                    <div className="settings-member-avatar">AR</div>
                    <div className="settings-member-meta">
                      <span className="settings-member-name">Aria Rose</span>
                      <span className="settings-member-email">aria@botanical.io</span>
                    </div>
                  </div>
                  <div className="settings-member-right">
                    <span className="settings-role-pill settings-role-moderator">Moderator</span>
                    <span className="settings-member-last-active">Yesterday</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}>more_vert</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Roles & Permissions */}
        <div className="settings-block">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 className="settings-block-title">Roles & Permissions</h2>
            <p className="settings-block-subtitle">Define granular access control for each user role. These permissions dictate what actions members can perform across the platform.</p>
          </div>

          <div className="settings-table-wrap">
            <table className="settings-perm-table">
              <thead>
                <tr>
                  <th>Capabilities</th>
                  <th>Super Admin</th>
                  <th>Content Editor</th>
                  <th>Moderator</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="settings-perm-capability">Invite New Members</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'14px'}}>check_circle</span>
                    </div>
                  </td>
                  <td><span className="settings-perm-dash">-</span></td>
                  <td><span className="settings-perm-dash">-</span></td>
                </tr>
                <tr>
                  <td className="settings-perm-capability">Manage Permissions</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td><span className="settings-perm-dash">-</span></td>
                  <td><span className="settings-perm-dash">-</span></td>
                </tr>
                <tr>
                  <td className="settings-perm-capability">Publish New Content</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td><span className="settings-perm-dash">-</span></td>
                </tr>
                <tr>
                  <td className="settings-perm-capability">Edit Existing Assets</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td><span className="settings-perm-dash">-</span></td>
                </tr>
                <tr>
                  <td className="settings-perm-capability">Review Submissions</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="settings-perm-capability">Audit System Logs</td>
                  <td>
                    <div className="settings-perm-check">
                      <span className="material-symbols-outlined" style={{fontSize:'16px'}}>check_circle</span>
                    </div>
                  </td>
                  <td><span className="settings-perm-dash">-</span></td>
                  <td><span className="settings-perm-dash">-</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: General Settings */}
        <div className="settings-block">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 className="settings-block-title">General Settings</h2>
            <p className="settings-block-subtitle">Configure your environment's global preferences and core identity.</p>
          </div>

          <div className="settings-general-grid">
            {/* App Identity Card */}
            <div className="settings-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>badge</span>
                <h3 className="settings-card-title" style={{ fontSize: '1.125rem' }}>App Identity</h3>
              </div>
              
              <div className="settings-inline-fields">
                <div className="settings-field-wrap">
                  <label className="settings-field-label">Application Name</label>
                  <input type="text" className="settings-input" defaultValue="PPD Targets Admin" />
                </div>
                <div className="settings-field-wrap">
                  <label className="settings-field-label">System Email</label>
                  <input type="email" className="settings-input" defaultValue="system@botanical-le" />
                </div>
              </div>
              
              <div className="settings-inline-fields">
                <div className="settings-field-wrap">
                  <label className="settings-field-label">Timezone</label>
                  <select className="settings-select" defaultValue="UTC-05:00 Eastern">
                    <option value="UTC-05:00 Eastern">UTC-05:00 Eastern</option>
                  </select>
                </div>
                <div className="settings-field-wrap">
                  <label className="settings-field-label">Date Format</label>
                  <select className="settings-select" defaultValue="DD/MM/YYYY">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Protocol Card */}
            <div className="settings-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>security</span>
                <h3 className="settings-card-title" style={{ fontSize: '1.125rem' }}>Security Protocol</h3>
              </div>
              
              <div className="settings-switch-row">
                <div className="settings-switch-copy">
                  <span className="settings-switch-label">Two-Factor Authentication</span>
                  <span className="settings-switch-hint">Require 2FA for all Super Admin roles.</span>
                </div>
                <label className="settings-switch-control">
                  <input type="checkbox" defaultChecked />
                  <div className="settings-switch-slider"></div>
                </label>
              </div>

              <div className="settings-switch-row" style={{ marginTop: '24px' }}>
                <div className="settings-switch-copy">
                  <span className="settings-switch-label">Auto-logout Inactivity</span>
                  <span className="settings-switch-hint">Logout users after 30 minutes of inactivity.</span>
                </div>
                <label className="settings-switch-control">
                  <input type="checkbox" defaultChecked />
                  <div className="settings-switch-slider"></div>
                </label>
              </div>

              <div className="settings-switch-row" style={{ marginTop: '24px' }}>
                <div className="settings-switch-copy">
                  <span className="settings-switch-label">Enforce Password Reset</span>
                  <span className="settings-switch-hint">Force all users to change passwords every 90 days.</span>
                </div>
                <label className="settings-switch-control">
                  <input type="checkbox" />
                  <div className="settings-switch-slider"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
