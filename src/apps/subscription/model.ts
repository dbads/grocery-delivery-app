import mongoose, { Schema } from 'mongoose';
import { commonOptions, commonProperties } from '../../common/commonSchema';
import { User } from '../user';
import { SubscriptionFrequency, DeliverySlot, PaymentOptions } from './constants';

interface SubscriptionProductI {
  name?: string;
  unitPrice?: number;
  unitQuantity?: number;
  unitType?: string;
  brandName?: string;
  _id: mongoose.mongo.ObjectId
  unitAdded: number;
  estimatedPriceRange?: string;
}

interface SubscriptionI extends Document {
  user: mongoose.Types.ObjectId;
  agent: mongoose.Types.ObjectId;
  products: [SubscriptionProductI];
  startDate: Date;
  frequency: SubscriptionFrequency;
  deliverySlot: DeliverySlot;
  isSubscriptionPaymentDone: boolean;
  paymentOption?: PaymentOptions;
  isApproved: boolean;
  _id: mongoose.Types.ObjectId;
}


const subscriptionSchema = new mongoose.Schema({
  ...commonProperties,
  user: { // user who this subscription belongs to
    type: mongoose.mongo.ObjectId,
    ref: User,
    required: true,
    index: true,
    unique: true
  },
  agent: { // sales_agent id who onboarded this restaurant
    type: mongoose.mongo.ObjectId,
    ref: User,
  },
  products: {
    required: true,
    type: [Schema.Types.Mixed]
  },
  startDate: {
    type: Date
  },
  frequency: {
    type: String,
    required: true,
    enum: SubscriptionFrequency,
    default: SubscriptionFrequency.Weekly
  },
  deliverySlot: {
    type: String,
    required: true,
    enum: DeliverySlot,
    default: DeliverySlot['10AM-12AM']
  },
  isSubscriptionPaymentDone: {
    type: Boolean,
    default: false
  },
  paymentOption: {
    type: String,
    enum: PaymentOptions,
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, commonOptions);

const Subscription = mongoose.model<SubscriptionI>(
  'Subscription', subscriptionSchema
);

export { Subscription , subscriptionSchema, SubscriptionI, SubscriptionProductI };