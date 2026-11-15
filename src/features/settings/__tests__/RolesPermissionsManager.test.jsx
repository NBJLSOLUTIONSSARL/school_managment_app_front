import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RolesPermissionsManager } from '../components/RolesPermissionsManager';
import { roleManagementService } from '../api/roleManagementService';

vi.mock('../api/roleManagementService', () => ({
  roleManagementService: {
    getAllRoles: vi.fn(),
    getAllPermissions: vi.fn(),
    updateRolePermissions: vi.fn(),
  },
}));

describe('RolesPermissionsManager', () => {
  const mockRoles = [
    {
      id: 7,
      name: 'ROLE_SUPER_ADMIN',
      permissions: [{ id: 1, name: 'PERM_USER_READ' }],
    },
    {
      id: 8,
      name: 'ROLE_DIRECTOR',
      permissions: [],
    },
  ];

  const mockPermissions = [
    { id: 1, name: 'PERM_USER_READ' },
    { id: 2, name: 'PERM_USER_WRITE' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders roles and assigned permissions', async () => {
    roleManagementService.getAllRoles.mockResolvedValueOnce(mockRoles);
    roleManagementService.getAllPermissions.mockResolvedValueOnce(mockPermissions);

    render(<RolesPermissionsManager />);

    await waitFor(() => {
      expect(screen.getAllByText('ROLE_SUPER_ADMIN').length).toBeGreaterThan(0);
      expect(screen.getByText('ROLE_DIRECTOR')).toBeInTheDocument();
      expect(screen.getByText('PERM_USER_READ')).toBeInTheDocument();
      expect(screen.getByText('PERM_USER_WRITE')).toBeInTheDocument();
    });
  });

  it('updates role permissions', async () => {
    roleManagementService.getAllRoles.mockResolvedValue(mockRoles);
    roleManagementService.getAllPermissions.mockResolvedValue(mockPermissions);
    roleManagementService.updateRolePermissions.mockResolvedValueOnce({
      id: 7,
      name: 'ROLE_SUPER_ADMIN',
      permissions: mockPermissions,
    });

    render(<RolesPermissionsManager />);

    await waitFor(() => {
      expect(screen.getAllByText('ROLE_SUPER_ADMIN').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText('Sauvegarder les permissions'));

    await waitFor(() => {
      expect(roleManagementService.updateRolePermissions).toHaveBeenCalled();
    });
  });
});
