import { postMethod } from "../common";
import { authbaseUrl } from "../url";

export async function handleSendOtp(email) {
  let obj = {
    email: email,
  };

  const statusCode = await postMethod(authbaseUrl, "user/login", obj);
  return statusCode;
}

export async function handleVerifyOtp(email, otp) {
  let obj = {
    email: email,
    otp: otp,
  };
  console.log("obj", obj);
  const statusCode = await postMethod(authbaseUrl, "user/verify", obj);
  return statusCode;
}
