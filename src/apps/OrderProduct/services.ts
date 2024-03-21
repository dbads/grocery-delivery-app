import { omit } from 'lodash';
import { OrderI, orderService } from '../order';
import { paymentService } from '../Payment';
import { Product } from "../product";
import { SubscriptionI, SubscriptionProductI } from '../subscription';
import { OrderProductI, OrderProduct  } from "./model";

async function find(orderId: string) {
  return await OrderProduct.find({ order: orderId });
}

async function getOrderProduct(orderProductId: string) {
  const orderProduct = await OrderProduct.findOne({ _id: orderProductId });
  return orderProduct;
}

async function createOrderProducts(orderProducts: OrderProductI[]) {

  const products = [];
  for (let i=0; i< orderProducts.length; ++i) {
    // check if the associated product Id is valid
    const orderProduct = orderProducts[i];
    const product = await Product.findOne({ _id: orderProduct.product });
    if (!product) throw new Error(`Product not found`);

    products.push(orderProduct);
  }

  orderProducts = await OrderProduct.insertMany(orderProducts);

  return orderProducts;
}

/**
 * Takes an order, subscription and crates order products for this order and subscription
 * @param order 
 * @param subscription 
 * @returns 
 */
async function createOrderProductsForOrder(
  order: OrderI,
  subscription: SubscriptionI
) {
  // create related products
  // these will be same as stored in user subscription
  const subscriptionProductIds =
    subscription.products.map(product => product._id).filter(Boolean);

  const originalProducts =
   await Product.find({ _id: { $in: subscriptionProductIds } }).lean();

  const productIdToSubsriptionDetails:Record<string, SubscriptionProductI> = {};
  subscription.products.forEach(
    (p) => { 
      if (p._id) productIdToSubsriptionDetails[p._id?.toString()] = p;
    }
  );

  // update unitAdded to x = unitAdded/frequency, 
  // if x is < 1 then send 1 unit only until all units are consumed
  let orderProducts: OrderProductI[] = [];
  originalProducts.forEach((product) => {
    const unitAdded = productIdToSubsriptionDetails[product._id.toString()].unitAdded;
    orderProducts.push({
      name: product.name,
      unitPrice: product.unitPrice,
      unitQuantity: product.unitQuantity,
      unitType: product.unitType,
      brandName: product.brandName,
      unitAdded: orderService.getUnitsToBeSent(unitAdded, subscription.frequency),
      product: product._id,
      order: order._id,
      images: product.images,
    });
  });

  // ----- ******* create order products ****** -------
  orderProducts = await createOrderProducts(orderProducts);

  return orderProducts;
}

/**
 * This method supports updating orderproducts for an order
 * given updated order already exists in the inventory
 * 
 * @param orderId 
 * @param updatedOrderProducts 
 * @returns 
 */
async function updateOrderProductsForOrder(
  orderId: string,
  updatedOrderProducts: OrderProductI[]
) {
  
  /** **** removed products handling **** */
  const updatedOrderProductIds: (string | undefined) [] = [];
  const updatedOrderProductIdToDetail: Record<string, Partial<OrderProductI>> = {};
  updatedOrderProducts.forEach(op => {
    if (op._id) {
      updatedOrderProductIds.push(op._id.toString());
      updatedOrderProductIdToDetail[op._id?.toString()] = op;
    }
  });

  const existingProductsInOrder = await OrderProduct.find(
    { order: orderId }, 
    { _id: 1 }
  );
    
  const productsToBeRemoved: string[] = [];
  existingProductsInOrder.forEach(eop => {
    if (!updatedOrderProductIds.includes(eop._id.toString()))
      productsToBeRemoved.push(eop._id.toString());
  });

  await OrderProduct.deleteMany({ _id: { $in: productsToBeRemoved } });

  /** **** create/update order products **** */
  const products = await OrderProduct.find(
    { _id: { $in: updatedOrderProductIds } }
  ).lean();

  const bulkOperations = [];
  for (let i=0; i< products.length; ++i) {
    const product = products[i];
    const operation = {
      updateOne: {
        filter: { _id: product._id },
        update: { 
          ...omit(product, ['_id']),
          order: orderId,
          product,
          ...omit(updatedOrderProductIdToDetail[product._id.toString()],['_id'])
        },
        upsert: true // Create if not exists
      }
    };

    bulkOperations.push(operation);
  }

  const updateOrderProductsResult = await OrderProduct.bulkWrite(bulkOperations);

  // update payment details for this order
  const order = await orderService.findOne(orderId.toString());
  if (order) {
    const paymentDetails = await paymentService.createOrUpdatePaymentDetailsForOrder(
      order?._id,
      updatedOrderProducts
    );
      
    // update order itemCount, billTotal
    order.itemCount = updatedOrderProducts?.length;
    order.billTotal = paymentDetails?.billTotal ?? 0;
    await order.save();
  }
  
  /** **** updation result **** */
  return updateOrderProductsResult;
}

/**
 * TODO: restrict what all can be updated in an order product
 * @param orderProductId 
 * @param orderproductData 
 * @returns 
 */
async function updateOrderProduct(
  orderProductId: string,
  orderproductData: OrderProductI
) {
  // can put validations here
    
  const updatedOrderProduct = await OrderProduct.findOneAndUpdate(
    { _id: orderProductId }, { ...orderproductData }, { new: true });
    
  return updatedOrderProduct;
}

export {
  getOrderProduct,
  createOrderProducts,
  updateOrderProduct,
  updateOrderProductsForOrder,
  find,
  createOrderProductsForOrder
};
