import { Router } from "express";
import { auth, roleGuard } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { Role } from "../../common";
import * as chatController from "./chat.controller";
import * as chatValidation from "./chat.validation";

const router = Router();

// All chat routes require authentication
router.use(auth);

// Create or get chat room (Parent only)
router.post(
  "/room",
  roleGuard([Role.Parent]),
  validate(chatValidation.createChatRoomSchema),
  chatController.createOrGetChatRoom,
);

// Get user's chat rooms (Parent and Driver)
router.get(
  "/rooms",
  roleGuard([Role.Parent, Role.Driver]),
  chatController.getUserChatRooms,
);

// Get chat messages (Parent and Driver)
router.get(
  "/rooms/:chatRoomId/messages",
  roleGuard([Role.Parent, Role.Driver]),
  validate(chatValidation.getMessagesSchema),
  chatController.getChatMessages,
);

// Send message (Parent and Driver)
router.post(
  "/message",
  roleGuard([Role.Parent, Role.Driver]),
  validate(chatValidation.sendMessageSchema),
  chatController.sendMessage,
);

export default router;
