import { Router } from "express";
import {
  sendNotification,
  sendBulk,
  saveToken,
} from "../controllers/notification.controller";

const router = Router();

router.post("/send", sendNotification);
router.post("/send-bulk", sendBulk);
router.post("/save-token", saveToken);

export default router;
