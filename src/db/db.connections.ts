import { connect } from "mongoose";
import { AppError } from "../common";
import { StatusCodes } from "http-status-codes";



let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log("Using cached database connection");
        return;
    }

    try {
        const db = await connect(process.env.DB_URI as string);
        isConnected = !!db.connections[0]?.readyState;
        console.log("Database connected");
    } catch (err: any) {
        console.error("Database connection error:", err.message);
        throw new AppError("Database connection failed: " + err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

