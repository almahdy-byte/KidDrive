import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { userModel } from './src/db/models/userModel/user.model';
import { VehicleModel } from './src/db/models/vehicleModel/vehicle.model';
import { TripModel } from './src/db/models/tripModel/trip.model';
import { DriverModel } from './src/db/models/driverModel/driver.model';
import { ChildModel } from './src/db/models/childModel/child.model';
import { SubscriptionModel } from './src/db/models/subscriptionModel/subscription.model';
import { ChatModel, MessageModel } from './src/db/models/chatModel/chat.model';
import { hash } from './src/common';

interface TestData {
  admins?: any[];
  parents: any[];
  drivers: any[];
  vehicles: any[];
  children: any[];
  subscriptions: any[];
  trips: any[];
  chats: any[];
  messages: any[];
}

async function seedDatabase() {
  try {
    const dataPath = path.join(__dirname, 'test-data.json');
    const testData: TestData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/kiddrive';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await userModel.deleteMany({});
    await VehicleModel.deleteMany({});
    await TripModel.deleteMany({});
    await DriverModel.deleteMany({});
    await ChildModel.deleteMany({});
    await SubscriptionModel.deleteMany({});
    await ChatModel.deleteMany({});
    await MessageModel.deleteMany({});
    console.log('Cleared existing data');

    // Create Admins
    if (testData.admins) {
      for (const admin of testData.admins) {
        const adminData = {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          password: hash(admin.password),
          phone: admin.phone,
          fullName: `${admin.firstName} ${admin.lastName}`,
          isVerified: admin.isVerified,
          role: admin.role || 'admin',
        };
        await userModel.create(adminData);
        console.log(`Created admin: ${admin.email}`);
      }
    }

    // Create Parents
    const userMap = new Map<string, any>();
    for (const user of testData.parents) {
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hash(user.password),
        phone: user.phone,
        fullName: `${user.firstName} ${user.lastName}`,
        isVerified: user.isVerified,
        role: 'parent',
        location: user.location,
      };
      const createdUser = await userModel.create(userData);
      userMap.set(user.email, createdUser);
      console.log(`Created parent: ${user.email}`);
    }

    // Create Drivers
    const driverMap = new Map<string, any>();
    for (const driver of testData.drivers) {
      const driverData = {
        userName: driver.userName,
        email: driver.email,
        password: hash(driver.password),
        phone: driver.phone,
        nationalId: driver.nationalId,
        isApproved: driver.isApproved,
        role: 'driver',
        location: driver.location,
        rating: driver.rating,
      };
      const createdDriver = await DriverModel.create(driverData);
      driverMap.set(driver.email, createdDriver);
      console.log(`Created driver: ${driver.email}`);
    }

    // Create Vehicles
    const vehicleMap = new Map<string, any>();
    for (const vehicle of testData.vehicles) {
      const driver = driverMap.get(vehicle.driver);
      if (driver) {
        const vehicleData = {
          driver: driver._id,
          carModel: vehicle.carModel,
          plateNumber: vehicle.plateNumber,
          carColor: vehicle.carColor,
          isApproved: vehicle.isApproved,
          status: vehicle.isApproved ? 'approved' : 'pending',
          location: vehicle.location,
        };
        const createdVehicle = await VehicleModel.create(vehicleData);
        vehicleMap.set(vehicle.plateNumber, createdVehicle);
        console.log(`Created vehicle: ${vehicle.plateNumber}`);
      }
    }

    // Create Children
    const childMap = new Map<string, any>();
    for (const child of testData.children) {
      const parent = userMap.get(child.parentEmail);
      if (parent) {
        const childData = {
          name: child.name,
          age: child.age,
          gender: child.gender,
          parentId: parent._id,
        };
        const createdChild = await ChildModel.create(childData);
        childMap.set(child.name, createdChild);
        console.log(`Created child: ${child.name}`);
      }
    }

    // Create Subscriptions
    for (const sub of testData.subscriptions) {
      const parent = userMap.get(sub.parentEmail);
      const driver = driverMap.get(sub.driverEmail);
      const child = childMap.get(sub.childName);
      if (parent && driver && child) {
        const subData = {
          parentId: parent._id,
          driverId: driver._id,
          childId: child._id,
          expiryDate: new Date(sub.expiryDate),
          status: sub.status,
          subscriptionType: sub.subscriptionType,
        };
        await SubscriptionModel.create(subData);
        console.log(`Created subscription: ${sub.parentEmail} -> ${sub.driverEmail}`);
      }
    }

    // Create Trips
    for (const trip of testData.trips) {
      const parent = userMap.get(trip.parentEmail);
      const driver = driverMap.get(trip.driverEmail);
      const child = childMap.get(trip.childName);
      if (parent && driver && child) {
        const subscription = await SubscriptionModel.findOne({
          parentId: parent._id,
          driverId: driver._id,
          childId: child._id,
        });
        if (subscription) {
          const tripData = {
            parentId: parent._id,
            driverId: driver._id,
            childId: child._id,
            subscriptionId: subscription._id,
            origin: trip.origin,
            destination: trip.destination,
            status: trip.status,
            startTime: trip.startTime ? new Date(trip.startTime) : undefined,
            endTime: trip.endTime ? new Date(trip.endTime) : undefined,
          };
          await TripModel.create(tripData);
          console.log(`Created trip: ${trip.parentEmail} -> ${trip.driverEmail}`);
        }
      }
    }

    // Create Chats
    const chatMap = new Map<number, any>();
    for (let i = 0; i < testData.chats.length; i++) {
      const chat = testData.chats[i];
      const parent = userMap.get(chat.parentEmail);
      const driver = driverMap.get(chat.driverEmail);
      if (parent && driver) {
        let lastMessageSender = null;
        if (chat.lastMessage?.senderEmail) {
          lastMessageSender = userMap.get(chat.lastMessage.senderEmail)?._id || driverMap.get(chat.lastMessage.senderEmail)?._id;
        }
        const chatData = {
          participants: {
            parentId: parent._id,
            driverId: driver._id,
          },
          lastMessage: chat.lastMessage ? {
            senderId: lastMessageSender,
            text: chat.lastMessage.text,
            createdAt: new Date(),
          } : undefined,
        };
        const createdChat = await ChatModel.create(chatData);
        chatMap.set(i, createdChat);
        console.log(`Created chat: ${chat.parentEmail} <-> ${chat.driverEmail}`);
      }
    }

    // Create Messages
    for (const msg of testData.messages) {
      const chat = chatMap.get(msg.chatIndex);
      const sender = userMap.get(msg.senderEmail) || driverMap.get(msg.senderEmail);
      if (chat && sender) {
        const messageData = {
          chatRoomId: chat._id,
          senderId: sender._id,
          text: msg.text,
        };
        await MessageModel.create(messageData);
        console.log(`Created message in chat ${msg.chatIndex}: ${msg.text.substring(0, 30)}...`);
      }
    }

    // Print Summary
    console.log('\n=== Seed Summary ===');
    console.log(`Parents: ${await userModel.countDocuments()}`);
    console.log(`Drivers: ${await DriverModel.countDocuments()}`);
    console.log(`Vehicles: ${await VehicleModel.countDocuments()}`);
    console.log(`Children: ${await ChildModel.countDocuments()}`);
    console.log(`Subscriptions: ${await SubscriptionModel.countDocuments()}`);
    console.log(`Trips: ${await TripModel.countDocuments()}`);
    console.log(`Chats: ${await ChatModel.countDocuments()}`);
    console.log(`Messages: ${await MessageModel.countDocuments()}`);

    console.log('\nDatabase seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
