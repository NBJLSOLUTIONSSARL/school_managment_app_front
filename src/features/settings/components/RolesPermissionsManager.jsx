import React, { useState, useEffect, useCallback } from 'react';
import { roleManagementService } from '../api/roleManagementService';

export const RolesPermissionsManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allRoles, allPerms] = await Promise.all([
        roleManagementService.getAllRoles(),
        roleManagementService.getAllPermissions(),
      ]);
      setRoles(allRoles);
      setPermissions(allPerms);
      if (allRoles.length > 0) {
        setSelectedRole(allRoles[0]);
        setSelectedPermIds(new Set(allRoles[0].permissions?.map((p) => p.id) || []));
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedPermIds(new Set(role.permissions?.map((p) => p.id) || []));
  };

  const handleTogglePerm = (permId) => {
    const next = new Set(selectedPermIds);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    setSelectedPermIds(next);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      await roleManagementService.updateRolePermissions(selectedRole.id, {
        permissionIds: Array.from(selectedPermIds),
      });
      setMessage({ type: 'success', text: `Permissions de ${selectedRole.name} mises à jour` });
      loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des permissions' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-xs text-gray-500">Chargement des rôles et habilitations...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Gestion des Rôles & Permissions (Spécification Section 3)
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            SUPER_ADMIN, DIRECTOR, SECRETARY, TEACHER, ACCOUNTANT, LIBRARIAN, PARENT, STUDENT.
          </p>
        </div>
        {message && (
          <span
            className={`text-2xs px-2.5 py-1 rounded font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Roles list */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 text-2xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            Rôles Système ({roles.length})
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[350px]">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-mono text-2xs">{role.name}</span>
                  <span className="text-2xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                    {role.permissions?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions matrix for selected role */}
        <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 text-2xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span>Habilitations assignées à : <strong className="text-gray-900 dark:text-gray-100 font-mono">{selectedRole?.name}</strong></span>
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={saving}
              className="text-2xs px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder les permissions'}
            </button>
          </div>

          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[350px]">
            {permissions.map((perm) => {
              const checked = selectedPermIds.has(perm.id);
              return (
                <label
                  key={perm.id}
                  className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                    checked
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTogglePerm(perm.id)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-mono text-2xs text-gray-900 dark:text-gray-100">{perm.name}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
