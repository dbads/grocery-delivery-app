import { s3 } from "../../common";
import { stringIdToObjectId } from "../../common/dbUtils";
import { Category } from "../category/model";
import { Product, ProductI  } from "./model";

async function getProducts(categoryId: string) {
  const products = await Product.find({ categoryId, isDeleted: false });
  return products;
}

async function getProduct(productId: string) {
  const product = await Product.findOne({ _id: productId });
  return product;
}

async function createProduct(productData: ProductI, picture: any) {

  // check if the associated category is valid
  const categoryId = stringIdToObjectId(productData?.categoryId);
  const category = await Category.findById(categoryId);
  if (!category) throw new Error(`Category not found`);

  const uploadedPicture = await s3.uploadFile(picture);

  let product = new Product({
    ...productData,
    images: [uploadedPicture?.Location]
  });

  product = await product.save();
  return product;
}

async function updateProduct(productId: string, productData: ProductI) {
  // can put validations here
    
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId }, { ...productData }, { new: true });
    
  return updatedProduct;
}

async function deleteProduct(productId: string) {
  // can put validations here
    
  const product = await Product.findOneAndUpdate({ _id: productId }, { isDeleted: true });
    
  return product;
}

export { getProduct, getProducts, createProduct, updateProduct, deleteProduct };
