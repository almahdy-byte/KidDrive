import { Router } from "express";
import { 
    getDriverApplications, 
    getDriverApplicationById, 
    approveDriverApplication, 
    rejectDriverApplication, 
    getDashboardStats,
    getAllParents
} from "./admin.controller";
import { validate } from "../../middleware/validation.middleware";
import { 
    approveApplicationValidation, 
    rejectApplicationValidation, 
    getApplicationsValidation 
} from "./admin.validation";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import { Role } from "../../common";

const router = Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(roleGuard([Role.Admin]));

// Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Get driver applications with pagination and filtering
router.get('/applications', 
    validate(getApplicationsValidation),
    getDriverApplications
);

// Get specific driver application by ID
router.get('/applications/:id', getDriverApplicationById);

// Approve driver application
router.patch('/applications/:id/approve', 
    validate(approveApplicationValidation),
    approveDriverApplication
);

// Reject driver application
router.patch('/applications/:id/reject', 
    validate(rejectApplicationValidation),
    rejectDriverApplication
);

// Get all parents with pagination and search
router.get('/parents', getAllParents);

export default router;
