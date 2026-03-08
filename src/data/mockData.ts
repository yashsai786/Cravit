export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isBestseller?: boolean;
  customizations?: { name: string; options: { label: string; price: number }[] }[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  costForTwo: number;
  image: string;
  isVeg?: boolean;
  promoted?: boolean;
  discount?: string;
  menu: MenuItem[];
}

export interface InstamartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  unit: string;
  inStock: boolean;
}

export const cuisineFilters = [
  "🍽️ All", "🍛 Biryani", "🍕 Pizza", "🍔 Burger", "🥡 Chinese", "🫓 North Indian",
  "🥘 South Indian", "🍰 Desserts", "🍦 Ice Cream", "🌯 Rolls", "🎂 Cakes"
];

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Meghana Foods",
    cuisine: ["Biryani", "North Indian", "Asian"],
    rating: 4.5,
    ratingCount: 12500,
    deliveryTime: "25-30 min",
    costForTwo: 500,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    promoted: true,
    discount: "50% OFF up to ₹100",
    menu: [
      { id: "m1", name: "Chicken Biryani", description: "Aromatic basmati rice cooked with tender chicken pieces and special spices", price: 299, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop", category: "Biryani", isVeg: false, isBestseller: true, customizations: [{ name: "Size", options: [{ label: "Regular", price: 0 }, { label: "Large", price: 100 }] }] },
      { id: "m2", name: "Mutton Biryani", description: "Slow-cooked mutton biryani with fragrant spices", price: 399, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop", category: "Biryani", isVeg: false, isBestseller: true },
      { id: "m3", name: "Veg Biryani", description: "Mixed vegetables cooked in aromatic basmati rice", price: 229, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&h=200&fit=crop", category: "Biryani", isVeg: true },
      { id: "m4", name: "Paneer Butter Masala", description: "Soft paneer cubes in rich tomato gravy", price: 269, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop", category: "Main Course", isVeg: true, isBestseller: true },
      { id: "m5", name: "Butter Naan", description: "Soft leavened bread with butter", price: 59, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=200&h=200&fit=crop", category: "Breads", isVeg: true },
      { id: "m6", name: "Gulab Jamun", description: "Deep-fried milk dumplings in sugar syrup", price: 99, image: "https://images.unsplash.com/photo-1666190094745-ef3a2eb1dc78?w=200&h=200&fit=crop", category: "Desserts", isVeg: true },
    ],
  },
  {
    id: "r2",
    name: "Pizza Hut",
    cuisine: ["Pizza", "Italian", "Fast Food"],
    rating: 4.2,
    ratingCount: 8700,
    deliveryTime: "30-35 min",
    costForTwo: 600,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    discount: "FREE DELIVERY",
    menu: [
      { id: "p1", name: "Margherita Pizza", description: "Classic delight with mozzarella cheese", price: 249, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop", category: "Pizza", isVeg: true, isBestseller: true, customizations: [{ name: "Size", options: [{ label: "Medium", price: 0 }, { label: "Large", price: 150 }] }, { name: "Crust", options: [{ label: "Classic", price: 0 }, { label: "Stuffed", price: 80 }] }] },
      { id: "p2", name: "Pepperoni Pizza", description: "Loaded with pepperoni and mozzarella", price: 399, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop", category: "Pizza", isVeg: false, isBestseller: true },
      { id: "p3", name: "Garlic Bread", description: "Crispy bread topped with garlic butter and herbs", price: 149, image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=200&h=200&fit=crop", category: "Sides", isVeg: true },
      { id: "p4", name: "Pasta Alfredo", description: "Creamy white sauce pasta", price: 279, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", category: "Pasta", isVeg: true },
    ],
  },
  {
    id: "r3",
    name: "Burger King",
    cuisine: ["Burger", "Fast Food", "American"],
    rating: 4.1,
    ratingCount: 6300,
    deliveryTime: "20-25 min",
    costForTwo: 400,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    discount: "₹125 OFF ABOVE ₹249",
    menu: [
      { id: "b1", name: "Whopper", description: "Flame-grilled beef burger with fresh toppings", price: 199, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop", category: "Burgers", isVeg: false, isBestseller: true },
      { id: "b2", name: "Veg Whopper", description: "Crispy veggie patty with fresh vegetables", price: 169, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop", category: "Burgers", isVeg: true, isBestseller: true },
      { id: "b3", name: "Chicken Fries", description: "Crispy chicken fries with dipping sauce", price: 149, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop", category: "Sides", isVeg: false },
      { id: "b4", name: "Oreo Shake", description: "Thick creamy Oreo milkshake", price: 139, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop", category: "Beverages", isVeg: true },
    ],
  },
  {
    id: "r4",
    name: "Saravana Bhavan",
    cuisine: ["South Indian", "Tamil"],
    rating: 4.6,
    ratingCount: 15200,
    deliveryTime: "20-30 min",
    costForTwo: 300,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
    isVeg: true,
    promoted: true,
    menu: [
      { id: "s1", name: "Masala Dosa", description: "Crispy dosa filled with spiced potato", price: 120, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&h=200&fit=crop", category: "Dosa", isVeg: true, isBestseller: true },
      { id: "s2", name: "Idli Sambar", description: "Soft steamed idlis with sambar and chutney", price: 89, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop", category: "Breakfast", isVeg: true },
      { id: "s3", name: "Rava Upma", description: "Semolina cooked with vegetables and spices", price: 99, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=200&h=200&fit=crop", category: "Breakfast", isVeg: true },
      { id: "s4", name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 49, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop", category: "Beverages", isVeg: true, isBestseller: true },
    ],
  },
  {
    id: "r5",
    name: "Wok To Walk",
    cuisine: ["Chinese", "Asian", "Thai"],
    rating: 4.3,
    ratingCount: 4100,
    deliveryTime: "25-30 min",
    costForTwo: 450,
    image: "https://images.unsplash.com/photo-1552611052-33e04de891de?w=400&h=300&fit=crop",
    discount: "20% OFF",
    menu: [
      { id: "w1", name: "Hakka Noodles", description: "Stir-fried noodles with vegetables and soy sauce", price: 199, image: "https://images.unsplash.com/photo-1552611052-33e04de891de?w=200&h=200&fit=crop", category: "Noodles", isVeg: true, isBestseller: true },
      { id: "w2", name: "Chicken Manchurian", description: "Crispy chicken in spicy Manchurian sauce", price: 269, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=200&h=200&fit=crop", category: "Starters", isVeg: false },
      { id: "w3", name: "Fried Rice", description: "Wok-tossed rice with vegetables", price: 179, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop", category: "Rice", isVeg: true },
    ],
  },
  {
    id: "r6",
    name: "The Dessert House",
    cuisine: ["Desserts", "Ice Cream", "Cakes"],
    rating: 4.7,
    ratingCount: 9800,
    deliveryTime: "15-20 min",
    costForTwo: 350,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop",
    isVeg: true,
    promoted: true,
    discount: "BUY 1 GET 1",
    menu: [
      { id: "d1", name: "Chocolate Brownie", description: "Warm gooey chocolate brownie with vanilla ice cream", price: 179, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=200&h=200&fit=crop", category: "Brownies", isVeg: true, isBestseller: true },
      { id: "d2", name: "Red Velvet Cake", description: "Classic red velvet with cream cheese frosting", price: 249, image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=200&h=200&fit=crop", category: "Cakes", isVeg: true },
      { id: "d3", name: "Belgian Waffle", description: "Crispy waffle with fruits and chocolate drizzle", price: 199, image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&h=200&fit=crop", category: "Waffles", isVeg: true, isBestseller: true },
    ],
  },
];

export const instamartCategories = [
  "Fruits & Vegetables", "Dairy & Bread", "Snacks", "Beverages",
  "Cleaning", "Personal Care", "Baby Care", "Masala & Spices"
];

export const instamartItems: InstamartItem[] = [
  { id: "i1", name: "Banana", category: "Fruits & Vegetables", price: 39, unit: "1 dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop", inStock: true },
  { id: "i2", name: "Amul Milk", category: "Dairy & Bread", price: 29, unit: "500 ml", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop", inStock: true },
  { id: "i3", name: "Lays Classic", category: "Snacks", price: 20, originalPrice: 25, unit: "52g", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop", inStock: true },
  { id: "i4", name: "Coca Cola", category: "Beverages", price: 40, unit: "750 ml", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop", inStock: true },
  { id: "i5", name: "Tomato", category: "Fruits & Vegetables", price: 30, unit: "500g", image: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200&h=200&fit=crop", inStock: true },
  { id: "i6", name: "Brown Bread", category: "Dairy & Bread", price: 45, unit: "400g", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop", inStock: false },
  { id: "i7", name: "Apple", category: "Fruits & Vegetables", price: 149, unit: "1 kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop", inStock: true },
  { id: "i8", name: "Curd", category: "Dairy & Bread", price: 35, unit: "400g", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop", inStock: true },
];

export const coupons = [
  { code: "WELCOME50", discount: 50, minOrder: 200, description: "50% off up to ₹100 on first order" },
  { code: "PARTY", discount: 20, minOrder: 500, description: "20% off on orders above ₹500" },
  { code: "FREEDELIVERY", discount: 0, minOrder: 149, description: "Free delivery on orders above ₹149", freeDelivery: true },
];
