module {
  // Cross-cutting identifiers and timestamps.
  public type DishId = Nat;
  public type OrderId = Nat;
  public type Timestamp = Int; // nanoseconds since epoch (Time.now())

  // Menu domain.
  public type Category = {
    #starters;
    #mains;
    #desserts;
    #drinks;
  };

  public type Dish = {
    id : DishId;
    name : Text;
    description : Text;
    price : Nat; // minor currency units (e.g. cents)
    category : Category;
    imageUrl : Text;
    featured : Bool;
    available : Bool;
  };

  // Checkout / delivery domain.
  public type DeliveryAddress = {
    street : Text;
    city : Text;
    postcode : Text;
    notes : Text;
  };

  public type PaymentMethod = {
    #cash;
    #card;
  };

  public type OrderItem = {
    dishId : DishId;
    name : Text;
    unitPrice : Nat; // minor currency units, captured at order time
    quantity : Nat;
  };

  public type OrderStatus = {
    #placed;
    #confirmed;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : OrderId;
    reference : Text;
    customerName : Text;
    phone : Text;
    address : DeliveryAddress;
    items : [OrderItem];
    subtotal : Nat;
    deliveryFee : Nat;
    total : Nat;
    paymentMethod : PaymentMethod;
    cardholderName : ?Text; // present only for card orders
    status : OrderStatus;
    createdAt : Timestamp;
  };

  // Caller-actionable failures for placing an order.
  public type PlaceOrderError = {
    #emptyCart;
    #missingCustomerName;
    #missingPhone;
    #missingAddress;
    #missingCardholderName;
    #unknownDish : DishId;
    #dishUnavailable : DishId;
  };

  // Caller-actionable failures for an admin order status change.
  public type UpdateOrderStatusError = {
    #notFound : OrderId;
    #unauthorized;
    #invalidTransition : { from : OrderStatus; to : OrderStatus };
  };
};
