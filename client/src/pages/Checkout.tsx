import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import ApiClient from "../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
const apiClient = new ApiClient();

interface CartItem {
  cart_id: number;
  medicine_id: number;
  name: string;
  price: number;
  quantity: number;
  pharmacy_id: number;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "pickup">("home_delivery");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const fetchCart = async () => {
    try {
      const res = await apiClient.getCart();
      setCartItems(res || []);
    } catch {
      toast.error("Failed to load cart");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryType === "home_delivery" ? 50 : 0;
  const grandTotal = totalPrice + deliveryCharge;

  const isValidPhone = (value: string) => /^01\d{9}$/.test(value);

  const placeOrder = async () => {
    if (!customerName || !phone || !address) return toast.error("Fill all fields");
    if (!isValidPhone(phone)) return toast.error("Please enter a valid phone number (11 digits, starts with 01)");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    const pharmacyId = cartItems[0]?.pharmacy_id;
    if (!pharmacyId) return toast.error("Could not determine pharmacy. Please try again.");

    setPlacingOrder(true);

    try {
      // ── COD path ──
      if (paymentMethod === "cod") {
        const data = await apiClient.post("/api/orders", {
          pharmacy_id: pharmacyId,
          delivery_type: deliveryType,
          recipient_name: customerName,
          phone,
          address,
          payment_type: "cod",
          items: cartItems.map(item => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity
          }))
        });
        await apiClient.clearCart();
        toast.success("Order placed! Pay on delivery.");
        navigate(`/invoice/${data.order_id}`);
        return;
      }

      // ── Stripe path ──
      if (!stripe || !elements) {
        toast.error("Stripe not loaded yet. Please wait.");
        setPlacingOrder(false);
        return;
      }

      const intentRes = await apiClient.post("/api/payment/create-intent", {
        amount: grandTotal,
      });
      const { client_secret, payment_intent_id } = intentRes;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Card element not found");
        setPlacingOrder(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: customerName },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setPlacingOrder(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const data = await apiClient.post("/api/orders", {
          pharmacy_id: pharmacyId,
          delivery_type: deliveryType,
          recipient_name: customerName,
          phone,
          address,
          payment_type: "stripe",
          stripe_payment_intent_id: payment_intent_id,
          items: cartItems.map(item => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity
          }))
        });
        await apiClient.clearCart();
        toast.success("Payment successful! Order placed.");
        navigate(`/invoice/${data.order_id}`);
      }

    } catch (error: any) {
      toast.error(error?.message || "Failed to place order");
    }

    setPlacingOrder(false);
  };

  if (loading) return (
    <div className="checkout-loading">
      <Spinner animation="border" />
      <span>Loading your order…</span>
    </div>
  );

  if (cartItems.length === 0) return (
    <div className="checkout-empty">
      <span className="checkout-empty-icon">🛒</span>
      <p>Your cart is empty</p>
    </div>
  );

  return (
    <div className="checkout-root">

      {/* ── HEADER ── */}
      <div className="checkout-header">
        <div className="checkout-header-inner">
          <span className="checkout-eyebrow">Almost there</span>
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Review your order and confirm your details below.</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="checkout-body">
        <div className="checkout-grid">

          {/* LEFT – form */}
          <div className="checkout-left">

            {/* Customer Info */}
            <div className="co-card">
              <div className="co-card-heading">
                <div className="co-card-icon">👤</div>
                <h3>Customer Information</h3>
              </div>

              <div className="co-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mushfiqur Rahman"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="co-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="co-field">
                <label>Delivery Address</label>
                <textarea
                  placeholder="Enter your full delivery address…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div className="co-card">
              <div className="co-card-heading">
                <div className="co-card-icon">🚚</div>
                <h3>Delivery Method</h3>
              </div>

              <div className="delivery-options">
                <div
                  className={`delivery-option ${deliveryType === "home_delivery" ? "selected" : ""}`}
                  onClick={() => setDeliveryType("home_delivery")}
                >
                  <div className="delivery-radio" />
                  <div className="delivery-info">
                    <div className="delivery-label">Home Delivery</div>
                    <div className="delivery-sub">Delivered to your door</div>
                  </div>
                  <div className="delivery-price">+50 BDT</div>
                </div>

                <div
                  className={`delivery-option ${deliveryType === "pickup" ? "selected" : ""}`}
                  onClick={() => setDeliveryType("pickup")}
                >
                  <div className="delivery-radio" />
                  <div className="delivery-info">
                    <div className="delivery-label">Self Pickup</div>
                    <div className="delivery-sub">Collect from the pharmacy</div>
                  </div>
                  <div className="delivery-price free">Free</div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="co-card">
              <div className="co-card-heading">
                <div className="co-card-icon">💳</div>
                <h3>Payment Method</h3>
              </div>

              <div className="delivery-options">
                <div
                  className={`delivery-option ${paymentMethod === "stripe" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("stripe")}
                >
                  <div className="delivery-radio" />
                  <div className="delivery-info">
                    <div className="delivery-label">Pay by Card</div>
                    <div className="delivery-sub">Visa, Mastercard via Stripe</div>
                  </div>
                  <div className="delivery-price">Secure</div>
                </div>

                <div
                  className={`delivery-option ${paymentMethod === "cod" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className="delivery-radio" />
                  <div className="delivery-info">
                    <div className="delivery-label">Cash on Delivery</div>
                    <div className="delivery-sub">Pay when you receive</div>
                  </div>
                  <div className="delivery-price free">COD</div>
                </div>
              </div>

              {paymentMethod === "stripe" && (
                <div className="co-field" style={{ marginTop: "16px" }}>
                  <label>Card Details</label>
                  <div className="stripe-card-wrapper">
                    <CardElement options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#1a1a1a",
                          "::placeholder": { color: "#9ca3af" },
                        },
                        invalid: { color: "#ef4444" },
                      },
                    }} />
                  </div>
                  <p className="stripe-note">
                    Test card: 4242 4242 4242 4242 · Any future date · Any CVC
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT – order summary */}
          <div className="checkout-right">
            <div className="co-card co-summary">
              <div className="co-card-heading">
                <div className="co-card-icon">🧾</div>
                <h3>Order Summary</h3>
              </div>

              <div className="summary-items">
                {cartItems.map(item => (
                  <div className="summary-item" key={item.cart_id}>
                    <div className="summary-item-left">
                      <div className="summary-item-name">{item.name}</div>
                      <div className="summary-item-qty">× {item.quantity}</div>
                    </div>
                    <div className="summary-item-total">{item.price * item.quantity} BDT</div>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{totalPrice} BDT</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? "Free" : `${deliveryCharge} BDT`}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-grand">
                <span>Grand Total</span>
                <span className="grand-value">{grandTotal} <small>BDT</small></span>
              </div>

              {paymentMethod === "stripe" && (
                <p className="stripe-usd-note">
                  ≈ ${(grandTotal / 110).toFixed(2)} USD will be charged to your card
                </p>
              )}

              <button
                className="place-order-btn"
                onClick={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    {paymentMethod === "stripe" ? " Processing payment…" : " Placing Order…"}
                  </>
                ) : (
                  <>
                    <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {paymentMethod === "stripe" ? "Pay & Place Order" : "Place Order (COD)"}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}