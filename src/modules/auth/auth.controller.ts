import { asyncErrorHandler, compare, createAccessToken, createForgetPasswordToken, createToken, decodedToken, hash,  TokenType, verifyForgetPasswordToken } from "../../common";
import { NextFunction, Request, Response } from "express";
import { userRepo } from "../../db";
import { AppError } from "../../common/error";
import { Payload } from "../../common/utils";
import { StatusCodes } from "http-status-codes";
import { sendEmail, generateOTP, template } from "../../common/utils/mail";
import { verify } from "crypto";





export const register = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            location,
        } = req.body;
        

        if (role && role !== "parent") {
            return next(new AppError("Invalid register", StatusCodes.BAD_REQUEST));
        }

        const exist = await userRepo.findByEmail({ email });

        if (exist){
            return next(new AppError("Email already exists", StatusCodes.BAD_REQUEST));
        }


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

        // Add location only if provided
        if (location && (location.city || location.department)) {
            userData.location = {
                city: location.city,
                department: location.department,
            };
        }

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
     

        return res.status(StatusCodes.CREATED).json({
            message: "Registered successfully. Please check your email for OTP.",
            success: true,
            status:'success',
            data: { userId: user._id, email: user.email },
        })
    }
);

export const forgetPassword = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        const user = await userRepo.findByEmail({ email });
        if (!user) {
            return next(new AppError("User not found", StatusCodes.BAD_REQUEST));
        }
        const code = generateOTP();
        user.otp = {
            code: await hash(code),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        };
        await user.save();
        await sendEmail({
            to: user.email,
            subject: "Reset Password",
            text: `Your reset code is ${code}. It expires in 10 minutes.`,
            html: template(code, user.firstName, "Reset Password"),
        });
        return res.status(StatusCodes.OK).json({
            message: "Reset password OTP sent successfully",
            success: true,
            status: "success",
            data: { email: user.email },
        });
    }
);

export const verifyResetPasswordOTP = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, code } = req.body;
        const user = await userRepo.findByEmail({ email });
        if (!user) {
            return next(new AppError("User not found", StatusCodes.BAD_REQUEST));
        }
        const isCodeValid = await compare(code, user.otp?.code || "");
        if (!isCodeValid || !user.otp?.expiresAt || user.otp?.expiresAt < new Date() || user.otp?.code === "") {
            return next(new AppError("Invalid or expired OTP", StatusCodes.BAD_REQUEST));
        }
        user.otp = undefined;
        await user.save();
        const token = await createForgetPasswordToken({
            _id: user._id,
            changeCredentialTime: user.changeCredentialTime.getTime().toString(),
            role: user.role || "parent",
        });
        return res.status(StatusCodes.OK).json({
            message: "OTP verified successfully",
            success: true,
            status: "success",
            data: { token },
        });
    }
);

export const resetPassword = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new AppError("Token is required", StatusCodes.UNAUTHORIZED));
        }
        const decoded: Payload = await verifyForgetPasswordToken(token);
        if (!decoded) {
            return next(new AppError("Invalid token", StatusCodes.UNAUTHORIZED));
        }
        const user = await userRepo.findOne({
            filter: { _id: decoded._id },
        });
        if (!user) {
            return next(new AppError("User not found", StatusCodes.NOT_FOUND));
        }

        if (decoded.changeCredentialTime.toString() !== user.changeCredentialTime.getTime().toString()) {
            return next(new AppError("Token expired", StatusCodes.UNAUTHORIZED));
        }

        user.password = await hash(password);
        user.changeCredentialTime = new Date();
        await user.save();
        return res.status(StatusCodes.OK).json({
            message: "Password reset successfully",
            success: true,
            status: "success",
        });
    }
);

export const verifyOTP =asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;


        const user = await userRepo.findByEmail({ email });
        if (!user){
            return next(new AppError("User not found", StatusCodes.BAD_REQUEST));
        }

        if (user.isVerified) {
            return next(new AppError("User already verified", StatusCodes.BAD_REQUEST));
        }
        const isCodeValid = await compare(otp, user.otp?.code || "");
        if (!isCodeValid || !user.otp?.expiresAt || user.otp?.expiresAt < new Date() || user.otp?.code === "") {
            return next(new AppError("Invalid or expired OTP", StatusCodes.BAD_REQUEST));
        }

        user.isVerified = true;
        user.otp = undefined;

        
        const [tokens , updatedUser] = await Promise.all([
            createToken({
                _id:user._id,
                changeCredentialTime : user.changeCredentialTime.getTime().toString(),
                role:user.role || "parent"
            }),
            user.save()
        ])
        return res.status(StatusCodes.OK).json({
            message: "User verified successfully",
            success: true,
            status:'success',
            data: { 
                tokens,
                isVerified: updatedUser.isVerified,

             },
        })
})


export const login = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        const user = await userRepo.findByEmail({ email });
        if (!user){
            return next(new AppError("invalid email or password", StatusCodes.UNAUTHORIZED));
        }

        if (!user.isVerified){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User not verified",
                success: false,
                status:'failed',
                data:{
                    isVerified: user.isVerified,
                }
            })
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid){
            return next(new AppError("invalid email or password", StatusCodes.UNAUTHORIZED));
        }

        const tokens = await createToken({_id:user._id, changeCredentialTime : user.changeCredentialTime.getTime().toString(), role:user.role || "parent"});

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            success: true,
            status:'success',
            data: { 
                tokens,
                isVerified: user.isVerified,

             },
        })
    }
);


export const refreshToken = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new AppError("Refresh token is required", StatusCodes.UNAUTHORIZED));
        }
        const decoded:Payload = await decodedToken(refreshToken, TokenType.Refresh, next);
        if(!decoded){
            return next(new AppError("Refresh token is invalid", StatusCodes.UNAUTHORIZED));
        }
const user = await userRepo.findOne({
  filter: { _id: decoded._id }
});

        if (!user) {
            return next(new AppError("User not found", StatusCodes.UNAUTHORIZED));
        }

        if(!user.isVerified){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User not verified",
                success: false,
                status:'failed',
                data:{
                    isVerified: user.isVerified,
                }
            })
        
        }

        const token = await createAccessToken({_id:user._id, changeCredentialTime : user.changeCredentialTime.getTime().toString(), role:user.role || "parent"});
        return res.status(StatusCodes.OK).json({
            message: "Refresh token successful",
            success: true,
            status:'success',
            data: { 
                token,
                isVerified: user.isVerified,

             },
        })
    }
);

//send ver phone otp 

export const resetOtp = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        const user = await userRepo.findByEmail({ email });
        if (!user){
            return next(new AppError("User not found", StatusCodes.BAD_REQUEST));
        }
        if (user.isVerified) {
            return next(new AppError("User already verified", StatusCodes.BAD_REQUEST));
        }
        const code = generateOTP();
        user.otp = {
            code: await hash(code),
            expiresAt: new Date(Date.now() +  60 * 1000),
        };
        await user.save();
        await sendEmail({
            to: user.email,
            subject: "OTP Code",
            text: `Your OTP code is ${code}. It expires in 10 minutes.`,
            html:template(code , user.firstName , 'Resned OTP Code'),
        });
        return res.status(StatusCodes.OK).json({
            message: "OTP sent successfully",
            success: true,
            status:'success',
            data: { 
                email: user.email,
             },
        })
    }
);
