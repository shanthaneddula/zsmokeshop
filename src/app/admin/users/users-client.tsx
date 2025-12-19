'use client';

import { useState, useEffect } from 'react';
import { User, UserRole, DEFAULT_PERMISSIONS, UserPermissions } from '@/types/users';
import { Users, Plus, Edit, Trash2, X, Save, Eye, EyeOff, Shield } from 'lucide-react';

export function UsersClient() {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Omit<User, 'password'> | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'orders-manager' as UserRole,
  });

  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS['orders-manager']);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role });
    setPermissions(DEFAULT_PERMISSIONS[role]);
  };

  const handlePermissionToggle = (permission: keyof UserPermissions) => {
    setPermissions({
      ...permissions,
      [permission]: !permissions[permission],
    });
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        setShowAddModal(false);
        resetForm();
        alert('User added successfully!');
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        alert('User updated successfully!');
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        alert('User deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: Omit<User, 'password'>) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  const openEditModal = (user: Omit<User, 'password'>) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
    });
    setPermissions(user.permissions);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'orders-manager',
    });
    setPermissions(DEFAULT_PERMISSIONS['orders-manager']);
    setShowPassword(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-black text-white';
      case 'orders-manager': return 'bg-gray-700 text-white';
      case 'inventory-manager': return 'bg-gray-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'orders-manager': return 'Orders Manager';
      case 'inventory-manager': return 'Inventory Manager';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="max-w-full overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-600 mt-1 sm:mt-2">
              Manage employee users and their permissions
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white uppercase font-bold tracking-wide text-xs sm:text-sm hover:bg-gray-800 active:bg-gray-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900 mb-2">
            No Users Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4 sm:mb-6">
            Add employees to manage different areas of your store
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border-2 border-gray-200 p-4 sm:p-6 hover:border-black transition-colors"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-gray-900 uppercase truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">@{user.username}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide flex-shrink-0 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <p className="text-gray-700 truncate">{user.email}</p>
                {user.phone && <p className="text-gray-700">{user.phone}</p>}
                {user.lastLogin && (
                  <p className="text-gray-500 text-[10px] sm:text-xs">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-black text-white hover:bg-gray-800 active:bg-gray-700 text-xs sm:text-sm font-bold uppercase transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`p-2 border-2 hover:border-black text-xs sm:text-sm font-bold transition-colors ${
                    user.isActive ? 'border-gray-300' : 'border-red-300'
                  }`}
                  title={user.isActive ? 'Deactivate' : 'Activate'}
                >
                  {user.isActive ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  className="p-2 bg-gray-800 hover:bg-black active:bg-gray-900 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {!user.isActive && (
                <div className="mt-2 sm:mt-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-200 text-red-800 text-[10px] sm:text-xs font-bold uppercase">
                  Inactive
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <UserFormModal
          isEdit={showEditModal}
          formData={formData}
          permissions={permissions}
          showPassword={showPassword}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
          onSave={showEditModal ? handleUpdateUser : handleAddUser}
          onFormChange={setFormData}
          onPermissionToggle={handlePermissionToggle}
          onRoleChange={handleRoleChange}
          onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
        />
      )}
    </div>
  );
}

// User Form Modal Component
interface UserFormModalProps {
  isEdit: boolean;
  formData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
  };
  permissions: UserPermissions;
  showPassword: boolean;
  onClose: () => void;
  onSave: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFormChange: (data: any) => void;
  onPermissionToggle: (permission: keyof UserPermissions) => void;
  onRoleChange: (role: UserRole) => void;
  onTogglePasswordVisibility: () => void;
}

function UserFormModal({
  isEdit,
  formData,
  permissions,
  showPassword,
  onClose,
  onSave,
  onFormChange,
  onPermissionToggle,
  onRoleChange,
  onTogglePasswordVisibility,
}: UserFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-black max-w-4xl w-full my-4 sm:my-8">
        <div className="p-4 sm:p-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wide text-gray-900">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Username */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => onFormChange({ ...formData, username: e.target.value })}
                disabled={isEdit}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 text-sm sm:text-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                required
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-1.5 sm:mb-2">
                Password {!isEdit && '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border-2 border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                  required={!isEdit}
                  placeholder={isEdit ? 'Leave blank to keep current' : ''}
                />
                <button
                  type="button"
                  onClick={onTogglePasswordVisibility}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-2 sm:mb-3">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
              Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {(['orders-manager', 'inventory-manager'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onRoleChange(role)}
                  className={`p-3 sm:p-4 border-2 text-left transition-colors ${
                    formData.role === role
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black active:bg-gray-50'
                  }`}
                >
                  <h4 className="font-bold uppercase text-xs sm:text-sm mb-0.5 sm:mb-1">
                    {role === 'orders-manager' ? 'Orders Manager' : 'Inventory Manager'}
                  </h4>
                  <p className="text-[10px] sm:text-xs opacity-80">
                    {role === 'orders-manager' 
                      ? 'Manage pickup orders only'
                      : 'Manage products & inventory'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700 mb-2 sm:mb-3">
              Permissions
            </label>
            <div className="bg-gray-50 border-2 border-gray-200 p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.entries(permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => onPermissionToggle(key as keyof UserPermissions)}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-xs sm:text-sm text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white uppercase font-bold tracking-wide text-xs sm:text-sm hover:bg-gray-800 active:bg-gray-700 transition-colors"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            {isEdit ? 'Update User' : 'Create User'}
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 hover:border-black active:bg-gray-50 text-gray-900 uppercase font-bold tracking-wide text-xs sm:text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
