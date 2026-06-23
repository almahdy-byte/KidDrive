import { Request, Response } from "express";
import {
  sendPushNotification,
  sendBulkNotification,
} from "../services/notification.service";
import { userModel } from "../db/models/userModel/user.model";

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { token, title, body } = req.body;

    const response = await sendPushNotification(token, title, body);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendBulk = async (req: Request, res: Response) => {
  try {
    const { tokens, title, body } = req.body;

    const response = await sendBulkNotification(tokens, title, body);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveToken = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    await userModel.findByIdAndUpdate(userId, { fcmToken: token });

    res.json({ message: "Token saved successfully" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
