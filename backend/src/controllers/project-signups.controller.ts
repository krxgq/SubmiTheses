import { Request, Response } from 'express';
import { ProjectSignupService } from '../services/project-signups.service';

/**
 * Student signs up (expresses interest) for a project
 * POST /projects/:id/signup
 */
export async function signupForProject(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = req.user!.id;

    const result = await ProjectSignupService.signupForProject(projectId, studentId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({ message: 'Successfully signed up for project' });
  } catch (error) {
    console.error('[SignupsController] Error signing up:', error);
    return res.status(500).json({ error: 'Failed to sign up for project' });
  }
}

/**
 * Student cancels their signup for a project
 * DELETE /projects/:id/signup
 */
export async function cancelSignup(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = req.user!.id;

    const result = await ProjectSignupService.cancelSignup(projectId, studentId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ message: 'Successfully cancelled signup' });
  } catch (error) {
    console.error('[SignupsController] Error cancelling signup:', error);
    return res.status(500).json({ error: 'Failed to cancel signup' });
  }
}

/**
 * Get all students who signed up for a project (for teachers/admins)
 * GET /projects/:id/signups
 */
export async function getProjectSignups(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const signups = await ProjectSignupService.getProjectSignups(projectId);

    return res.status(200).json({
      signups,
      count: signups.length,
    });
  } catch (error) {
    console.error('[SignupsController] Error fetching signups:', error);
    return res.status(500).json({ error: 'Failed to fetch project signups' });
  }
}

/**
 * Check if the current student has signed up for a project
 * Also returns whether the student is assigned to any project
 * GET /projects/:id/signup/status
 */
export async function getSignupStatus(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = req.user!.id;

    // Check both signup status and if student has any assigned project
    const [hasSignedUp, hasProject] = await Promise.all([
      ProjectSignupService.hasStudentSignedUp(projectId, studentId),
      ProjectSignupService.studentHasProject(studentId),
    ]);

    return res.status(200).json({ signedUp: hasSignedUp, hasProject });
  } catch (error) {
    console.error('[SignupsController] Error checking signup status:', error);
    return res.status(500).json({ error: 'Failed to check signup status' });
  }
}
