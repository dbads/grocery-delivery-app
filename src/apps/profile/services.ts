import { s3 } from "../../common";
import { UserType } from "../user/constants";
import { redisClient } from "../../common/redis";
import { Order } from "../order";
import { OrderProduct } from "../OrderProduct";
import { Payment } from "../Payment";
import { Subscription } from "../subscription";
import { AccountI, User, UserI, userService } from "../user";
import { Profile, ProfileI  } from "./model";
import { generateRestaurantId } from "./utils";
import { sendSms } from "../../common/sms";


async function getProfile(userId: string) {
  const profile = await Profile.findOne({ user: userId });
  return profile;
}

async function createProfile(
  userId: string,
  profileData: ProfileI
) {
  let profile = new Profile({
    ...profileData,
    user: userId,
    restaurantId: generateRestaurantId()
  });

  profile = await profile.save();
  return profile;
}

async function updateProfile(
  userId: string,
  profileData: ProfileI
) {
  // can put validations here

  const updatedProfile = await Profile.findOneAndUpdate(
    { user: userId },
    { ...profileData },
    { new: true }
  );
    
  return updatedProfile;
}

async function deleteProfile(userId: string) {
  // can put validations here
    
  await Profile.findOneAndDelete({ user: userId });

  return { message: "Profile successfuly deleted" };
}

async function createUser(
  userData: Partial<UserI>) {
  let user = new User({
    ...userData
  });

  user = await user.save();
  return user;
}


/**
 * This creates both user and profile, called in sales_agent onboarding follow
 * when agent created the account for a restaurant
 * @param accountData 
 * @returns Profile
 */
async function creatAccount(
  accountData: AccountI,
  picture: any
) {
  const user = await createUser({
    phoneNumber: accountData?.phoneNumber,
    email: accountData?.email,
    userType: UserType.Restaurant
  });

  const uploadedPicture = await s3.uploadFile(picture);

  try {
    accountData.address = JSON.parse(accountData.address);    
  } catch (error) {
    console.log(`Invalid address: ${accountData.address}`);
  }
  let userProfile = new Profile({ 
    ...accountData,
    user,
    restaurantId: generateRestaurantId(),
    images: [uploadedPicture?.Location]

  });
  userProfile = await userProfile.save();

  return userProfile;
}

async function deleteAccount(userId: string) {
  const relatedOrder = await Order.findOne({ user: userId });

  if (relatedOrder) {
    // delete related order products
    await OrderProduct.findOneAndDelete({ order: relatedOrder._id });
  
    // delete related payments
    await Payment.findOneAndDelete({ order: relatedOrder._id });
    
    // delete order
    await Order.findOneAndDelete({ _id: relatedOrder._id });
  }

  // delete related subscription
  await Subscription.findOneAndDelete({ user: userId });
  // delete related profile
  await Profile.findOneAndDelete({ user: userId });
  // delete related user
  await User.findOneAndDelete({ _id: userId });

  return {
    message: "Account successfully deleted"
  };
}

async function verifyAccountOtp(
  profileId: string,
  phoneNumber: string,
  otpEntered: string) {

  const profile = await Profile.findOne({ _id: profileId });
  if (!profile) throw new Error("Profile not found");

  // fetch otp stored for this phone number if any
  const otpStored = await redisClient.get(phoneNumber);
    
  // compare otp entered by the phone number with stored otp
  // if otp didn't match throw error
  if (otpStored !== otpEntered) {
    throw new Error("Otp doesn't match");
  }

  if (profile?.phoneNumber !== phoneNumber) {
    // update phone number in user and profile collection for this user
    profile.phoneNumber = phoneNumber;
    await profile?.save();

    const relatedUser = await User.findOne({ _id: profile.user });
    if (relatedUser) {
      relatedUser.phoneNumber = phoneNumber;
      await relatedUser.save();
    } else {
      throw new Error(`User not found`);
    }
  }

  const responseData = { 
    data: {
      message: "OTP verification successful"
    }
  };

  return responseData;
}


/**
 * Invite a new user - SALES_AGENT, DELIVERVERY_AGENT, FINANCE_HEAD, INVENTORY_MANAGER etc
 * @param phoneNumber 
 * @param userType 
 * @param role 
 * @returns 
 */
async function inviteAgent(
  phoneNumber: string,
  userType: UserType
) {
  const user = await userService.findOneByPhoneNumber(phoneNumber);
  if (user) throw new Error(`User already invited, ${phoneNumber}`);

  let newUser = new User();
  newUser.phoneNumber = phoneNumber;
  newUser.userType = UserType.Operations;

  newUser = await newUser.save();


  // create user profile if not already created
  const userProfile = new Profile();
  userProfile.type = userType;
  userProfile.phoneNumber = phoneNumber;
  userProfile.user = newUser._id;

  await userProfile.save();

  // send onboarding sms
  const messageBody = `Hi!, You have been invited as a ${userType} at Dhoomak. \
  You can use your phone: ${phoneNumber} to login to Dhoomak`;

  await sendSms(phoneNumber, messageBody);

  return {
    user: newUser,
    profile: userProfile
  };
}

export { 
  getProfile, 
  createProfile,
  updateProfile,
  deleteProfile,
  creatAccount,
  verifyAccountOtp,
  deleteAccount,
  inviteAgent
};
