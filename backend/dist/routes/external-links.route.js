"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const external_links_controller_1 = require("../controllers/external-links.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all external links for a project
router.get('/:id/links', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), external_links_controller_1.getProjectExternalLinks);
// Get a specific external link
router.get('/:id/links/:linkId', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.externalLinkIdSchema), external_links_controller_1.getExternalLinkById);
// Create a new external link
router.post('/:id/links', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.createExternalLinkSchema), external_links_controller_1.createExternalLink);
// Update an external link
router.put('/:id/links/:linkId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.updateExternalLinkSchema), external_links_controller_1.updateExternalLink);
// Delete an external link
router.delete('/:id/links/:linkId', auth_1.authenticated, auth_1.canModifyProject, (0, validate_1.validate)(schemas_1.externalLinkIdSchema), external_links_controller_1.deleteExternalLink);
exports.default = router;
