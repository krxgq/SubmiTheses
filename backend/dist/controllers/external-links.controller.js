"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectExternalLinks = getProjectExternalLinks;
exports.getExternalLinkById = getExternalLinkById;
exports.createExternalLink = createExternalLink;
exports.updateExternalLink = updateExternalLink;
exports.deleteExternalLink = deleteExternalLink;
const external_links_service_1 = require("../services/external-links.service");
async function getProjectExternalLinks(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const links = await external_links_service_1.ExternalLinkService.getExternalLinksByProjectId(projectId);
        return res.status(200).json(links);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch external links' });
    }
}
async function getExternalLinkById(req, res) {
    try {
        const id = BigInt(req.params.linkId);
        const link = await external_links_service_1.ExternalLinkService.getExternalLinkById(id);
        if (!link) {
            return res.status(404).json({ error: 'External link not found' });
        }
        return res.status(200).json(link);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch external link' });
    }
}
async function createExternalLink(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const link = await external_links_service_1.ExternalLinkService.createExternalLink({
            project_id: projectId,
            url: req.body.url,
            title: req.body.title,
            description: req.body.description,
        });
        return res.status(201).json(link);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create external link' });
    }
}
async function updateExternalLink(req, res) {
    try {
        const id = BigInt(req.params.linkId);
        const link = await external_links_service_1.ExternalLinkService.updateExternalLink(id, {
            url: req.body.url,
            title: req.body.title,
            description: req.body.description,
        });
        if (!link) {
            return res.status(404).json({ error: 'External link not found' });
        }
        return res.status(200).json(link);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update external link' });
    }
}
async function deleteExternalLink(req, res) {
    try {
        const id = BigInt(req.params.linkId);
        const deleted = await external_links_service_1.ExternalLinkService.deleteExternalLink(id);
        if (!deleted) {
            return res.status(404).json({ error: 'External link not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete external link' });
    }
}
