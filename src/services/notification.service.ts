import admin from "../config/firebase";
import { userModel } from "../db/models/userModel/user.model";
import { DriverModel } from "../db/models/driverModel/driver.model";

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string
) => {
  return await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
  });
};

export const sendBulkNotification = async (
  tokens: string[],
  title: string,
  body: string
) => {
  return await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
  });
};

const statusLabels: Record<string, string> = {
  trip_started: "Trip Started",
  child_boarded: "Child Boarded",
  child_dropped_off: "Child Dropped Off",
  trip_finished: "Trip Finished",
  idle: "Trip Scheduled",
  "accepted subscription": "Subscription Accepted",
  "rejected subscription": "Subscription Rejected",
  canceled: "Subscription Canceled",
  "waiting for confirmation": "Subscription Pending",
};

export const sendTripStatusNotification = async (
  driverId: any,
  parentId: any,
  status: string,
  tripType?: string
) => {
  const label = statusLabels[status] || status;
  const parentToken = parentId?.fcmToken;
  const driverToken = driverId?.fcmToken;

  const title = `${label}`;
  const body = `Your ${tripType || "trip"} status: ${label}`;

  const notifications: Promise<any>[] = [];

  if (parentToken) {
    notifications.push(
      sendPushNotification(parentToken, title, `Your child's ${body.toLowerCase()}`)
    );
  }
  if (driverToken) {
    notifications.push(
      sendPushNotification(driverToken, title, body)
    );
  }

  return Promise.allSettled(notifications);
};

export const sendSubscriptionNotification = async (
  subscription: any,
  status: string
) => {
  const label = statusLabels[status] || status;
  const driverToken = subscription.driverId?.fcmToken;

  let parentUser = subscription.parentId;
  if (!parentUser?.fcmToken && parentUser?._id) {
    parentUser = await userModel.findById(parentUser._id).select("fcmToken").lean();
  }
  const parentToken = parentUser?.fcmToken;

  const notifications: Promise<any>[] = [];

  if (status === "waiting for confirmation" && driverToken) {
    notifications.push(
      sendPushNotification(driverToken, "New Subscription Request", "You have a new subscription request")
    );
  }

  if ((status === "accepted subscription" || status === "rejected subscription" || status === "canceled") && parentToken) {
    notifications.push(
      sendPushNotification(parentToken, label, `Your subscription has been ${status}`)
    );
  }

  return Promise.allSettled(notifications);
};
