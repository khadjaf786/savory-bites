import Map "mo:core/Map";
import Types "../types/common";
import MenuLib "../lib/menu";

mixin (dishes : Map.Map<Types.DishId, Types.Dish>) {
  // Public: list every dish on the menu.
  public query func listDishes() : async [Types.Dish] {
    MenuLib.listDishes(dishes);
  };

  // Public: fetch a single dish by id.
  public query func getDish(id : Types.DishId) : async ?Types.Dish {
    MenuLib.getDish(dishes, id);
  };
};
