import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface DeliveryAddress {
    street: string;
    postcode: string;
    city: string;
    notes: string;
}
export interface Dish {
    id: DishId;
    featured: boolean;
    name: string;
    description: string;
    available: boolean;
    imageUrl: string;
    category: Category;
    price: bigint;
}
export type DishId = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Order {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    total: bigint;
    paymentMethod: PaymentMethod;
    deliveryFee: bigint;
    createdAt: Timestamp;
    reference: string;
    cardholderName?: string;
    address: DeliveryAddress;
    phone: string;
    items: Array<OrderItem>;
    subtotal: bigint;
}
export type OrderId = bigint;
export interface OrderItem {
    name: string;
    quantity: bigint;
    dishId: DishId;
    unitPrice: bigint;
}
export type PlaceOrderError = {
    __kind__: "missingCardholderName";
    missingCardholderName: null;
} | {
    __kind__: "unknownDish";
    unknownDish: DishId;
} | {
    __kind__: "missingCustomerName";
    missingCustomerName: null;
} | {
    __kind__: "missingPhone";
    missingPhone: null;
} | {
    __kind__: "missingAddress";
    missingAddress: null;
} | {
    __kind__: "dishUnavailable";
    dishUnavailable: DishId;
} | {
    __kind__: "emptyCart";
    emptyCart: null;
};
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type UpdateOrderStatusError = {
    __kind__: "notFound";
    notFound: OrderId;
} | {
    __kind__: "invalidTransition";
    invalidTransition: {
        to: OrderStatus;
        from: OrderStatus;
    };
} | {
    __kind__: "unauthorized";
    unauthorized: null;
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    mains = "mains",
    desserts = "desserts",
    starters = "starters",
    drinks = "drinks"
}
export enum OrderStatus {
    cancelled = "cancelled",
    placed = "placed",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    card = "card",
    cash = "cash"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getDish(id: DishId): Promise<Dish | null>;
    isCallerAdmin(): Promise<boolean>;
    listDishes(): Promise<Array<Dish>>;
    listOrders(): Promise<Array<Order>>;
    placeOrder(customerName: string, phone: string, address: DeliveryAddress, items: Array<OrderItem>, paymentMethod: PaymentMethod, cardholderName: string | null): Promise<{
        __kind__: "ok";
        ok: Order;
    } | {
        __kind__: "err";
        err: PlaceOrderError;
    }>;
    schema(): Promise<string>;
    updateOrderStatus(orderId: OrderId, newStatus: OrderStatus): Promise<{
        __kind__: "ok";
        ok: Order;
    } | {
        __kind__: "err";
        err: UpdateOrderStatusError;
    }>;
}
