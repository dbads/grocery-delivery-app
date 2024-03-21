// Not being used currently

import { Router } from 'express';
import { 
  orderProductService
} from '.';

const orderProductRouter = Router();

orderProductRouter.get('/:orderProductId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const orderProduct =
        await orderProductService.getOrderProduct(req.params?.orderProductId);
    res.status(200);
    response['data'] = { orderProduct };
  } catch(error) {
    console.log(`Error in fetching orderProduct: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching orderProduct: ${error}`;
  }
  
  res.send(response);
});

orderProductRouter.patch('/', async (req, res) => {
  const orderProductData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const orderProduct = await orderProductService.updateOrderProduct(
      orderProductData?._id,
      orderProductData
    );
    res.status(200);
    response['data'] = { orderProduct };
  } catch(error) {
    console.log(`Error in updating orderProduct: ${error}`);
    res.status(500);
    response['error'] = `Error in updating orderProduct: ${error}`;
  }
  
  res.send(response);
});


export default orderProductRouter;