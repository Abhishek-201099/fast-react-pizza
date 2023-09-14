import { useLoaderData } from "react-router-dom";
import { getMenu } from "../../services/apiRestaurant";
import MenuItem from "./MenuItem";

function Menu() {
  // By using useLoaderData() we can get the data that is retuned by the loader.
  const menu = useLoaderData();
  return (
    <ul className="divide-y divide-stone-200 px-2">
      {menu.map((pizza) => (
        <MenuItem pizza={pizza} key={pizza.id} />
      ))}
    </ul>
  );
}

// By convention we should write the loader function in the related component.
export async function loader() {
  const menu = await getMenu();
  return menu;
}

export default Menu;
