import multer from "multer";
import path from "path";
import fs from "fs";

// Base storage directory
const storageBaseDir = path.join(__dirname, "../../../storage");
if (!fs.existsSync(storageBaseDir)) {
  fs.mkdirSync(storageBaseDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get project ID from route params (/api/projects/:id/attachments)
    const projectId = req.params.id;

    if (!projectId) {
      return cb(new Error('Project ID is required for file upload'), '');
    }

    // Create project-specific directory: storage/projects/{projectId}/
    const projectDir = path.join(storageBaseDir, 'projects', projectId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    cb(null, projectDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter to validate file types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Allow common document and image types
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Helper function to delete a single file
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Helper function to delete entire project directory and all its files
export const deleteProjectFiles = (projectId: string | number): boolean => {
  try {
    const projectDir = path.join(storageBaseDir, 'projects', String(projectId));

    if (fs.existsSync(projectDir)) {
      // Remove directory and all contents recursively
      fs.rmSync(projectDir, { recursive: true, force: true });
      console.log(`Deleted project directory: ${projectDir}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting project directory for project ${projectId}:`, error);
    return false;
  }
};
