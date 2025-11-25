"use client";

import { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import { Input } from "@/components/ui/Input";
import { authService } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import type { AuthUser } from "@/lib/auth";

export default function SettingsPageClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFullName(currentUser.full_name || "");
      setEmail(currentUser.email);
    }
    setLoading(false);
  };

  // Update full name in public.users table
  const handleUpdateProfile = async (e: React.FormEvent) => {
    //TODO: implement profile update logic
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage(null);
  };

  // Update email via Supabase Auth
  const handleUpdateEmail = async (e: React.FormEvent) => {
    //TODO: implement email change confirmation flow
    e.preventDefault();
    setUpdatingEmail(true);
    setEmailMessage(null);
  };

  // Update password via Supabase Auth
  const handleUpdatePassword = async (e: React.FormEvent) => {
    //TODO: implement password update flow with re-authentication if needed
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">
          Please log in to access settings
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>

      {/* Profile Section */}
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={user.avatar_url} name={user.full_name} size="xl" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Profile Information
            </h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {profileMessage && (
            <div
              className={`p-3 rounded-lg border ${
                profileMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              <p className="text-sm">{profileMessage.text}</p>
            </div>
          )}

          <Button type="submit" disabled={updatingProfile}>
            {updatingProfile ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </div>

      {/* Email Section */}
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Change Email
        </h2>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <Input
            id="email"
            label="New Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {emailMessage && (
            <div
              className={`p-3 rounded-lg border ${
                emailMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              <p className="text-sm">{emailMessage.text}</p>
            </div>
          )}

          <Button type="submit" disabled={updatingEmail}>
            {updatingEmail ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-background-elevated rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Change Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            id="currentPassword"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            helperText="Optional - leave blank if you don't remember it"
          />

          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {passwordMessage && (
            <div
              className={`p-3 rounded-lg border ${
                passwordMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              <p className="text-sm">{passwordMessage.text}</p>
            </div>
          )}

          <Button type="submit" disabled={updatingPassword}>
            {updatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
