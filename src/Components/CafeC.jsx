// import CafeteriaMenu from "../components/CafeteriaMenu";

const menuItems = [
  { name: "Pizza", price: 120, img: "/images/pizza.jpg" },
  { name: "Shiro", price: 50, img: "/images/shiro.jpg" },
  { name: "Coca Cola", price: 20, img: "/images/coke.jpg" },
];

export default function CafeC() {
  return <CafeteriaMenu title="Guna Cafeteria" menu={menuItems} />;
}
