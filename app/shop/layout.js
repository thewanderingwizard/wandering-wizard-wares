import ShopShell from "./components/ShopShell";

export const metadata = {
  title: "Peruse the Wares | Wandering Wizard Wares",
  description:
    "Explore the full catalogue of books, curios, oddities, and ephemera from Wandering Wizard Wares.",
};

export default function ShopLayout({ children }) {
  return <ShopShell>{children}</ShopShell>;
}
