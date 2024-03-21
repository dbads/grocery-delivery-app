import mongoose from 'mongoose';
import { commonSchema } from '../../common';
import { Order } from '../order';
import { PaymentMode, PaymentStatus } from './constants';

interface PaymentI extends Document {
  order: mongoose.mongo.ObjectId;
  mrp: number;
  productDiscount: number;
  itemTotal: number;
  handlingCharges: number;
  deliveryCharges: number;
  paymentMode: string;
  paymentStatus: string;
  paymentMethod: string;
  _id?: mongoose.mongo.ObjectId;
  gst?: number;
  cgst?: number;
  sgst?: number;
  billTotal: number;
  paymentFee?: number;
  paymentGateway?: string;
  taxes?: object,
  otherCharges?: object
}

const paymentSchema = new mongoose.Schema({
  ...commonSchema.commonProperties,
  order: {
    type: mongoose.mongo.ObjectId,
    requried: true,
    ref: Order
  },
  mrp: Number,
  productDiscount: {
    type: Number,
    default: 0
  },
  handlingCharges: {
    type: Number,
    default: 0
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  itemTotal: Number,
  taxes: {
    type: Object,
    default: {
      gst: 0.18,
      sgst: 0,
      cgst: 0,
      cess: 0,
    }
  },
  billTotal: {
    type: Number,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: PaymentMode
  }, // Paid Online, COD
  // paymentMode: String, // Paid Online, COD
  paymentStatus: {
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.UnPaid
  },
  paymentMethod: String, // credit card, upi
  paymentFee: {
    type: Number,
    default: 0
  }, // charges by payment gateway
  paymentGateway: String, // payment gateway name
  otherCharges: {
    type: Object 
    // to keep dynamic charges, eg. annual subscription fee charges in 
    // case of pay later
  }
}, commonSchema.commonOptions);


const Payment = mongoose.model<PaymentI>('Payment', paymentSchema);
export { Payment , paymentSchema, PaymentI };