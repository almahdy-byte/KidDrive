import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  chatRoomId: Types.ObjectId;
  createdAt: Date;
}

export interface IChat {
  _id: Types.ObjectId;
  participants: {
    parentId: Types.ObjectId;
    driverId: Types.ObjectId;
  };
  lastMessage?: {
    senderId: Types.ObjectId;
    text: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    chatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new Schema<IChat>(
  {
    participants: {
      parentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      driverId: {
        type: Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
      },
    },
    lastMessage: {
      senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
chatSchema.index({ 'participants.parentId': 1, 'participants.driverId': 1 }, { unique: true });
messageSchema.index({ chatRoomId: 1, createdAt: -1 });

export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
export const MessageModel = models.Message || model<IMessage>("Message", messageSchema);

export type HChatDocument = HydratedDocument<IChat>;
export type HMessageDocument = HydratedDocument<IMessage>;
