import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/common";

module {
  // Returns every dish on the menu, ordered by id.
  public func listDishes(dishes : Map.Map<Types.DishId, Types.Dish>) : [Types.Dish] {
    let all = dishes.values().toArray();
    all.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  // Returns a single dish by id, or null when it does not exist.
  public func getDish(dishes : Map.Map<Types.DishId, Types.Dish>, id : Types.DishId) : ?Types.Dish {
    dishes.get(id);
  };

  // Returns the dishes seeded on first run across all categories.
  public func seedDishes() : [Types.Dish] {
    [
      // Starters
      {
        id = 1;
        name = "Garlic Butter Prawns";
        description = "Succulent prawns seared in garlic butter with a squeeze of lemon and fresh parsley.";
        price = 899;
        category = #starters;
        imageUrl = "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=800&q=80";
        featured = true;
        available = true;
      },
      {
        id = 2;
        name = "Crispy Calamari";
        description = "Lightly battered squid rings fried until golden, served with a smoky paprika aioli.";
        price = 749;
        category = #starters;
        imageUrl = "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 3;
        name = "Tomato Basil Bruschetta";
        description = "Toasted sourdough topped with vine-ripened tomatoes, basil, and a drizzle of balsamic glaze.";
        price = 599;
        category = #starters;
        imageUrl = "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 4;
        name = "Loaded Nachos";
        description = "Warm tortilla chips piled with melted cheddar, jalapenos, salsa, and cool sour cream.";
        price = 699;
        category = #starters;
        imageUrl = "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80";
        featured = false;
        available = true;
      },

      // Mains
      {
        id = 5;
        name = "Margherita Pizza";
        description = "Stone-baked thin crust with San Marzano tomato, fresh mozzarella, and hand-torn basil.";
        price = 1199;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80";
        featured = true;
        available = true;
      },
      {
        id = 6;
        name = "Grilled Ribeye Steak";
        description = "Aged 10oz ribeye flame-grilled to your liking, with peppercorn sauce and hand-cut chips.";
        price = 2499;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80";
        featured = true;
        available = true;
      },
      {
        id = 7;
        name = "Herb Roast Chicken";
        description = "Half chicken roasted with rosemary and thyme, served with buttery mash and gravy.";
        price = 1599;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 8;
        name = "Wild Mushroom Risotto";
        description = "Creamy arborio rice slow-cooked with wild mushrooms, white wine, and aged parmesan.";
        price = 1399;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 9;
        name = "Classic Beef Burger";
        description = "Chargrilled beef patty with smoked cheddar, lettuce, tomato, and house burger sauce.";
        price = 1299;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 10;
        name = "Spicy Arrabbiata Pasta";
        description = "Penne tossed in a fiery tomato and chilli sauce with garlic, olive oil, and fresh basil.";
        price = 1149;
        category = #mains;
        imageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80";
        featured = false;
        available = true;
      },

      // Desserts
      {
        id = 11;
        name = "Molten Chocolate Lava Cake";
        description = "Warm chocolate sponge with a gooey molten centre, served with vanilla bean ice cream.";
        price = 699;
        category = #desserts;
        imageUrl = "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80";
        featured = true;
        available = true;
      },
      {
        id = 12;
        name = "New York Cheesecake";
        description = "Silky baked cheesecake on a buttery biscuit base, topped with a berry compote.";
        price = 649;
        category = #desserts;
        imageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 13;
        name = "Sticky Toffee Pudding";
        description = "Date sponge drenched in warm toffee sauce with a generous scoop of clotted cream.";
        price = 629;
        category = #desserts;
        imageUrl = "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 14;
        name = "Tiramisu";
        description = "Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa.";
        price = 679;
        category = #desserts;
        imageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80";
        featured = false;
        available = true;
      },

      // Drinks
      {
        id = 15;
        name = "Fresh Lemonade";
        description = "Hand-squeezed lemons with a touch of mint and sparkling water over ice.";
        price = 349;
        category = #drinks;
        imageUrl = "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 16;
        name = "Iced Caramel Latte";
        description = "Double espresso shaken with milk and caramel syrup, poured over ice.";
        price = 429;
        category = #drinks;
        imageUrl = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 17;
        name = "Craft Root Beer";
        description = "Small-batch root beer with notes of vanilla and wintergreen, served ice cold.";
        price = 299;
        category = #drinks;
        imageUrl = "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=800&q=80";
        featured = false;
        available = true;
      },
      {
        id = 18;
        name = "Sparkling Elderflower";
        description = "Delicately floral elderflower pressé with a crisp, refreshing finish.";
        price = 329;
        category = #drinks;
        imageUrl = "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80";
        featured = false;
        available = true;
      },
    ];
  };
};
