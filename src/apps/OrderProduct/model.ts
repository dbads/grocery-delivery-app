import mongoose from 'mongoose';
import { commonProperties, commonOptions } from '../../common/commonSchema';
import { Order } from '../order';
import { CommonProductI, Product } from '../product';

const orderProductSchema = new mongoose.Schema({
  ...commonProperties,
  order: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: Order
  },
  product: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: Product
  },
  name: {
    type: String,
    required: true,
  },
  images: {
    type: [String]
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  unitQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  unitType: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  unhappyWithPrice: {
    type: Boolean,
    default: false
  },
  unitAdded: {
    type: Number,
    default: 0
  }
}, commonOptions);

const OrderProduct = mongoose.model<OrderProductI>('OrderProduct', orderProductSchema);


interface OrderProductI extends CommonProductI {
    order: mongoose.mongo.ObjectId;
    product: mongoose.mongo.ObjectId;
    unitAdded: number;
    unhappyWithPrice?: boolean;
}

export { OrderProduct, OrderProductI, orderProductSchema };