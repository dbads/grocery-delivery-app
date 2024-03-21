// import { Product, ProductI } from "../product";
import { constants, smsService } from "../../common";
import { orderService } from "../order";
import { Product, ProductI } from "../product";
import { Profile } from "../profile";
import { ProfileI } from "../profile/model";
import { User } from "../user";
import { Subscription, SubscriptionI, SubscriptionProductI  } from ".";
import mongoose from "mongoose";
import { sendSubscriptionCreatedEmail } from "./utils";

async function findOne(id: string) {
  return Subscription.findOne({ _id: id });
}

async function getSubscription(userId: string) {
  const subscription = await Subscription.findOne({ user: userId });
  
  if(!subscription) return null;
  const subscriptionProductIds = subscription?.products?.map(
    (product) => product?._id
  );
  
  const subscriptionProducts = await Product.find(
    { _id: { $in: subscriptionProductIds } }
  );

  // // productId to details map
  const productIdToDetailsMap: Record<string, ProductI> = {};
  subscriptionProducts?.forEach(
    (product) => productIdToDetailsMap[product._id.toString()] = product.toObject()
  );
  
  // // preparing products details
  const customProducts = subscription.products.map(
    (product) => {
      if (
        product && 
        product._id &&
        productIdToDetailsMap[product._id.toString()]
      ) return {
        unitAdded: product.unitAdded,
        estimatedPriceRange: product.estimatedPriceRange,
        ...productIdToDetailsMap[product._id.toString()]
      };
    }
  ).filter(Boolean);
  
  // get next delivery date
  let nextDeliveryDate;
  if (subscription)
    nextDeliveryDate = await getNextDeliveryDate(subscription);

  const activeOrder = await orderService.getActiveOrder(subscription.user.toString());
  const subscriptionOrder = 
    await orderService.getSubscriptionOrder(subscription.user.toString());

  // overriding subscription products with all details
  const subscriptionResponse = { 
    ...subscription?.toObject(),
    products: customProducts,
    nextDeliveryDate,
    activeOrderId:
      subscription.isSubscriptionPaymentDone 
        ? activeOrder?._id 
        : subscriptionOrder?._id
  };

  return subscriptionResponse;
}


async function createSubscription(subscriptionData: SubscriptionI) {
  
  // create a new product for products added in other category

  let isApproved = true;
  for (let i=0; i<subscriptionData.products.length; ++i) {
    const product = subscriptionData.products[i];
    // if not a valid object id, then its a manually added product
    if (product._id.toString().length < 24) { 
      isApproved = false; // will be used to mark subscription isApproved false
      // its a manually added product, create a product and save 
      // its reference in subscriptions
      product._id = new mongoose.Types.ObjectId();
      let newProduct = new Product({
        ...product,
        name: `${product.name}_${i}` 
      });

      console.log('saving product --');
      newProduct = await newProduct.save();
      
      subscriptionData.products[i] = <SubscriptionProductI>{
        _id: newProduct._id,
        unitAdded: product.unitAdded,
        estimatedPriceRange: product.estimatedPriceRange
      };
    }
  }

  // mark subscription unverified if any other products are added
  
  let subscription = new Subscription({
    ...subscriptionData,
    isApproved
  });
    
  subscription = await subscription.save();

  // create sms and email to restaurants about successful inventory/subscription creation
  const restaurantProfile = await Profile.findOne({ user: subscription?.user });
  if (!restaurantProfile)
    throw new Error(`Restaurant doesn't exist for user ${subscription?.user}`);

  const messageBody = `
    Your Inventory is created successfully.\
    You can use your registered number ${restaurantProfile?.phoneNumber} to login\
    to Dhoomak and subscribe to get the invenotry on time.`;

  await smsService.sendSms(restaurantProfile?.phoneNumber, messageBody);

  // send email
  console.log('sending email');
  const receiveEmail = restaurantProfile.email;
  const emailSubject = 'Your Inventory is created!';
  const emailHtml = `
  Your Inventory is created successfully. <br>
  You can use your registered number ${restaurantProfile?.phoneNumber} to login <br>
  to Dhoomak and subscribe to get the invenotry on time.`;
  await sendSubscriptionCreatedEmail(receiveEmail, emailSubject, emailHtml);

  // create an order for subscription payment
  try {
    // create order for payment of subscription fee
    await orderService.createSubscriptionOrder(subscription);
  } catch (error) {
    console.log(`
      Error in creating subscription order for subscription: ${subscription._id}, 
      ${error}`
    );
    throw new Error(`
      Error in creating subscription order for subscription: ${subscription._id}, 
      ${error}`
    );
  }

  return subscription;
}

async function updateSubscription(
  subscriptionData: Partial<SubscriptionI>
) {
  // can put validations here
  
  const updatedSubscription = await Subscription.findOneAndUpdate(
    { user: subscriptionData?.user },
    { ...subscriptionData },
    { new: true }
  );

  // create sms and email to restaurants about successful onboarding
  const restaurantProfile = await Profile.findOne({ user: updatedSubscription?.user });
  if (!restaurantProfile)
    throw new Error(`Restaurant doesn't exist for user ${updatedSubscription?.user}`);

  if (updatedSubscription?.isSubscriptionPaymentDone) {
    const messageBody = `
      Your Dhoomak onboaridng is successful.\
      You can use your registered number ${restaurantProfile?.phoneNumber} to login\
      to Dhoomak and manage your inventory`;
      
    await smsService.sendSms(restaurantProfile?.phoneNumber, messageBody);

    // send email
    console.log('sending email');
    const receiveEmail = restaurantProfile.email;
    const emailSubject = 'Your Onboarding is successful!';
    const emailHtml = `
      Your Dhoomak onboaridng is successful. <br>
      You can use your registered number ${restaurantProfile?.phoneNumber} to login <br>
      to Dhoomak and manage your inventory`;
    await sendSubscriptionCreatedEmail(receiveEmail, emailSubject, emailHtml);
  }

  // create first order for this subscription
  try {
    if (updatedSubscription?.isSubscriptionPaymentDone) {
      // create first order only if subscription is being approved
      await orderService.createOrder(updatedSubscription);
    }
  } catch (error) {
    console.log(`Error in creating order for subscrription: ${error}`
    );
    throw new Error(`
      Error in creating order for subscrription: ${error}`
    );
  }

  // TODO: if products are updated then need to 
  // update the active order if payment is not done for that order

  return updatedSubscription;
}

async function deleteSubscription(userId: string) {
  // can put validations here
    
  await Subscription.findOneAndDelete({ user: userId });
    
  return { message: "Subscription deleted successfully" };
}

// Function to calculate the next delivery date
async function getNextDeliveryDate(subscription: SubscriptionI) {
  const activeOrder = await orderService.getActiveOrder(subscription.user.toString());
  
  if (!activeOrder) return subscription.startDate;
  const lastDeliveryDate = activeOrder.expectedDeliveryDate;

  let frequency = 7;
  switch(subscription.frequency) {
  case "WEEKLY":
    frequency = 7;
    break;
  case "FORTNIGHT":
    frequency = 15;
    break;
  case "MONTHLY":
    frequency = 30;
    break;
  }
   
  // we have to get next delivery date given last expectedDeliveryDate
  // expected delivery date is the interval date which is weekly, fortnight or monthly
  // Calculate the date after n days which will be next delivery date
  const nextDeliveryDate =
    new Date(lastDeliveryDate.getTime() + (frequency * 24 * 60 * 60 * 1000));

  return nextDeliveryDate;
  // Return the next delivery date in YYYY-MM-DD format
}


async function getSubscriptionData(userId: string) {
  const userSubscription = await getSubscription(userId);

  return {
    isSubscriptionCreated: userSubscription ? true : false,
    isSubscriptionPaymentDone: userSubscription?.isSubscriptionPaymentDone,
    subscription: userSubscription
  };
}

async function getOnboardingsByAgent(agentId: string) {

  // if agent is an admin then send all the onboardings
  const agent = await User.findOne({ _id: agentId }).lean();

  if (!agent) throw new Error(`[Error] agent not found`);

  let subscriptionFilter = {};
  if (agent.userType !== constants.UserType.Admin) {
    subscriptionFilter = { agent: agentId };
  }

  const subscriptionsByAgent = 
    await Subscription.find(subscriptionFilter).sort({ createdAt: -1 }).lean();
  const relatedProfileIds = subscriptionsByAgent.map(sub => sub.user);
  const relatedProfiles = await Profile.find({ user: { $in: relatedProfileIds } }).lean();

  const userIdToProfile: Record<string,ProfileI> = {};
  relatedProfiles.forEach(profile => userIdToProfile[profile.user.toString()] = profile);
  const customizedSubscriptions = subscriptionsByAgent.map(
    sub => ({
      ...sub,
      profile: userIdToProfile[sub.user.toString()]
    })
  );

  return customizedSubscriptions;
}

async function getOnboarding(subscriptionId: string) {
  const subscription = await Subscription.findOne({ _id: subscriptionId }).lean();
  const relatedProfile = await Profile.findOne({ user: subscription?.user }).lean();

  const customizedSubscription = {
    ...subscription,
    profile: relatedProfile
  };

  return customizedSubscription;
}

export { 
  findOne,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionData,
  getOnboarding,
  getOnboardingsByAgent,
  getNextDeliveryDate
};
