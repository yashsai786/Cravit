export const RESTAURANTS = [
  {
    id: 'r1',
    name: "Sagar Ratna",
    rating: 4.2,
    cuisine: "South Indian",
    time: "30-35",
    image: "invalid-url-path/sagar_ratna.jpg" // BUG: Broken path
  },
  {
    id: 'r2',
    name: "Burger King",
    rating: 4.1,
    cuisine: "Burgers",
    time: "25-30",
    image: "" // BUG: Missing image
  }
];
