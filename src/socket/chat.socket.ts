import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verify } from "jsonwebtoken";
import { chatRepo } from "../db/models/chatModel/chat.repo";
import { Types } from "mongoose";
import { Role } from "../common";
import { MessageModel, IMessage, HMessageDocument } from '../db/models/chatModel/chat.model';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: Role;
}

export const initializeChatSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next: (err?: any) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded: any = verify(token, process.env.JWT_SECRET!);
      socket.userId = decoded._id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join chat rooms when user connects
    socket.on("join_chat_rooms", async () => {
      try {
        const chatRooms = await chatRepo.findUserChatRooms(
          socket.userId!,
          socket.userRole as 'parent' | 'driver'
        );

        chatRooms.forEach((room) => {
          const roomId = room._id.toString();
          socket.join(`chat_${roomId}`);
          console.log(`User ${socket.userId} joined chat room ${roomId}`);
        });

        socket.emit("chat_rooms_joined", {
          rooms: chatRooms.map((room) => ({
            id: room._id,
            participant: socket.userRole === Role.Parent 
              ? room.participants.driverId 
              : room.participants.parentId,
          })),
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to join chat rooms" });
      }
    });

    // Join a specific chat room
    socket.on("join_chat_room", async (chatRoomId: string) => {
      try {
        if (!Types.ObjectId.isValid(chatRoomId)) {
          socket.emit("error", { message: "Invalid chat room ID" });
          return;
        }

        const chatRoom = await chatRepo.findChatRoomById(chatRoomId);
        if (!chatRoom) {
          socket.emit("error", { message: "Chat room not found" });
          return;
        }

        // Verify user is participant
        const userId = socket.userId!;
        const userRole = socket.userRole!;
        const isParticipant =
          (userRole === Role.Parent && chatRoom.participants.parentId.toString() === userId) ||
          (userRole === Role.Driver && chatRoom.participants.driverId.toString() === userId);

        if (!isParticipant) {
          socket.emit("error", { message: "Access denied to chat room" });
          return;
        }

        socket.join(`chat_${chatRoomId}`);
        socket.emit("joined_chat_room", { chatRoomId });
        console.log(`User ${socket.userId} joined chat room ${chatRoomId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    // Send message
    socket.on("send_message", async (data: { chatRoomId: string; text: string }) => {
      try {
        const { chatRoomId, text } = data;

        if (!chatRoomId || !text) {
          socket.emit("error", { message: "Chat room ID and message text are required" });
          return;
        }

        // Verify user is participant
        const chatRoom = await chatRepo.findChatRoomById(chatRoomId);
        if (!chatRoom) {
          socket.emit("error", { message: "Chat room not found" });
          return;
        }

        const userId = socket.userId!;
        const userRole = socket.userRole!;
        const isParticipant =
          (userRole === Role.Parent && chatRoom.participants.parentId.toString() === userId) ||
          (userRole === Role.Driver && chatRoom.participants.driverId.toString() === userId);

        if (!isParticipant) {
          socket.emit("error", { message: "Access denied to chat room" });
          return;
        }

        // Save message to database
        const message = await chatRepo.saveMessage(chatRoomId, userId, text);

        if (message) {
          // Get populated message
          const populatedMessage = await MessageModel.findById(message._id)
            .populate('senderId', 'userName firstName lastName email')
            .exec() as HMessageDocument | null;

          // Emit to all participants in the chat room
          io.to(`chat_${chatRoomId}`).emit("new_message", {
            _id: populatedMessage?._id,
            senderId: populatedMessage?.senderId,
            text: populatedMessage?.text,
            chatRoomId: populatedMessage?.chatRoomId,
            createdAt: populatedMessage?.createdAt,
          });

          // Update last message in chat room for all participants
          const parentId = chatRoom.participants.parentId.toString();
          const driverId = chatRoom.participants.driverId.toString();

          io.to(`user_${parentId}`).emit("chat_room_updated", {
            chatRoomId,
            lastMessage: {
              senderId: userId,
              text,
              createdAt: new Date(),
            },
          });

          io.to(`user_${driverId}`).emit("chat_room_updated", {
            chatRoomId,
            lastMessage: {
              senderId: userId,
              text,
              createdAt: new Date(),
            },
          });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Leave chat room
    socket.on("leave_chat_room", (chatRoomId: string) => {
      socket.leave(`chat_${chatRoomId}`);
      socket.emit("left_chat_room", { chatRoomId });
      console.log(`User ${socket.userId} left chat room ${chatRoomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};
