import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { fetchAddress } from "../user/userSlice";
import { formatCurrency } from "../../utils/helpers";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const dispatch = useDispatch();
  const [withPriority, setWithPriority] = useState(false);
  const {
    username,
    status: addressStatus,
    address,
    position,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const cart = useSelector(getCart);
  // Here we have used useNavigation() to check the form submission status.
  const navigation = useNavigation();
  // useActionData() will return the data that we have returned from the action.
  const formErrors = useActionData();

  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;
  const isLoadingAddress = addressStatus === "loading";
  const isSubmitting = navigation.state === "submitting";

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">
        Ready to order? Let&apos;s go!
      </h2>

      {/* Form is used from react-router-dom for ease-of-use of the form data. */}
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            defaultValue={username}
            name="customer"
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {/* rendering the error if it is there in formErrors. */}
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              defaultValue={address}
              disabled={isLoadingAddress}
              required
            />
            {addressStatus === "error" && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
            {!position.latitude && !position.longitutde && (
              <span className="absolute right-[5px] top-[31px] z-50 mt-1 md:right-[5px] md:top-[1px]">
                <Button
                  type="small"
                  disabled={isLoadingAddress}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(fetchAddress());
                  }}
                >
                  get position
                </Button>
              </span>
            )}
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          {/* We've used type='hidden' because we want this cart value to be sent upon submission as well without showing it on UI. */}
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input
            type="hidden"
            name="position"
            value={
              position.longitude && position.latitude
                ? `${position.latitude},${position.longitude}`
                : ""
            }
          />
          <Button type="primary" disabled={isSubmitting}>
            {isSubmitting || isLoadingAddress
              ? "Placing order..."
              : `Order now for ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

// The action() will receive the request object that is generated when we submit the above form.
export async function action({ request }) {
  // Taking the form data out of the request.
  const res = await request.formData();
  const formData = Object.fromEntries(res);

  // Customizing the order object to send to the endpoint to create order.
  const order = {
    ...formData,
    cart: JSON.parse(formData.cart),
    priority: formData.priority === "true",
  };

  // Checking phone number validity before creating the order.
  const errors = {};
  if (!isValidPhone(order.phone)) {
    errors.phone = `Please provide your correct phone number. We might need it to contact you for delivery.`;
  }

  // If there are errors then we immediately return the errors object.
  if (Object.keys(errors).length > 0) return errors;

  // If there are no erros then we create the order.
  const newOrder = await createOrder(order);

  // To remove the cart upon placement of order.
  store.dispatch(clearCart());

  // Redirecting upon creation of order using redirect because this isn't a component where we use useNavigate().
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
