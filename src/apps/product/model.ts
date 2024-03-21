import mongoose from 'mongoose';
import { commonProperties, commonOptions } from '../../common/commonSchema';

const productSchema = new mongoose.Schema({
  ...commonProperties,
  categoryId: {
    type: String,
    // required: true
  },
  name: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  images: {
    type: [String]
  },
  unitPrice: {
    type: Number,
    // required: true,
  },
  unitQuantity: {
    type: Number,
    // required: true,
    default: 1
  },
  unitType: {
    type: String,
    // required: true,
  },
  brandName: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
  },
  taxes: {
    type: Object,
    default: {
      gst: 0.18,
      sgst: 0,
      cgst: 0,
      cess: 0,
    }
  }
}, commonOptions);

const Product = mongoose.model<ProductI>('Product', productSchema);


interface CommonProductI {
  name: string;
  images: string[];
  unitPrice: number;
  unitQuantity: number;
  unitType: string;
  brandName: string;
  _id?: mongoose.mongo.ObjectId
}

interface ProductI extends CommonProductI {
  categoryId: string;
}

export { Product, ProductI, productSchema, CommonProductI };