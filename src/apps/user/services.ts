import { User } from './model';
const { AUTH_TOKEN_KEY } = process.env;
import jwt from 'jsonwebtoken';
import { redisClient } from '../../common/redis';
import { subscriptionService } from '../subscription';
import { smsService } from '../../common/';
import { orderService } from '../order';

async function findOneByUserId(userId: string) {
  return User.findOne({ _id: userId });
}

async function findOneByPhoneNumber(phoneNumber: string) {
  return User.findOne({ phoneNumber });
}

function generateOtp(phoneNumber: string, otpLength: number) {
  // Declare a digits variable
  // which stores all digits
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otpLength; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
}

// async function blockSelfOnboarding(phoneNumber: string) {

//   const existingUser = await User.findOne({ phoneNumber });
//   if (!existingUser) throw new Error(`
//     You are not registered with us. Please contact our team for onboarding.
//   `);
// }


async function sendOtp(phoneNumber: string) {
  // block self onboarding
  // await blockSelfOnboarding(phoneNumber);
  // validate phone number

  // create otp
  const otp = process.env.INTERNAL_PHONE_NUMBERS?.includes(phoneNumber) 
    ? '3333' 
    : generateOtp(phoneNumber, 4);

  // set otp in redis
  await redisClient.set(phoneNumber, otp, { EX: 5*60 }); // expiry in seconds
  
  // send otp in production environment
  const messageBody = `
    Your Dhoomak account verification OTP is ${otp}. This OTP is valid for 5 minutes.`;
  await smsService.sendSms(phoneNumber, messageBody);
}

async function verifyOtp(phoneNumber: string, otpEntered: string) {
    
  // fetch otp stored for this phone number if any
  const otpStored = await redisClient.get(phoneNumber);
    
  // compare otp entered by the phone number with stored otp
  // if otp didn't match throw error
  if (otpStored !== otpEntered) {
    throw new Error("Otp doesn't match");
  }

  // if matched, then create user if not exists already with this phone no 
  const existingUser = await User.findOne({ phoneNumber });
  if (!existingUser) throw new Error(`User does not exist: ${phoneNumber}`);

  // create auth token for this phone number and send the user detail 
  // with the auth token in response
  const jwtOptions = {
    expiresIn: '7d',  // Expire token in 7 days
  };

  const accessToken = jwt.sign({ phoneNumber }, AUTH_TOKEN_KEY!, jwtOptions);

  // get initial data
  const initialData = {
    subscriptionData: 
    await subscriptionService.getSubscriptionData(existingUser._id.toString()),
    activeOrder: await orderService.getActiveOrder(existingUser._id.toString()),
    subscriptionOrder: await orderService.getSubscriptionOrder(
      existingUser._id.toString()
    )
  };

  const responseData = { data: {
    accessToken,
    user: existingUser,
    initialData
  } };

  return responseData;
}

export {
  sendOtp,
  verifyOtp,
  generateOtp,
  findOneByUserId,
  findOneByPhoneNumber
};