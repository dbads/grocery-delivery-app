import { OrderType } from "../user/constants";

const orderTypeToOrderIdPrefix: Record<string, string> = {
  INVENTORY: "INV",
  INVENTORY_SUBSCRIPTION: "INVSUB",
};

/**
 * TODO: make this more robust to avoid order id colliosion
 * @param orderType 
 * @returns 
 */
function generateOrderId(orderType: OrderType) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
    
  let id = `DH-${orderTypeToOrderIdPrefix[orderType]}-`;
    
  //   Add 3 random characters
  for (let i = 0; i < 3; i++) {
    const randomChar = 
        characters.charAt(Math.floor(Math.random() * characters.length));
    id += randomChar;
  }
    
  // Add 4 random numbers
  for (let i = 0; i < 6; i++) {
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    id += randomNumber;
  }
    
  return id;
}
  
export { generateOrderId };