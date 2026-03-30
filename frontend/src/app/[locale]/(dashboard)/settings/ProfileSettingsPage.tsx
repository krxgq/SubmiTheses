"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { formatUserName } from "@/lib/formatters";
import type { AuthUser } from "@/lib/auth";

export default function SettingsPageClient() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // "Set password" form for Microsoft-only users
  const [setPasswordNew, setSetPasswordNew] = useState("");
  const [setPasswordConfirm, setSetPasswordConfirm] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [newPwdMessage, setNewPwdMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  // Show banner based on OAuth redirect query params (?linked=true or ?error=link_failed)
  const [linkMessage, setLinkMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadUser();

    // Detect OAuth redirect results from query params
    if (searchParams.get("linked") === "true") {
      setLinkMessage({ type: "success", text: "Microsoft account linked successfully!" });
    } else if (searchParams.get("error") === "link_failed") {
      setLinkMessage({ type: "error", text: "Failed to link Microsoft account. Please try again." });
    }
  }, [searchParams]);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
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

  // Update email (requires backend implementation)
  const handleUpdateEmail = async (e: React.FormEvent) => {
    //TODO: implement email change confirmation flow with backend API
    e.preventDefault();
    setUpdatingEmail(true);
    setEmailMessage(null);
  };

  // Update password (requires backend implementation)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    //TODO: implement password update flow with backend API
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordMessage(null);
  };

  // Set initial password for Microsoft-only users
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingPassword(true);
    setNewPwdMessage(null);

    if (setPasswordNew !== setPasswordConfirm) {
      setNewPwdMessage({ type: "error", text: "Passwords do not match." });
      setSettingPassword(false);
      return;
    }

    const result = await authService.setPassword(setPasswordNew, setPasswordConfirm);
    if (result.error) {
      setNewPwdMessage({ type: "error", text: result.error });
    } else {
      setNewPwdMessage({ type: "success", text: "Password set successfully! You can now log in with email and password." });
      setSetPasswordNew("");
      setSetPasswordConfirm("");
      // Refresh user data to reflect updated auth_provider
      await loadUser();
    }
    setSettingPassword(false);
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

      {/* OAuth link redirect banner */}
      {linkMessage && (
        <div
          className={`p-3 rounded-lg border mb-6 ${
            linkMessage.type === "success"
              ? "bg-background-tertiary border-success text-success"
              : "bg-background-tertiary border-danger text-danger"
          }`}
        >
          <p className="text-sm">{linkMessage.text}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={user.avatar_url} name={formatUserName(user.first_name, user.last_name)} size="xl" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Profile Information
            </h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              id="lastName"
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {profileMessage && (
            <div
              className={`p-3 rounded-lg border ${
                profileMessage.type === "success"
                  ? "bg-background-tertiary border-success text-success"
                  : "bg-background-tertiary border-danger text-danger"
              }`}
            >
              <p className="text-sm">{profileMessage.text}</p>
            </div>
          )}

          <Button type="submit" variant="secondary" loading={updatingProfile}>
            Update Profile
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
                  ? "bg-background-tertiary border-success text-success"
                  : "bg-background-tertiary border-danger text-danger"
              }`}
            >
              <p className="text-sm">{emailMessage.text}</p>
            </div>
          )}

          <Button type="submit" variant="secondary" loading={updatingEmail}>
            Update Email
          </Button>
        </form>
      </div>

      {/* Microsoft Account Linking — for local-only users */}
      {user.auth_provider === 'local' && (
        <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Connect Microsoft Account
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Link your Microsoft school account to enable single sign-on alongside your password.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = authService.getMicrosoftLinkUrl();
            }}
            className="flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-lg font-medium text-text-primary hover:bg-background-hover transition-colors"
          >
            {/* Microsoft 4-tile logo */}
            <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Connect Microsoft Account
          </button>
        </div>
      )}

      {/* Microsoft linked indicator — for 'both' users */}
      {user.auth_provider === 'both' && (
        <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Microsoft Account
          </h2>
          <p className="text-sm text-success">
            Your Microsoft account is linked. You can sign in with either method.
          </p>
        </div>
      )}

      {/* Set Password form — for Microsoft-only users */}
      {user.auth_provider === 'microsoft' && (
        <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Set Password
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Create a local password so you can also log in with email and password.
          </p>

          <form onSubmit={handleSetPassword} className="space-y-4">
            {/* TODO(human): Implement the password input fields for the Set Password form */}

            {newPwdMessage && (
              <div
                className={`p-3 rounded-lg border ${
                  newPwdMessage.type === "success"
                    ? "bg-background-tertiary border-success text-success"
                    : "bg-background-tertiary border-danger text-danger"
                }`}
              >
                <p className="text-sm">{newPwdMessage.text}</p>
              </div>
            )}

            <Button type="submit" variant="secondary" loading={settingPassword}>
              Set Password
            </Button>
          </form>
        </div>
      )}

      {/* Change Password Section — for users who already have a local password */}
      {(user.auth_provider === 'local' || user.auth_provider === 'both') && (
        <div className="bg-background-elevated rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Change Password
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* TODO(human-existing): Implement password change fields — pending from earlier */}

            {passwordMessage && (
              <div
                className={`p-3 rounded-lg border ${
                  passwordMessage.type === "success"
                    ? "bg-background-tertiary border-success text-success"
                    : "bg-background-tertiary border-danger text-danger"
                }`}
              >
                <p className="text-sm">{passwordMessage.text}</p>
              </div>
            )}

            <Button type="submit" variant="secondary" loading={updatingPassword}>
              Update Password
            </Button>
          </form>
        </div>
      )}

    </div>
  );
}
