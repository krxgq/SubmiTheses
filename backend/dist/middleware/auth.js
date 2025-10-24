"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticated = authenticated;
exports.isAdmin = isAdmin;
exports.belongsToSchool = belongsToSchool;
exports.canAccessUser = canAccessUser;
exports.canAccessProject = canAccessProject;
exports.canModifyProject = canModifyProject;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
async function authenticated(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        if (!token) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, supabase_1.JWT_SECRET);
        // Extract user info from token
        const user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.user_metadata?.role || 'student',
            school_id: decoded.user_metadata?.school_id ? BigInt(decoded.user_metadata.school_id) : undefined,
            aud: decoded.aud,
            exp: decoded.exp,
            iat: decoded.iat,
            iss: decoded.iss,
            sub: decoded.sub,
            user_metadata: decoded.user_metadata
        };
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
}
async function isAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
}
// Middleware to check if user belongs to specific school
async function belongsToSchool(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const schoolId = BigInt(req.params.id || req.body.school_id);
        // Admins can access any school
        if (req.user.role === 'admin') {
            return next();
        }
        // Check if user belongs to the school
        if (!req.user.school_id || req.user.school_id !== schoolId) {
            return res.status(403).json({ error: 'Access denied to this school' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
}
// Middleware for checking if user can access their own data or is admin
function canAccessUser(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const userId = req.params.id;
        // Admin can access any user
        if (req.user.role === 'admin') {
            return next();
        }
        // Users can only access their own data
        if (req.user.id === userId) {
            return next();
        }
        return res.status(403).json({ error: 'Access denied' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
}
// Middleware for checking if user can access project (student, supervisor, opponent, or admin)
function canAccessProject(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // TODO: Implement project access logic based on user role and project ownership
        // For now, just require authentication
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
}
// Middleware for checking if user can modify project (owner or admin)
function canModifyProject(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Admin can modify any project
        if (req.user.role === 'admin') {
            return next();
        }
        // TODO: Check if user is project owner (student)
        // For now, allow all authenticated users
        next();
    }
    catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
}
