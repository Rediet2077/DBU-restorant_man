// import CafeteriaMenu from "../components/CafeteriaMenu";

const menuItems = [
  { name: "Chechebsa", price: 55, img: "/images/chechebsa.jpg" },
  { name: "Burger", price: 80, img: "/images/burger.jpg" },
  { name: "Macchiato", price: 15, img: "/images/macciato.jpg" },
];

export default function CafeB() {
  return <CafeteriaMenu title="Tana Cafeteria" menu={menuItems} />;
}
