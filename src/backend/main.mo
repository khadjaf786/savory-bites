import Map "mo:core/Map";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import Types "types/common";
import MenuApi "mixins/menu-api";
import OrdersApi "mixins/orders-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // OQL column encodings for variant fields (one Value variant per field).
  func categoryTag(c : Types.Category) : Text =
    switch c {
      case (#starters) "starters";
      case (#mains) "mains";
      case (#desserts) "desserts";
      case (#drinks) "drinks";
    };

  func paymentTag(p : Types.PaymentMethod) : Text =
    switch p {
      case (#cash) "cash";
      case (#card) "card";
    };

  func statusTag(s : Types.OrderStatus) : Text =
    switch s {
      case (#placed) "placed";
      case (#confirmed) "confirmed";
      case (#delivered) "delivered";
      case (#cancelled) "cancelled";
    };

  let accessControlState : AccessControl.AccessControlState;

  // Menu and orders state. Initial values come from the migration chain.
  let dishes : Map.Map<Types.DishId, Types.Dish>;
  let orders : Map.Map<Types.OrderId, Types.Order>;
  let state : { var nextOrderId : Nat };

  include MixinAuthorization(accessControlState, null);
  include MenuApi(dishes);
  include OrdersApi(accessControlState, dishes, orders, state);
  include ApiDocMixin();

  include Expose({
    entities = [
      dishes.toEntityManual("dish", "Dish", "id")
        .sample({
          id = 0;
          name = "";
          description = "";
          price = 0;
          category = #mains;
          imageUrl = "";
          featured = false;
          available = true;
        })
        .payload("id", func d = d.id)
        .payload("name", func d = d.name)
        .payload("description", func d = d.description)
        .payload("price", func d = d.price)
        .payload("category", func d = categoryTag(d.category))
        .payload("imageUrl", func d = d.imageUrl)
        .payload("featured", func d = d.featured)
        .payload("available", func d = d.available)
        .public_()
        .build(),
      orders.toEntityManual("order", "Order", "id")
        .sample({
          id = 0;
          reference = "";
          customerName = "";
          phone = "";
          address = { street = ""; city = ""; postcode = ""; notes = "" };
          items = [];
          subtotal = 0;
          deliveryFee = 0;
          total = 0;
          paymentMethod = #cash;
          cardholderName = null;
          status = #placed;
          createdAt = 0;
        })
        .payload("id", func o = o.id)
        .payload("reference", func o = o.reference)
        .payload("customerName", func o = o.customerName)
        .payload("phone", func o = o.phone)
        .flatten(func o = o.address)
        .payload("itemCount", func o = o.items.size())
        .payload("subtotal", func o = o.subtotal)
        .payload("deliveryFee", func o = o.deliveryFee)
        .payload("total", func o = o.total)
        .payload("paymentMethod", func o = paymentTag(o.paymentMethod))
        .payload("cardholderName", func o = o.cardholderName ?? "")
        .payload("status", func o = statusTag(o.status))
        .payload("createdAt", func o = o.createdAt)
        .controllerOnly()
        .build(),
    ];
  });
};
