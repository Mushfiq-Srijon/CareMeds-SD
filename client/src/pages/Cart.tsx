import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../api";
import { Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import "../styles/Cart.css";

const apiClient = new ApiClient();

interface CartItem {
  cart_id: number;
  quantity: number;
  medicine_id: number;
  name: string;
  price: number;
  company: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getCart();
      setCartItems(res || []);
    } catch {
      toast.error("Failed to fetch cart");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(cartId);
    try {
      await apiClient.updateCart(cartId, quantity);
      toast.success("Quantity updated");
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
    setUpdatingId(null);
  };

  const removeItem = async (cartId: number) => {
    setUpdatingId(cartId);
    try {
      await apiClient.removeCartItem(cartId);
      toast.success("Item removed");
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
    setUpdatingId(null);
  };

  const checkout = () => {
    if (cartItems.length === 0) return toast.error("Cart is empty");
    toast.success("Proceeding to checkout...");
    navigate("/checkout");
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-root">

      {/* ── HEADER ── */}
      <div className="cart-header">
        <div className="cart-header-inner">
          <span className="cart-eyebrow">Your Order</span>
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ready for checkout</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cart-body">

        {loading && (
          <div className="cart-loading">
            <Spinner animation="border" />
            <span>Loading your cart…</span>
          </div>
        )}

        {!loading && cartItems.length === 0 && (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p>Your cart is empty</p>
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <div className="cart-table-card">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Company</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.cart_id}>
                      <td data-label="Medicine" className="td-name">{item.name}</td>
                      <td data-label="Company" className="td-company">{item.company}</td>
                      <td data-label="Price" className="td-price">{item.price} BDT</td>
                      <td data-label="Quantity">
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                            disabled={updatingId === item.cart_id || item.quantity <= 1}
                          >−</button>
                          <div className="qty-value">{item.quantity}</div>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                            disabled={updatingId === item.cart_id}
                          >+</button>
                        </div>
                      </td>
                      <td data-label="Total" className="td-total">{item.price * item.quantity} BDT</td>
                      <td data-label="Actions">
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.cart_id)}
                          disabled={updatingId === item.cart_id}
                        >Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── SUMMARY ── */}
            <div className="cart-summary">
              <div>
                <div className="cart-total-label">Grand Total</div>
                <div className="cart-total-value">{grandTotal} <span>BDT</span></div>
              </div>
              <button className="checkout-btn" onClick={checkout}>
                <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}