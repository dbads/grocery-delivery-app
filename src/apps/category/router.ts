import { Router } from 'express';
import { 
  categoryService
} from '.';
import { s3 } from '../../common';
const categoryRouter = Router();

categoryRouter.get('/:categoryId', async (req, res) => {
  const response: { data?: any, error?: any } = { };
  try {
    const category = await categoryService.getCategory(req?.params?.categoryId);
    res.status(200);
    response['data'] = { category };
  } catch(error) {
    console.log(`Error in fetching category: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching category: ${error}`;
  }

  res.send(response);
});

categoryRouter.get('/', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const categories = await categoryService.getCategories();
    res.status(200);
    response['data'] = { categories };
  } catch(error) {
    console.log(`Error in fetching categories: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching categories: ${error}`;
  }
  
  res.send(response);
});


categoryRouter.post('/', s3.upload.single('picture'), async (req, res) => {
  
  const categoryData = req.body;
  
  const response: { data?: any, error?: any } = { };
  try {
    if (!req.file) throw new Error('Please upload category image.');
    const fileMimeType = req.file?.mimetype;
    if (fileMimeType && 
      !['image/png', 'image/jpeg', 'image/jpg'].includes(fileMimeType)) {
      throw new Error('Invalid file type');
    }
    req.file.filename = 
      // eslint-disable-next-line max-len
      `${process.env.NODE_ENV}/category/${s3.generateCustomFilename(req.file?.originalname)}`;
    const category = await categoryService.createCategory(categoryData, req.file);
    res.status(200);
    response['data'] = { category };
  } catch(error) {
    console.log(`Error in creating category: ${error}`);
    res.status(500);
    response['error'] = `Error in creating category: ${error}`;
  }
  
  res.send(response);
});

categoryRouter.patch('/', s3.upload.none(), async (req, res) => {
  const categoryData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const category = await categoryService.updateCategory(
      categoryData?._id,
      categoryData
    );
    res.status(200);
    response['data'] = { category };
  } catch(error) {
    console.log(`Error in updating category: ${error}`);
    res.status(500);
    response['error'] = `Error in updating category: ${error}`;
  }
  
  res.send(response);
});

categoryRouter.delete('/:categoryId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const category = await categoryService.deleteCategory(req.params.categoryId);
    res.status(200);
    response['data'] = { category };
  } catch(error) {
    console.log(`Error in deleting category: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting category: ${error}`;
  }
  
  res.send(response);
});

export default categoryRouter;