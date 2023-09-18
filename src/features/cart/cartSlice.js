import { createSlice } from "@reduxjs/toolkit";

const initialCartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    addItem(state, action) {
      state.cart.push(action.payload);
    },
    deleteItem(state, action) {
      state.cart = state.cart.filter(
        (cartItem) => cartItem.pizzaId !== action.payload,
      );
    },
    increaseItemQuantity(state, action) {
      const item = state.cart.find(
        (cartItem) => cartItem.pizzaId === action.payload,
      );
      item.quantity++;
      item.totalPrice = item.quantity * item.unitPrice;
    },
    decreaseItemQuantity(state, action) {
      const item = state.cart.find(
        (cartItem) => cartItem.pizzaId === action.payload,
      );
      item.quantity--;
      item.totalPrice = item.quantity * item.unitPrice;
    },
    clearCart(state) {
      state.cart = [];
    },
  },
});

export const {
  addItem,
  deleteItem,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// SELECTORS

export function getCart(state) {
  return state.cart.cart;
}

export function getTotalCartQuantity(state) {
  return state.cart.cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
}

export function getTotalCartPrice(state) {
  return state.cart.cart.reduce(
    (acc, cartItem) => acc + cartItem.totalPrice,
    0,
  );
}
