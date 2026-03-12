import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError, IRequest, Role } from "../../common";
import { chatRepo } from "../../db/models/chatModel/chat.repo";
import { Types } from "mongoose";

export const createOrGetChatRoom = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { driverId } = req.body;
    const parentId = req.user?._id;

    if (!parentId) {
      return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
    }

    if (req.user?.role !== Role.Parent) {
      return next(new AppError("Only parents can initiate chat rooms", StatusCodes.FORBIDDEN));
    }

    if (!driverId) {
      return next(new AppError("Driver ID is required", StatusCodes.BAD_REQUEST));
    }

    const chatRoom = await chatRepo.createChatRoom(parentId.toString(), driverId);

    return res.status(StatusCodes.OK).json({
      message: "Chat room created/retrieved successfully",
      success: true,
      data: chatRoom,
    });
  }
);

export const getUserChatRooms = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
    }

    const userRole = req.user?.role === Role.Parent ? 'parent' : 'driver';
    
    if (!['parent', 'driver'].includes(userRole)) {
      return next(new AppError("Invalid user role for chat", StatusCodes.FORBIDDEN));
    }

    const chatRooms = await chatRepo.findUserChatRooms(userId.toString(), userRole);

    return res.status(StatusCodes.OK).json({
      message: "Chat rooms retrieved successfully",
      success: true,
      data: chatRooms,
    });
  }
);

export const getChatMessages = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { chatRoomId } = req.params;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '50');

    if (!Types.ObjectId.isValid(chatRoomId as string)) {
      return next(new AppError("Invalid chat room ID", StatusCodes.BAD_REQUEST));
    }

    // Verify user is participant in the chat room
    const chatRoom = await chatRepo.findChatRoomById(chatRoomId as string);
    if (!chatRoom) {
      return next(new AppError("Chat room not found", StatusCodes.NOT_FOUND));
    }

    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    const isParticipant = 
      (userRole === Role.Parent && chatRoom.participants.parentId.toString() === userId) ||
      (userRole === Role.Driver && chatRoom.participants.driverId.toString() === userId);

    if (!isParticipant) {
      return next(new AppError("Access denied to this chat room", StatusCodes.FORBIDDEN));
    }

    const messages = await chatRepo.getChatMessages(chatRoomId as string, page, limit);

    return res.status(StatusCodes.OK).json({
      message: "Messages retrieved successfully",
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
      },
    });
  }
);

export const sendMessage = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { chatRoomId, text } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
    }

    if (!chatRoomId || !text) {
      return next(new AppError("Chat room ID and message text are required", StatusCodes.BAD_REQUEST));
    }

    // Verify user is participant in the chat room
    const chatRoom = await chatRepo.findChatRoomById(chatRoomId);
    if (!chatRoom) {
      return next(new AppError("Chat room not found", StatusCodes.NOT_FOUND));
    }

    const userId = senderId.toString();
    const userRole = req.user?.role;

    const isParticipant = 
      (userRole === Role.Parent && chatRoom.participants.parentId.toString() === userId) ||
      (userRole === Role.Driver && chatRoom.participants.driverId.toString() === userId);

    if (!isParticipant) {
      return next(new AppError("Access denied to this chat room", StatusCodes.FORBIDDEN));
    }

    const message = await chatRepo.saveMessage(chatRoomId, userId, text);

    return res.status(StatusCodes.CREATED).json({
      message: "Message sent successfully",
      success: true,
      data: message,
    });
  }
);
