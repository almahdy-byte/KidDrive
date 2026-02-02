import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export interface TokenPayload {
    id: string;
    isVerified?: boolean;
}

export const signToken = (
    payload: TokenPayload,
    options?: SignOptions
): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
        ...options,
    });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
