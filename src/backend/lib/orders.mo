import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/common";

module {
  // Flat delivery fee in minor currency units (cents).
  let deliveryFee : Nat = 399;
  // Orders at or above this subtotal ship free.
  let freeDeliveryThreshold : Nat = 5000;

  // Validates the request, prices the line items from the current menu,
  // computes subtotal / delivery fee / total, assigns a reference number,
  // and persists the order.
  public func placeOrder(
    dishes : Map.Map<Types.DishId, Types.Dish>,
    orders : Map.Map<Types.OrderId, Types.Order>,
    state : { var nextOrderId : Nat },
    customerName : Text,
    phone : Text,
    address : Types.DeliveryAddress,
    items : [Types.OrderItem],
    paymentMethod : Types.PaymentMethod,
    cardholderName : ?Text,
  ) : { #ok : Types.Order; #err : Types.PlaceOrderError } {
    if (items.size() == 0) {
      return #err(#emptyCart);
    };
    if (customerName.trim(#predicate(Char.isWhitespace)) == "") {
      return #err(#missingCustomerName);
    };
    if (phone.trim(#predicate(Char.isWhitespace)) == "") {
      return #err(#missingPhone);
    };
    if (
      address.street.trim(#predicate(Char.isWhitespace)) == "" or
      address.city.trim(#predicate(Char.isWhitespace)) == "" or
      address.postcode.trim(#predicate(Char.isWhitespace)) == ""
    ) {
      return #err(#missingAddress);
    };

    switch (paymentMethod) {
      case (#card) {
        switch (cardholderName) {
          case (?name) {
            if (name.trim(#predicate(Char.isWhitespace)) == "") {
              return #err(#missingCardholderName);
            };
          };
          case null {
            return #err(#missingCardholderName);
          };
        };
      };
      case (#cash) {};
    };

    // Price every line from the current menu, rejecting unknown or
    // unavailable dishes.
    var subtotal = 0;
    let priced = List.empty<Types.OrderItem>();
    for (item in items.values()) {
      let dish = switch (dishes.get(item.dishId)) {
        case (?d) { d };
        case null { return #err(#unknownDish(item.dishId)) };
      };
      if (not dish.available) {
        return #err(#dishUnavailable(item.dishId));
      };
      subtotal += dish.price * item.quantity;
      priced.add({
        dishId = dish.id;
        name = dish.name;
        unitPrice = dish.price;
        quantity = item.quantity;
      });
    };

    let fee = if (subtotal >= freeDeliveryThreshold) { 0 } else { deliveryFee };
    let total = subtotal + fee;

    let id = state.nextOrderId;
    state.nextOrderId := id + 1;

    let order : Types.Order = {
      id;
      reference = makeReference(id);
      customerName;
      phone;
      address;
      items = priced.toArray();
      subtotal;
      deliveryFee = fee;
      total;
      paymentMethod;
      cardholderName;
      status = #placed;
      createdAt = Time.now();
    };

    orders.add(id, order);
    #ok(order);
  };

  // Returns every placed order, newest first. Admin-only at the API layer.
  public func listOrders(orders : Map.Map<Types.OrderId, Types.Order>) : [Types.Order] {
    let all = orders.values().toArray();
    all.sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  // Applies an admin status change to an existing order.
  // Transition rules: #placed -> #confirmed | #cancelled;
  // #confirmed -> #delivered | #cancelled; #delivered and #cancelled are terminal.
  // Returns the updated order, or a typed error for not-found / invalid transition.
  public func updateOrderStatus(
    orders : Map.Map<Types.OrderId, Types.Order>,
    orderId : Types.OrderId,
    newStatus : Types.OrderStatus,
  ) : { #ok : Types.Order; #err : Types.UpdateOrderStatusError } {
    let order = switch (orders.get(orderId)) {
      case (?o) { o };
      case null { return #err(#notFound(orderId)) };
    };
    if (not isAllowedTransition(order.status, newStatus)) {
      return #err(#invalidTransition({ from = order.status; to = newStatus }));
    };
    let updated : Types.Order = { order with status = newStatus };
    orders.add(orderId, updated);
    #ok(updated);
  };

  // Transition rules: #placed -> #confirmed | #cancelled;
  // #confirmed -> #delivered | #cancelled; #delivered and #cancelled are terminal.
  func isAllowedTransition(from : Types.OrderStatus, to : Types.OrderStatus) : Bool {
    switch (from) {
      case (#placed) { to == #confirmed or to == #cancelled };
      case (#confirmed) { to == #delivered or to == #cancelled };
      case (#delivered) { false };
      case (#cancelled) { false };
    };
  };

  // Human-readable order reference, e.g. "ORD-000042".
  func makeReference(id : Types.OrderId) : Text {
    let digits = id.toText();
    let padding = if (digits.size() >= 6) { "" } else {
      var zeros = "";
      var i = digits.size();
      while (i < 6) {
        zeros := zeros # "0";
        i += 1;
      };
      zeros;
    };
    "ORD-" # padding # digits;
  };
};
