import { Router } from "express";
import * as parentService from "./parent.controller";
import * as parentValidation from "./parent.validation";  
import { validate } from "../../middleware/validation.middleware";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import { Role } from "../../common";

const router = Router();

router.use(auth);

// Add Child
router.post(
  "/",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.addChildSchema),
  parentService.addChild,
);

// Get All Children
router.get(
  "/",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getChildrenSchema),
  parentService.getAllChildren,
);

// Get Single Child
router.get(
  "/:childId",
  validate(parentValidation.getSingleChildSchema),
  parentService.getChild,
);

// Update Child
router.patch(
  "/:childId/update",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.updateChildSchema),
  parentService.updateChild,
);

// Delete Child (Soft Delete)
router.delete(
  "/:childId/delete",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getSingleChildSchema),
  parentService.deleteChild,
);

// Restore Child
router.patch(
  "/:childId/restore",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getSingleChildSchema),
  parentService.restoreChild,
);

export default router;