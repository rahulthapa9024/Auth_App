import axiosClient from "../utils/axiosClient";

interface RegisterUserData {
  firebaseToken: string;
}

interface User {
  id: number;
  firebaseUid: string | null;
  email: string;
  userName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

interface OtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user: User;
}


// GOOGLE SIGNUP
export const userRegister = async (
  data: RegisterUserData
): Promise<RegisterResponse> => {
  try {
    const response = await axiosClient.post<RegisterResponse>(
      "/auth/signup",
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// SEND OTP
export const sendOtp = async (
  email: string
): Promise<OtpResponse> => {
  try {
    const response = await axiosClient.post<OtpResponse>(
      "/auth/send-otp",
      { email }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// VERIFY OTP
export const verifyOtp = async (
  email: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  try {
    const response = await axiosClient.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      { email, otp }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};