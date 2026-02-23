'use client';

import { useState, useEffect } from 'react';
import { Heart, HeartOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectsApi } from '@/lib/api/projects';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import type { ProjectWithRelations } from '@sumbi/shared-types';

interface SignUpButtonProps {
  project: ProjectWithRelations;
  onSignupChange?: (signedUp: boolean) => void;
  studentHasProject?: boolean; // If provided, use this; otherwise fetch from API
}

/**
 * Button for students to sign up (express interest) for a project
 * Hidden if: project has student assigned, user is not a student, project is not in draft, or student already has a project
 */
export default function SignUpButton({ project, onSignupChange, studentHasProject }: SignUpButtonProps) {
  const t = useTranslations('projectDetail.actions.signups');
  const { user } = useAuth();

  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExistingProject, setHasExistingProject] = useState(studentHasProject ?? false);

  const isStudent = user?.role === 'student';
  const hasStudent = !!project.student_id;
  const isDraft = project.status === 'draft';

  // Check signup status and whether student has a project on mount
  useEffect(() => {
    if (!isStudent || hasStudent || !isDraft) {
      setIsLoading(false);
      return;
    }

    // If studentHasProject prop was provided, use it
    if (studentHasProject !== undefined) {
      if (studentHasProject) {
        setIsLoading(false);
        return;
      }
    }

    const checkStatus = async () => {
      try {
        // getSignupStatus returns both signup status and whether student has a project
        const { signedUp, hasProject } = await projectsApi.getSignupStatus(String(project.id));
        setIsSignedUp(signedUp);
        if (hasProject !== undefined) {
          setHasExistingProject(hasProject);
        }
      } catch (error) {
        console.error('[SignUpButton] Error checking status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [project.id, isStudent, hasStudent, isDraft, studentHasProject]);

  // Don't show button if not a student, project has student, not in draft, or student already has a project
  if (!isStudent || hasStudent || !isDraft || hasExistingProject) {
    return null;
  }

  const handleSignup = async () => {
    setIsProcessing(true);
    try {
      await projectsApi.signupForProject(String(project.id));
      setIsSignedUp(true);
      toast.success(t('signupSuccess'));
      onSignupChange?.(true);
    } catch (error: any) {
      toast.error(error.message || t('signupFailed'));
      console.error('[SignUpButton] Signup error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await projectsApi.cancelSignup(String(project.id));
      setIsSignedUp(false);
      toast.success(t('signupCancelled'));
      onSignupChange?.(false);
    } catch (error: any) {
      toast.error(error.message || t('cancelFailed'));
      console.error('[SignUpButton] Cancel error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary bg-interactive-secondary rounded-lg opacity-50"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{t('loading')}</span>
      </button>
    );
  }

  if (isSignedUp) {
    return (
      <button
        onClick={handleCancel}
        disabled={isProcessing}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-warning bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <HeartOff className="w-5 h-5" />
        )}
        <span>{isProcessing ? t('cancelling') : t('cancelSignup')}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSignup}
      disabled={isProcessing}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart className="w-5 h-5" />
      )}
      <span>{isProcessing ? t('signingUp') : t('signUp')}</span>
    </button>
  );
}
