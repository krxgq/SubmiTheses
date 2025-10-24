"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const attachments_controller_1 = require("../controllers/attachments.controller");
const upload_1 = require("../middleware/upload");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all attachments for a project
router.get('/:id/attachments', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), attachments_controller_1.getProjectAttachments);
// Get a specific attachment metadata
router.get('/:id/attachments/:attachmentId', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.attachmentIdSchema), attachments_controller_1.getAttachmentById);
// Upload a new attachment
router.post('/:id/attachments', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.projectIdSchema), upload_1.upload.single('file'), attachments_controller_1.uploadAttachment);
// Download an attachment
router.get('/:id/attachments/:attachmentId/download', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.attachmentIdSchema), attachments_controller_1.downloadAttachment);
// Delete an attachment
router.delete('/:id/attachments/:attachmentId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.attachmentIdSchema), attachments_controller_1.deleteAttachment);
exports.default = router;
