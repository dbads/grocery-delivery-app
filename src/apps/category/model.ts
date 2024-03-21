import mongoose from 'mongoose';
import { commonProperties } from '../../common/commonSchema';

interface CategoryI {
  name: string;
  images: [string];
}

const categorySchema = new mongoose.Schema({
  ...commonProperties,
  name: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  images: {
    type: [String]
  },
});

const Category = mongoose.model<CategoryI>('Category', categorySchema);
export { Category , categorySchema, CategoryI };