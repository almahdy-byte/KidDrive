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
  validate(parentValidation.addChildSchema.body),
  parentService.addChild,
);

// Get All Children
router.get(
  "/",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getChildrenSchema.params),
  parentService.getAllChildren,
);

// Get Single Child
router.get(
  "/:childId",
  validate(parentValidation.getSingleChildSchema.params),
  parentService.getChild,
);

// Update Child
router.patch(
  "/:childId/update",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.updateChildSchema.body),
  parentService.updateChild,
);

// Delete Child (Soft Delete)
router.delete(
  "/:childId/delete",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getSingleChildSchema.params),
  parentService.deleteChild,
);

// Restore Child
router.patch(
  "/:childId/restore",
  roleGuard([Role.Parent , Role.Admin]),
  validate(parentValidation.getSingleChildSchema.params),
  parentService.restoreChild,
);

export default router;