import mongoose from 'mongoose';
import { commonSchema } from '../../common';
import { OrderType } from '../user/constants';
import { Subscription } from '../subscription';
import { User } from '../user';
import { OrderStatus } from './constants';
import { DeliverySlot } from '../subscription/constants';


interface OrderI extends Document {
  isDeleted: boolean;
  user: mongoose.Types.ObjectId;
  subscription: mongoose.Types.ObjectId;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  deliveryAgent?: mongoose.Types.ObjectId;
  deliveryPin?: string;
  orderType: string;
  deliveryAddress: object;
  orderId: string;
  deliverySlot: DeliverySlot;
  status: OrderStatus;
  itemCount: number;
  billTotal: number;
  _id: mongoose.Types.ObjectId;
}

const orderSchema = new mongoose.Schema({
  ...commonSchema.commonProperties,
  orderId: String,
  user: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: User
  },
  orderType: {
    type: String,
    enum: OrderType
  },
  subscription: {
    type: mongoose.mongo.ObjectId,
    required: true,
    ref: Subscription
  },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryAgent: {
    type: mongoose.mongo.ObjectId,
    ref: User
  },
  deliveryPin: String,
  deliveryAddress: {
    type: Object
  },
  status: {
    type: String,
    enum: OrderStatus,
    default: OrderStatus.Created
  },
  deliverySlot: {
    type: String,
    enum: DeliverySlot
  },
  // added as needed in history so can get directly in order rather than calculating
  itemCount: {
    type: Number,
    default: 0
  }, // number of items in the order
  billTotal: {
    type: Number,
    default: 0
  } // total payable bill amount
}, commonSchema.commonOptions);


const Order = mongoose.model<OrderI>('Order', orderSchema);
export { Order , orderSchema, OrderI };