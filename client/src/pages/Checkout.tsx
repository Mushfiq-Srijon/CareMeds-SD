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
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod" | "bkash" | "nagad">("cod");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mfsNumber, setMfsNumber] = useState(""); // bKash/Nagad number-er jonno state

  const fetchCart = async () => {
    try {
      const res = await apiClient.getCart();
      setCartItems(res || []);
    } catch {
      toast.error("Failed to load cart");
    }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryType === "home_delivery" ? 50 : 0;
  const grandTotal = totalPrice + deliveryCharge;

  const placeOrder = async () => {
    if (!customerName || !phone || !address) return toast.error("Fill all fields");
    
    // bKash/Nagad select korle number check
    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !mfsNumber) {
      return toast.error(`Please enter your ${paymentMethod} number`);
    }

    const pharmacyId = cartItems[0]?.pharmacy_id;
    setPlacingOrder(true);

    try {
      let data;
      if (paymentMethod !== "stripe") {
        data = await apiClient.post("/api/orders", {
          pharmacy_id: pharmacyId,
          delivery_type: deliveryType,
          recipient_name: customerName,
          phone,
          address,
          payment_type: paymentMethod,
          mfs_number: mfsNumber, // Backend-e number pathano
          items: cartItems.map(item => ({ medicine_id: item.medicine_id, quantity: item.quantity }))
        });
      } else {
        if (!stripe || !elements) return;
        const intentRes = await apiClient.post("/api/payment/create-intent", { amount: grandTotal });
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const { error, paymentIntent } = await stripe.confirmCardPayment(intentRes.client_secret, {
          payment_method: { card: cardElement, billing_details: { name: customerName } },
        });

        if (error) throw new Error(error.message);
        if (paymentIntent?.status === "succeeded") {
          data = await apiClient.post("/api/orders", {
            pharmacy_id: pharmacyId,
            delivery_type: deliveryType,
            recipient_name: customerName,
            phone,
            address,
            payment_type: "stripe",
            stripe_payment_intent_id: intentRes.payment_intent_id,
            items: cartItems.map(item => ({ medicine_id: item.medicine_id, quantity: item.quantity }))
          });
        }
      }

      if (data) {
        await apiClient.clearCart();
        toast.success("Order successful!");
        const finalId = data.order_id || data.id; 
        navigate(`/invoice/${finalId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="checkout-loading"><Spinner animation="border" /></div>;

  return (
    <div className="checkout-root">
      <div className="checkout-header">
        <div className="checkout-header-inner">
          <span className="checkout-eyebrow">Review your details</span>
          <h1 className="checkout-title">Checkout</h1>
        </div>
      </div>

      <div className="checkout-body">
        <div className="checkout-grid">
          <div className="checkout-left">
            <div className="co-card">
              <div className="co-card-heading"><div className="co-card-icon">👤</div><h3>Customer Information</h3></div>
              <div className="co-field"><label>Full Name</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
              <div className="co-field"><label>Phone Number</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div className="co-field"><label>Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} /></div>
            </div>

            <div className="co-card">
              <div className="co-card-heading"><div className="co-card-icon">🚚</div><h3>Delivery Method</h3></div>
              <div className="delivery-options">
                <div className={`delivery-option ${deliveryType === "home_delivery" ? "selected" : ""}`} onClick={() => setDeliveryType("home_delivery")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">Home Delivery</div></div>
                </div>
                <div className={`delivery-option ${deliveryType === "pickup" ? "selected" : ""}`} onClick={() => setDeliveryType("pickup")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">Self Pickup</div></div>
                </div>
              </div>
            </div>

            <div className="co-card">
              <div className="co-card-heading"><div className="co-card-icon">💳</div><h3>Payment Method</h3></div>
              <div className="payment-grid-custom">
                <div className={`delivery-option ${paymentMethod === "bkash" ? "selected" : ""}`} onClick={() => setPaymentMethod("bkash")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">bKash</div></div>
                </div>
                <div className={`delivery-option ${paymentMethod === "nagad" ? "selected" : ""}`} onClick={() => setPaymentMethod("nagad")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">Nagad</div></div>
                </div>
                <div className={`delivery-option ${paymentMethod === "stripe" ? "selected" : ""}`} onClick={() => setPaymentMethod("stripe")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">Card Payment</div></div>
                </div>
                <div className={`delivery-option ${paymentMethod === "cod" ? "selected" : ""}`} onClick={() => setPaymentMethod("cod")}>
                  <div className="delivery-radio" /><div className="delivery-info"><div className="delivery-label">Cash on Delivery</div></div>
                </div>
              </div>

              {/* Dynamic bKash/Nagad Number Field */}
              {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                <div className="co-field" style={{ marginTop: "20px" }}>
                  <label>{paymentMethod === "bkash" ? "bKash" : "Nagad"} Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 017XXXXXXXX" 
                    value={mfsNumber} 
                    onChange={e => setMfsNumber(e.target.value)} 
                    className="mfs-input"
                  />
                </div>
              )}

              {paymentMethod === "stripe" && (
                <div className="co-field" style={{ marginTop: "20px" }}>
                  <label>Card Details</label>
                  <div className="stripe-card-wrapper"><CardElement /></div>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-right">
            <div className="co-card co-summary">
              <div className="summary-grand"><span>Total</span><span className="grand-value">{grandTotal} <small>BDT</small></span></div>
              <button className="place-order-btn" onClick={placeOrder} disabled={placingOrder}>
                {placingOrder ? "Processing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return ( <Elements stripe={stripePromise}><CheckoutForm /></Elements> );
}