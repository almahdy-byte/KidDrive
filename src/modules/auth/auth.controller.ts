import { asyncErrorHandler, compare, hash, signToken } from "../../common";
import { NextFunction, Request, Response } from "express";
import { userRepo } from "../../db";
import bcrypt from "bcrypt";
import { AppError } from "../../common/error";
import { successResponse } from "../../common/utils";
import { StatusCodes } from "http-status-codes";
import { sendEmail, generateOTP, template } from "../../common/utils/mail";





export const register = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
        } = req.body;


        if (role !== "parent") {
            return next(new AppError("Invalid register", StatusCodes.BAD_REQUEST));
        }


        const exist = await userRepo.findByEmail({ email });
        if (exist) throw new AppError("Email already exists", StatusCodes.BAD_REQUEST);


        const hashedPassword = await hash(password);

        const otpExpires = new Date(Date.now() + 90 * 1000);

        const code = generateOTP()
        const otp = {
            code: await hash(code),
            expiresAt: otpExpires,
        }
        const userData: any = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            phone,
            otp,
            isVerified: false,
        };

        const html = template(
            code,
            email,
            userData?.firstName,

        )

        await sendEmail({
            to: email,
            subject: "Verify your email",
            text: `Your OTP is ${code}`,
            html,
        });
        const user = await userRepo.create(userData);


        try {
            await sendEmail({
                to: email,
                subject: "Verify your email",
                text: `Your OTP is ${otp}`,
                html: `<h1>Your OTP is ${otp}</h1>`,
            });
        } catch (err) {
            console.error("Failed to send OTP email:", err);
            return next(new AppError("Failed to send OTP email", StatusCodes.INTERNAL_SERVER_ERROR));
        }
        const token = signToken(
            { id: user._id.toString(),isVerified: user.isVerified },
            { expiresIn: "10m" }
        );

        successResponse({
            res,
            message: "Registered successfully. Please check your email for OTP.",
            data: { userId: user._id, email: user.email, token },
            statusCode: StatusCodes.CREATED,
        });
    }
);


export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, code } = req.body;


        const user = await userRepo.findByEmail({ email });
        if (!user) return next(new AppError("User not found", StatusCodes.BAD_REQUEST));

        if (user.isVerified) return res.status(400).json({ message: "Already verified" });
        const isCodeValid = await compare(code, user.otp?.code || "");
        if (!isCodeValid || !user.otp?.expiresAt || user.otp?.expiresAt < new Date() || user.otp?.code === "") {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
