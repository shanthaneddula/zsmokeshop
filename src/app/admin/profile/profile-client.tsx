'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Lock, Camera, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { User as UserType } from '@/types/users';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileClient() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  
  // Personal Info State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password Change State
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/admin/auth/me');
      const data = await response.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setEmail(data.user.email || '');
        setPhone(data.user.phone || '');
        setFullName(data.user.fullName || '');
        setProfilePhoto(data.user.profilePhoto || null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setInfoMessage({ type: 'error', text: 'Photo must be less than 5MB' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInfo = async () => {
    if (!currentUser) return;
    
    setSavingInfo(true);
    setInfoMessage(null);

    try {
      let photoUrl = profilePhoto;
      
      // Upload photo if changed
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', photoFile);
        photoFormData.append('category', 'profile-photos');
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: photoFormData,
        });
        
        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload photo');
        }
        
        photoUrl = uploadData.url;
      }

      // Update user info
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          fullName,
          profilePhoto: photoUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInfoMessage({ type: 'success', text: 'Profile updated successfully' });
        setPhotoFile(null);
        fetchCurrentUser();
        setTimeout(() => setInfoMessage(null), 3000);
      } else {
        setInfoMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setInfoMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;
    
    setPasswordMessage(null);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage(null), 3000);
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-bold uppercase text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-xs sm:text-sm font-bold uppercase text-gray-900">Failed to load user data</p>
        </div>
      </div>
    );
  }

  const isMainAdmin = !('permissions' in currentUser);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-gray-900 mb-1 sm:mb-2">My Profile</h1>
        <p className="text-xs sm:text-sm text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white border-2 border-gray-900 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative flex-shrink-0">
            {profilePhoto ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-900 overflow-hidden relative">
                <Image 
                  src={profilePhoto} 
                  alt="Profile" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-900 bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide text-gray-900 truncate">{currentUser.username}</h2>
            <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
              {isMainAdmin ? 'Administrator' : currentUser.role.replace('-', ' ')}
            </p>
            {currentUser.fullName && (
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">{currentUser.fullName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-gray-900 mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex space-x-4 sm:space-x-8 min-w-max">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors relative whitespace-nowrap ${
              activeTab === 'info' 
                ? 'text-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Personal Info
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-2 sm:pb-3 px-0.5 sm:px-1 text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-wide transition-colors relative whitespace-nowrap ${
              activeTab === 'password' 
                ? 'text-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Change Password
            {activeTab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'info' && (
        <div className="bg-white border-2 border-gray-900 p-4 sm:p-6">
          {infoMessage && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 border-2 flex items-start sm:items-center gap-2 sm:gap-3 ${
              infoMessage.type === 'success' 
                ? 'border-green-600 bg-green-50' 
                : 'border-red-600 bg-red-50'
            }`}>
              {infoMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-xs sm:text-sm font-medium ${
                infoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {infoMessage.text}
              </p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-2 sm:mb-3">
                Profile Photo
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  {profilePhoto ? (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-gray-900 overflow-hidden relative">
                      <Image 
                        src={profilePhoto} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-gray-900 bg-gray-100 flex items-center justify-center">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center px-3 sm:px-4 py-2 border-2 border-gray-900 bg-white text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors cursor-pointer">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoFile && (
                    <button
                      onClick={() => {
                        setPhotoFile(null);
                        setProfilePhoto(currentUser.profilePhoto || null);
                      }}
                      className="ml-2 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
              />
            </div>

            {/* Username (Read-only) */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                value={currentUser.username}
                disabled
                className="w-full border-2 border-gray-300 bg-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Role
              </label>
              <input
                type="text"
                value={isMainAdmin ? 'Administrator' : currentUser.role.replace('-', ' ')}
                disabled
                className="w-full border-2 border-gray-300 bg-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-500 uppercase cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 sm:pt-4">
              <button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-900 bg-gray-900 text-xs sm:text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-gray-900 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingInfo ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white border-2 border-gray-900 p-4 sm:p-6">
          {passwordMessage && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 border-2 flex items-start sm:items-center gap-2 sm:gap-3 ${
              passwordMessage.type === 'success' 
                ? 'border-green-600 bg-green-50' 
                : 'border-red-600 bg-red-50'
            }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-xs sm:text-sm font-medium ${
                passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {passwordMessage.text}
              </p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-900 mb-1.5 sm:mb-2">Password Requirements:</p>
              <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>Recommended: Mix of uppercase, lowercase, numbers, and symbols</li>
              </ul>
            </div>

            {/* Change Password Button */}
            <div className="flex justify-end pt-2 sm:pt-4">
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-900 bg-gray-900 text-xs sm:text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-gray-900 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
