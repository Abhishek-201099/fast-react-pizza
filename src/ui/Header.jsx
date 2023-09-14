import { Link } from "react-router-dom";
import SearchOrder from "../features/order/SearchOrder";
import Username from "../features/user/Username";

export default function Header() {
  return (
    <header className="font-pizza flex items-center justify-around border-b border-stone-200 bg-yellow-500 px-3 py-4 uppercase sm:px-6">
      <Link to="/" className="tracking-widest">
        The Fast React Pizza Co.
      </Link>
      <SearchOrder />
      <Username />
    </header>
  );
}
