import fs from 'fs';
import { Category, CategoryI, categorySchema  } from ".";
import { uploadFile } from "../../common/s3";

async function getCategory(categoryId: string) {
  const category = await Category.findOne({ _id: categoryId });
  return category;
}

async function getCategories() {
  const categories = await Category.find({ isDeleted: false });
  return categories;
}

async function createCategory(
  categoryData: Partial<CategoryI>, 
  picture:  any
) {

  const uploadedPicture = await uploadFile(picture);

  let category = new Category({
    ...categoryData,
    images: [uploadedPicture?.Location]
  });
    
  category = await category.save();

  return category;
}

async function updateCategory(
  categoryId: string,
  categoryData: Partial<typeof categorySchema>
) {
  // can put validations here
    
  const updatedProfile = await Category.findOneAndUpdate(
    { _id: categoryId },
    { ...categoryData, random: 'random' }
  );

  return updatedProfile;
}

async function deleteCategory(categoryId: string) {
  // can put validations here
    
  const category = await Category.findOneAndUpdate(
    { _id: categoryId }, { isDeleted: true });
    
  return category;
}

export { getCategory, getCategories, createCategory, updateCategory, deleteCategory };
