import mongoose from "mongoose";
import { Payment } from ".";
import { Order } from "../order";
import { OrderProductI } from "../OrderProduct";
import { Subscription, SubscriptionI } from "../subscription";
import { PaymentOptions } from "../subscription/constants";
import { OrderType } from "../user/constants";
import { PaymentI } from "./model";
import _ from 'lodash';

async function findOne(orderId: mongoose.mongo.ObjectId) {
  return Payment.findOne({ order: orderId });
}

async function getPaymentDetails(orderId: string) {
  const paymentDetails = await Payment.findOne({ order: orderId });
  return paymentDetails;
}


async function updatePaymentDetails(
  paymentId: string,
  paymentData: Partial<PaymentI>
) {
  // can put validations here
    
  const updatedPaymentDetails = await Payment.findOneAndUpdate(
    { _id: paymentId },
    { ...paymentData }
  );

  return updatedPaymentDetails;
}

async function deletePaymentDetails(orderId: string) {
  // can put validations here
    
  const paymentDetails = await Payment.findOneAndUpdate(
    { order: orderId }, { isDeleted: true });
    
  return paymentDetails;
}

/**
 * takes order, subscription, orderProducts and creates related payment details
 * @param order 
 * @param subscription 
 * @param orderProducts 
 * @returns 
 */
async function createOrUpdatePaymentDetailsForOrder(
  orderId: mongoose.mongo.ObjectId,
  orderProducts: OrderProductI[],
  subscription?: SubscriptionI
) {

  if (subscription === null || subscription === undefined){
    const subscriptionObject = await Subscription.findOne({ order: orderId });
    if (subscriptionObject) subscription = subscriptionObject;
  } 

  // create payment details

  let paymentDetails = await Payment.findOne({ order: orderId });
  if (!paymentDetails) paymentDetails = new Payment();

  let totalMrp = 0;
  orderProducts.forEach(product => {
    totalMrp += (product.unitAdded * product.unitPrice);
  });
  console.log('total mrp', totalMrp);
  paymentDetails.order = orderId;
  
  // for now mrp, itemTotal and billTotal, all are same as there
  // is not discounts or charges
  paymentDetails.mrp = totalMrp;
  paymentDetails.itemTotal = Number(totalMrp.toFixed(2));
  
  // if this is the first or 2nd order and subscption payment was selected as pay later
  // then we need to charge the remaining subscription fee too with this order payment
  
  if (subscription?.paymentOption === PaymentOptions.PayLater) {
    // check if this is one of first two orders then add the subscription fee too
    const ordersForThisUser = 
    await Order.find({ user: subscription?.user, orderType: OrderType.Inventory });
    if (ordersForThisUser.length < 2) {
      paymentDetails.otherCharges = {
        annualSubscriptionFee: 499.5
      };
      totalMrp += 499.5; // as this will become the part of mrp
    } 
  }
  console.log('total mrp with pay later fee 499.5', totalMrp);
  
  // calculate taxes
  const gst = Number(((totalMrp * 18)/100).toFixed(2));
  paymentDetails.taxes = {
    gst
  };
  
  paymentDetails.billTotal = Number((totalMrp+gst).toFixed(2));
  console.log('total mrp + gst', Number((totalMrp+gst).toFixed(2)), gst);

  // ----- ******* create or insert payment details ****** -------
  paymentDetails = await Payment.findOneAndUpdate(
    { order: orderId },
    { ..._.omit(paymentDetails, ['_id']) },
    { upsert: true, new: true }
  );

  return paymentDetails;
}

export {
  updatePaymentDetails,
  deletePaymentDetails,
  getPaymentDetails,
  createOrUpdatePaymentDetailsForOrder,
  findOne
};
