"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectAttachments = getProjectAttachments;
exports.getAttachmentById = getAttachmentById;
exports.uploadAttachment = uploadAttachment;
exports.downloadAttachment = downloadAttachment;
exports.deleteAttachment = deleteAttachment;
const attachments_service_1 = require("../services/attachments.service");
const upload_1 = require("../middleware/upload");
async function getProjectAttachments(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const attachments = await attachments_service_1.AttachmentService.getAttachmentsByProjectId(projectId);
        return res.status(200).json(attachments);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch attachments' });
    }
}
async function getAttachmentById(req, res) {
    try {
        const id = BigInt(req.params.attachmentId);
        const attachment = await attachments_service_1.AttachmentService.getAttachmentById(id);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        return res.status(200).json(attachment);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch attachment' });
    }
}
async function uploadAttachment(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const projectId = BigInt(req.params.id);
        const attachment = await attachments_service_1.AttachmentService.createAttachment({
            project_id: projectId,
            storage_path: req.file.path,
            filename: req.file.originalname,
            description: req.body.description,
        });
        return res.status(201).json(attachment);
    }
    catch (error) {
        // Clean up uploaded file if database operation fails
        if (req.file) {
            (0, upload_1.deleteFile)(req.file.path);
        }
        return res.status(500).json({ error: 'Failed to upload attachment' });
    }
}
async function downloadAttachment(req, res) {
    try {
        const id = BigInt(req.params.attachmentId);
        const attachment = await attachments_service_1.AttachmentService.getAttachmentById(id);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        // Send file
        return res.download(attachment.storage_path, attachment.filename);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to download attachment' });
    }
}
async function deleteAttachment(req, res) {
    try {
        const id = BigInt(req.params.attachmentId);
        const attachment = await attachments_service_1.AttachmentService.deleteAttachment(id);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }
        // Delete file from filesystem
        (0, upload_1.deleteFile)(attachment.storage_path);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete attachment' });
    }
}
