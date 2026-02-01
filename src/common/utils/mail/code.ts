export const code = (): string => {
     // Generate 6-digit OTP
     const digits = '0123456789';
     let OTP = '';
     for (let i = 0; i < 6; i++) {
         OTP += digits[Math.floor(Math.random() * digits.length)];
     }
     return OTP;
} 

