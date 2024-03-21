import { Router } from 'express';
import { productService } from '.';
import { s3 } from '../../common';
const productRouter = Router();

productRouter.get('/:productId', async (req, res) => {
  const response: { data?: any, error?: any } = { };
  try {
    const product = await productService.getProduct(req?.params?.productId);
    res.status(200);
    response['data'] = { product };
  } catch(error) {
    console.log(`Error in fetching product: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching product: ${error}`;
  }

  res.send(response);
});

productRouter.get('/category/:categoryId', async (req, res) => {
  const response: { data?: any, error?: any } = { };
  try {
    const products = await productService.getProducts(req?.params?.categoryId);
    res.status(200);
    response['data'] = { products };
  } catch(error) {
    console.log(`Error in fetching products: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching products: ${error}`;
  }

  res.send(response);
});

productRouter.post('/', s3.upload.single('picture'), async (req, res) => {
  const productData = req.body;

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
      `${process.env.NODE_ENV}/product/${s3.generateCustomFilename(req.file?.originalname)}`;

    const product = await productService.createProduct(productData, req.file);
    res.status(200);
    response['data'] = { product };
  } catch(error) {
    console.log(`Error in creating product: ${error}`);
    res.status(500);
    response['error'] = `Error in creating product: ${error}`;
  }
  
  res.send(response);
});

productRouter.patch('/', s3.upload.none(), async (req, res) => {
  const productData = req.body;
  console.log(productData, '--data product--', req.body);

  const response: { data?: any, error?: any } = { };
  try {
    const product = await productService.updateProduct(
      productData?._id,productData
    );
    res.status(200);
    response['data'] = { product };
  } catch(error) {
    console.log(`Error in updating product: ${error}`);
    res.status(500);
    response['error'] = `Error in updating product: ${error}`;
  }
  
  res.send(response);
});

productRouter.delete('/:productId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const product = await productService.deleteProduct(req.params?.productId);
    res.status(200);
    response['data'] = { product };
  } catch(error) {
    console.log(`Error in deleting product: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting product: ${error}`;
  }
  
  res.send(response);
});

export default productRouter;