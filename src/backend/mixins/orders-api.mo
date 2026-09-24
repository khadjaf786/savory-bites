import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/common";
import OrdersLib "../lib/orders";

mixin (
  accessControlState : AccessControl.AccessControlState,
  dishes : Map.Map<Types.DishId, Types.Dish>,
  orders : Map.Map<Types.OrderId, Types.Order>,
  state : { var nextOrderId : Nat },
) {
  // Public: place an order. Validates required fields and returns the created
  // order (with its reference number) or a caller-actionable error.
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    phone : Text,
    address : Types.DeliveryAddress,
    items : [Types.OrderItem],
    paymentMethod : Types.PaymentMethod,
    cardholderName : ?Text,
  ) : async { #ok : Types.Order; #err : Types.PlaceOrderError } {
    ignore caller;
    OrdersLib.placeOrder(dishes, orders, state, customerName, phone, address, items, paymentMethod, cardholderName);
  };

  // Admin-only: list every placed order.
  public query ({ caller }) func listOrders() : async [Types.Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list orders");
    };
    OrdersLib.listOrders(orders);
  };

  // Admin-only: change an order's status. Enforces the transition rules and
  // returns the updated order or a typed error the dashboard can display.
  public shared ({ caller }) func updateOrderStatus(
    orderId : Types.OrderId,
    newStatus : Types.OrderStatus,
  ) : async { #ok : Types.Order; #err : Types.UpdateOrderStatusError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update orders");
    };
    OrdersLib.updateOrderStatus(orders, orderId, newStatus);
  };
};
