import { Model, Types } from "mongoose";
import {
  ChatModel,
  MessageModel,
  IChat,
  IMessage,
  IChat as TChatDocument,
  IMessage as TMessageDocument,
} from "./chat.model";
import { DBServices } from "../../db.service";

export class ChatRepo extends DBServices<TChatDocument> {
  constructor(protected override readonly model: Model<TChatDocument>) {
    super(model);
  }

  async createChatRoom(parentId: string, driverId: string): Promise<IChat | null> {
    // Check if chat room already exists
    const existingChat = await this.model.findOne({
      'participants.parentId': parentId,
      'participants.driverId': driverId,
    });

    if (existingChat) {
      return existingChat;
    }

    return await ChatModel.create({
      participants: {
        parentId,
        driverId,
      },
    });
  }

  async findChatRoom(parentId: string, driverId: string): Promise<IChat | null> {
    return await this.model.findOne({
      'participants.parentId': parentId,
      'participants.driverId': driverId,
    }).populate('participants.parentId participants.driverId');
  }

  async findUserChatRooms(userId: string, userRole: 'parent' | 'driver'): Promise<IChat[]> {
    const matchField = userRole === 'parent' ? 'participants.parentId' : 'participants.driverId';
    
    return await this.model.find({ [matchField]: userId })
      .populate('participants.parentId participants.driverId')
      .sort({ updatedAt: -1 });
  }

  async saveMessage(chatRoomId: string, senderId: string, text: string): Promise<IMessage | null> {
    const message = await MessageModel.create({
      chatRoomId,
      senderId,
      text,
    });

    // Update last message in chat room
    await this.model.findByIdAndUpdate(chatRoomId, {
      lastMessage: {
        senderId,
        text,
        createdAt: new Date(),
      },
    });

    return message;
  }

  async getChatMessages(chatRoomId: string, page: number = 1, limit: number = 50): Promise<IMessage[]> {
    const skip = (page - 1) * limit;
    
    return await MessageModel.find({ chatRoomId } as any)
      .populate('senderId', 'userName firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async findChatRoomById(chatRoomId: string): Promise<IChat | null> {
    return await this.model.findById(chatRoomId)
      .populate('participants.parentId participants.driverId');
  }
}

export class MessageRepo extends DBServices<TMessageDocument> {
  constructor(protected override readonly model: Model<TMessageDocument>) {
    super(model);
  }
}

export const chatRepo = new ChatRepo(ChatModel);
export const messageRepo = new MessageRepo(MessageModel);
