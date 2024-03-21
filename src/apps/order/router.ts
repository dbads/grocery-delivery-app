/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { 
  orderService
} from '.';
import { orderProductService } from '../OrderProduct';

const orderRouter = Router();

/**
 * Get orders for a user
 * Order History data for a user
 */
orderRouter.get('/user/:userId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const orders = await orderService.getOrdersByUser(req.params?.userId);
    res.status(200);
    response['data'] = { orders };
  } catch(error) {
    console.log(`Error in fetching orders: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching orders: ${error}`;
  }
  
  res.send(response);
});

/**
 * Get orders for a delivery agent
 */
orderRouter.get('/agent/:agentId', async (req, res) => {

  const { expectedDeliveryDate, deliverySlot } = req.query;
  const filterBy: any = {
    expectedDeliveryDate,
    deliverySlot
  };
  console.log('filterBy --', filterBy);
  const response: { data?: any, error?: any } = { };
  try {
    const orders = await orderService.getOrdersForAgent(req.params?.agentId, filterBy);
    res.status(200);
    response['data'] = { orders };
  } catch(error) {
    console.log(`Error in fetching delivery orders: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching delivery orders: ${error}`;
  }
  
  res.send(response);
});

/**
 * Get Order
 */
orderRouter.get('/:orderId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const order = await orderService.getOrder(req.params?.orderId);
    res.status(200);
    response['data'] = { order };
  } catch(error) {
    console.log(`Error in fetching order: ${error}`);
    res.status(500);
    response['error'] = `Error in fetching order: ${error}`;
  }
  
  res.send(response);
});

/**
 * Create Order
 */
orderRouter.post('/', async (req, res) => {
  
  const orderData = req.body;
  
  const response: { data?: any, error?: any } = { };
  try {
    const order = await orderService.createOrder(orderData);
    res.status(200);
    response['data'] = { order };
  } catch(error) {
    console.log(`Error in creating order: ${error}`);
    res.status(500);
    response['error'] = `Error in creating order: ${error}`;
  }
  
  res.send(response);
});

/**
 * Update Order
 */
orderRouter.patch('/', async (req, res) => {
  const orderData = req.body;

  const response: { data?: any, error?: any } = { };
  try {
    const order = await orderService.updateOrder(
      orderData?._id,
      orderData
    );
    res.status(200);
    response['data'] = { order };
  } catch(error) {
    console.log(`Error in updating order: ${error}`);
    res.status(500);
    response['error'] = `Error in updating order: ${error}`;
  }
  
  res.send(response);
});

/**
 * Delete Order
 */
orderRouter.delete('/:orderId', async (req, res) => {

  const response: { data?: any, error?: any } = { };
  try {
    const order = await orderService.deleteOrder(req.params.orderId);
    res.status(200);
    response['data'] = { order };
  } catch(error) {
    console.log(`Error in deleting order: ${error}`);
    res.status(500);
    response['error'] = `Error in deleting order: ${error}`;
  }
  
  res.send(response);
});


/**
 * Update order products for an order
 */
orderRouter.post('/update-order-products', async (req, res) => {
  const { orderId, updatedOrderProducts } = req.body;
  const response: { data?: any, error?: any } = { };
  try {
    const orderProductsUpdateResult = 
      await orderProductService.updateOrderProductsForOrder(
        orderId,
        updatedOrderProducts
      );
    res.status(200);
    response['data'] = { orderProductsUpdateResult };
  } catch(error) {
    console.log(`Error in updating order products: ${error}`);
    res.status(500);
    response['error'] = `Error in updating order products: ${error}`;
  }
  
  res.send(response);
});


export default orderRouter;