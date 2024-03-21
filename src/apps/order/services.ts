import _ from 'lodash';
import { Order, OrderI  } from ".";
import { OrderType, UserType } from '../user/constants';
import { OrderProduct, OrderProductI, orderProductService } from '../OrderProduct';
import { Payment, paymentService } from "../Payment";
import { Product } from "../product";
import { Profile } from '../profile';
import { 
  Subscription,
  SubscriptionI, 
  subscriptionService,
} from "../subscription";
import { User } from '../user';
import { generateOrderId } from './orderUtils';
import { SubscriptionFrequency } from '../subscription/constants';
import { OrderStatus } from './constants';
import { FilterBy } from './interfaces';
import { getNextDeliveryDate } from '../subscription/services';

async function findOne(orderId: string) {
  return Order.findOne({ _id: orderId });
}

async function getActiveOrder(userId: string) {
  const order = await Order.findOne({ 
    user: userId, 
    orderType: OrderType.Inventory,
    deliveryStatus: { $ne: "DELIVERED" } 
  }).lean();

  return order;
}

async function getOrder(orderId: string) {
  const order = await Order.findOne({ _id: orderId }).lean();
  const orderProducts = await getProductsByOrderId(orderId);
  const paymentDetails = await paymentService.getPaymentDetails(orderId);
  
  const subscription = await Subscription.findOne({ user: order?.user }).lean();
  const profile = await Profile.findOne({ user: order?.user }).lean();
  const deliveryAgentProfile = await Profile.findOne(
    { user: order?.deliveryAgent }
  ).lean();
  
  const response = { 
    ...order, 
    products: orderProducts,
    paymentDetails,
    deliveryDetails: {
      receiverName: profile?.managerName,
      receiverContact: profile?.phoneNumber,
      address: profile?.address,
      nextDeliveryDate: subscription?.startDate,
      pin: order?.deliveryPin,
      agent: deliveryAgentProfile,
    }
  };

  return response;
}

async function getSubscriptionOrder(userId: string) {
  const order = await Order.findOne({
    user: userId,
    orderType: OrderType.InventorySubscription 
  }).lean();
  if (!order) return null;
  // throw new Error(`Subscription Order does not exist for order id: ${userId}`);
  const paymentDetails = await paymentService.getPaymentDetails(order._id.toString());

  const response = {
    ...order,
    paymentDetails: paymentDetails
  };
  return response;
}

async function getOrdersByUser(userId: string) {
  const orders = await Order.find({ user: userId, isDeleted: false });

  return orders;
}

async function getOrdersForAgent(
  agentUserId: string,
  filterBy: FilterBy
) {
  
  const orders = await Order.find({
    deliveryAgent: agentUserId,
    ..._.pick(filterBy, ['deliverySlot', 'expectedDeliveryDate']) 
  });

  return orders;
}

/**
 * TODO: for now, it will create same number of units for each order
 * need to modify the method to get number of units such that
 * total units delivered in a month do not exceed units added in the beginning
 * @param unitAdded 
 * @param frequency 
 * @returns 
 */
function getUnitsToBeSent(unitAdded: number, frequency: SubscriptionFrequency) {
  let frequencyNumber;
  switch(frequency) {
  case SubscriptionFrequency.Monthly:
    frequencyNumber = 1;
    break;
  case SubscriptionFrequency.FortNight:
    frequencyNumber = 2;
    break;
  case SubscriptionFrequency.Weekly:
    frequencyNumber = 4;
    break;
  }

  const unitsPerOrder = Math.floor(unitAdded/frequencyNumber) === 0 
    ? unitAdded : Math.floor(unitAdded/frequencyNumber);

  return unitsPerOrder;
}


/**
 * TODO: Need to integrate transactional scopes to rollback dependent process
 * following method takes a subscription, and
 * creates an order for that subscription which 
 * includes creation of order products, payment details and order itself
 * @param subscriptionId 
 * @returns 
 */
async function createOrder(
  subscription: SubscriptionI,
  nextDeliveryDate?: Date
) {
  // check if there already exists a undelivered order for this restaurant
  const undeliveredOrder = 
    await Order.find({ 
      user: subscription.user,
      status: { $ne: OrderStatus.Delivered },
      orderType: { $eq: OrderType.Inventory },
    });
  console.log(undeliveredOrder, 'undeliveredOrder--');
  if (undeliveredOrder.length > 0) {
    console.log(`
    There is already a pending order for the user: ${subscription.user}. \
    So, returning without creating an order.
    `);
    return;
  }

  // check if user is valid
  const user = await User.findOne({ _id: subscription.user });
  if (!user) throw new Error(`User not found`);

  let order = new Order();

  order.subscription = subscription._id;
  order.user = user._id;
  order.orderType = OrderType.Inventory;
  order.deliverySlot = subscription.deliverySlot;
  order.orderId = generateOrderId(OrderType.Inventory);

  // user profile
  const profile = await Profile.findOne({ user: subscription.user }).lean();
  if (profile) order.deliveryAddress = profile.address;

  order.expectedDeliveryDate = nextDeliveryDate 
    ? nextDeliveryDate 
    : subscription.startDate;
  
  // order.actualDeliveryDate = this will be updated when order is delivered
  // order.deliveryAgent = this will be assigned by admin for now
  // order.deliveryPin = userService.generateOtp(4);

  // assiging delivery agent to the order, for now we are assigning same agent to
  // all the orders
  // later we will keep it seperately and do it differently
  const deliveryAgents = await User.find({
    userType: UserType.DeliveryAgent 
  }).lean();
  if (deliveryAgents.length > 0 && deliveryAgents[0]._id)
    order.deliveryAgent = deliveryAgents[0]._id;

  // ----- ******* save order ****** -------
  order = await order.save();

  // create related products
  
  const orderProducts = await orderProductService.createOrderProductsForOrder(
    order,
    subscription
  );
  
  // create payment details
  const paymentDetails = await paymentService.createOrUpdatePaymentDetailsForOrder(
    order._id,
    orderProducts,
    subscription
  );

  // attaching bill total and item count with order as needed in order history
  order.billTotal = paymentDetails?.billTotal ?? 0;
  order.itemCount = orderProducts.length;
  await order.save();

  // TODO: send sms regarding items where customer is unhappy with price

  return order;
}

async function updateOrder(
  orderId: string,
  orderData: Partial<OrderI>
) {
  // can put validations here
  
  // set actual deliveryDate when order is delivered
  if (orderData.status && orderData.status === OrderStatus.Delivered) {
    orderData.actualDeliveryDate = new Date();
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId },
    { ...orderData }
  );

  if (updatedOrder) {
    // create next order when current order is delivered
    const subscription = await subscriptionService.findOne(
      updatedOrder?.subscription.toString()
    );
    
    if (!subscription) {
      console.log(`
      Couldn't create new order, subscription not found for order: ${updatedOrder._id}`
      );

      return updatedOrder;
    }

    const nextDeliveryDate = await getNextDeliveryDate(subscription);

    await createOrder(subscription, nextDeliveryDate);
  }

  return updatedOrder;
}

async function deleteOrder(orderId: string) {
  // can put validations here
    
  const order = await Order.findOneAndUpdate(
    { _id: orderId }, { isDeleted: true });
    
  return order;
}

async function getProductsByOrderId(orderId: string) {
  const orderProducts = await OrderProduct.find(
    { order: orderId, isDeleted: false });
  
  return orderProducts;
}


async function addProductToOrder(orderId: string, orderProductData: OrderProductI) {
  // can put validations here
  const order = await Order.findOne({ _id: orderId });
  if (!order) throw new Error(`Order not found with id: ${orderId}`);
  
  const product = await Product.findOne({ _id: orderProductData?._id });
  if (!product)
    throw new Error(`Product not found with id: ${orderProductData?._id}`);
  
  let orderProduct = new OrderProduct({
    name: product.name,
    unitPrice: product.unitPrice,
    unitQuantity: product.unitQuantity,
    unitType: product.unitType,
    brandName: product.brandName,
    unitAdded: orderProductData.unitAdded,
    images: product.images,
    product: product._id,
    order: order._id,
  });
    
  orderProduct = await orderProduct.save();

  return  orderProduct;
}

async function removeProductFromOrder(orderProductId: string) {
  // can put validations here
    
  await OrderProduct.findOneAndUpdate(
    { _id: orderProductId }, { isDeleted: true }, { new: true });
    
  return { message: 'Order product removed successfully' };
}


/**
 * TODO: Need to integrate transactional scopes to rollback dependent process
 * following method takes a subscription, and
 * creates an order for that subscription which 
 * includes creation of order products, payment details and order itself
 * @param subscriptionId 
 * @returns 
 */
async function createSubscriptionOrder(
  subscription: SubscriptionI
) {
  // check if there already exists a undelivered order for this restaurant
  const existingSubscriptionOorder = 
    await Order.find({ 
      user: subscription.user,
      orderType: { $eq: OrderType.InventorySubscription },
    });
  if (existingSubscriptionOorder.length > 0) {
    console.log(`
    There is already a pending subscription order for the user: ${subscription.user} \
    So, returning without creating an order.
    `);
    return;
  }

  // check if user is valid
  const user = await User.findOne({ _id: subscription.user });
  if (!user) throw new Error(`User not found`);

  let order = new Order();

  order.subscription = subscription._id;
  order.user = user._id;
  order.orderType = OrderType.InventorySubscription;
  order.orderId = generateOrderId(OrderType.InventorySubscription);

  // ----- ******* save order ****** -------
  order = await order.save();

  // create related products
  // can keep products null in subscription order
  
  // create payment details
  let paymentDetails = new Payment();
  const totalMrp = 999;
  
  paymentDetails.order = order._id;
  paymentDetails.mrp = totalMrp;
  paymentDetails.productDiscount = 0;
  paymentDetails.itemTotal = 999;
  const gst = Number(((totalMrp*18)/100).toFixed(2));
  paymentDetails.taxes = {
    gst
  };
  paymentDetails.billTotal = totalMrp + gst;
  
  // ----- ******* create payment details ****** -------
  paymentDetails = await paymentDetails.save();


  // attaching bill total and item count with order as needed in order history
  order.billTotal = paymentDetails.billTotal;
  order.itemCount = 1;
  await order.save();

  return order;
}

export { 
  findOne,
  getOrdersByUser,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  addProductToOrder,
  getProductsByOrderId,
  removeProductFromOrder,
  getActiveOrder,
  createSubscriptionOrder,
  getSubscriptionOrder,
  getOrdersForAgent,
  getUnitsToBeSent
};
