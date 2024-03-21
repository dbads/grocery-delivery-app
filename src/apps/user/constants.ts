enum UserType {
    Restaurant = 'RESTAURANT',
    Operations = 'OPERATIONS',
    Admin = 'ADMIN',
    InventoryManager = 'INVENTORY_MANGER',
    FinanceHead = 'FINANCE_HEAD',
    ProcurementHead = 'PROCUREMENT_HEAD',
    SalesAgent = 'SALES_AGENT',
    DeliveryAgent = 'DELIVERY_AGENT'
}

enum OrderType {
    InventorySubscription = 'INVENTORY_SUBSCRIPTION',
    Inventory = 'INVENTORY'
}

// TODO: will need to redesign the users, permissions etc
// different users which comes under userType - OPERATIONS
// enum UserRole {
//     Admin = 'ADMIN',
//     InventoryManager = 'INVENTORY_MANGER',
//     FinanceHead = 'FINANCE_HEAD',
//     ProcurementHead = 'PROCUREMENT_HEAD',
//     SalesAgent = 'SALES_AGENT',
//     DeliveryAgent = 'DELIVERY_AGENT'
// }

export {
  UserType,
  //   UserRole,
  OrderType,
};
