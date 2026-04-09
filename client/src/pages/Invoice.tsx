import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import ApiClient from "../api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "../styles/Invoice.css";

const apiClient = new ApiClient();

interface OrderItem {
  name: string;
  generic_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  delivery_type: string;
  delivery_charge: number;
  total_price: number;
  status: string;
  created_at: string;
}

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await apiClient.get(`/api/orders/${orderId}/invoice`);
        setOrder(res.order);
        setItems(res.items);
      } catch {
        toast.error("Failed to load invoice");
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [orderId]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const downloadPDF = () => {
    if (!order) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(10, 35, 66);
    doc.rect(0, 0, 210, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CareMeds", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(126, 200, 227);
    doc.text("Medicine Delivery Platform", 14, 26);

    // Invoice title
    doc.setTextColor(10, 35, 66);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice #${order.id}`, 14, 52);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(136, 153, 170);
    doc.text(formatDate(order.created_at), 14, 60);

    // Customer details
    doc.setTextColor(136, 153, 170);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", 14, 74);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(10, 35, 66);
    doc.setFontSize(10);
    doc.text(`Name: ${order.customer_name}`, 14, 82);
    doc.text(`Phone: ${order.phone}`, 14, 89);
    doc.text(`Address: ${order.address}`, 14, 96);
    doc.text(`Delivery: ${order.delivery_type === "home_delivery" ? "Home Delivery" : "Self Pickup"}`, 14, 103);

    // Table header
    doc.setFillColor(10, 35, 66);
    doc.rect(14, 112, 182, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Medicine", 16, 118);
    doc.text("Qty", 110, 118);
    doc.text("Unit Price", 130, 118);
    doc.text("Total", 168, 118);

    // Table rows
    let y = 128;
    doc.setFont("helvetica", "normal");
    items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(240, 244, 248);
        doc.rect(14, y - 5, 182, 9, "F");
      }
      doc.setTextColor(10, 35, 66);
      doc.text(item.name, 16, y);
      doc.text(String(item.quantity), 110, y);
      doc.text(`${item.price} BDT`, 130, y);
      doc.text(`${item.price * item.quantity} BDT`, 168, y);
      y += 10;
    });

    // Totals
    y += 6;
    doc.setTextColor(107, 127, 147);
    doc.setFontSize(10);
    const subtotal = order.total_price - order.delivery_charge;
    doc.text(`Subtotal: ${subtotal} BDT`, 140, y);
    y += 8;
    doc.text(`Delivery Charge: ${order.delivery_charge} BDT`, 140, y);
    y += 10;
    doc.setFillColor(10, 35, 66);
    doc.rect(130, y - 5, 66, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Total: ${order.total_price} BDT`, 133, y + 2);

    // Footer
    doc.setTextColor(136, 153, 170);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for using CareMeds. Get well soon!", 105, 285, { align: "center" });

    doc.save(`CareMeds-Invoice-${order.id}.pdf`);
  };

  if (loading) return (
    <div className="invoice-loading">
      <Spinner animation="border" />
      <span>Loading invoice…</span>
    </div>
  );

  if (!order) return (
    <div className="invoice-empty">
      <span>Invoice not found</span>
    </div>
  );

  const subtotal = order.total_price - order.delivery_charge;

  return (
    <div className="invoice-root">

      {/* ── HEADER ── */}
      <div className="invoice-page-header">
        <div className="invoice-page-header-inner">
          <span className="invoice-eyebrow">Order Confirmed 🎉</span>
          <h1 className="invoice-page-title">Your Invoice</h1>
          <p className="invoice-page-subtitle">
            A copy has been sent to your email. You can also download it below.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="invoice-body">

        {/* Action buttons */}
        <div className="invoice-actions">
          <button className="inv-btn-download" onClick={downloadPDF}>
            <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              viewBox="0 0 24 24" width="16" height="16" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <button className="inv-btn-home" onClick={() => navigate("/home")}>
            Back to Home
          </button>
        </div>

        {/* Invoice card */}
        <div className="invoice-card">

          {/* Invoice header */}
          <div className="inv-card-header">
            <div>
              <div className="inv-brand">Care<span>Meds</span></div>
              <div className="inv-brand-sub">Medicine Delivery Platform</div>
            </div>
            <div className="inv-header-right">
              <div className="inv-number">Invoice #{order.id}</div>
              <div className="inv-date">{formatDate(order.created_at)}</div>
              <div className={`inv-status-badge ${order.status}`}>{order.status}</div>
            </div>
          </div>

          {/* Customer info */}
          <div className="inv-section">
            <div className="inv-section-title">Customer Details</div>
            <div className="inv-info-grid">
              <div className="inv-info-item">
                <span className="inv-info-label">Name</span>
                <span className="inv-info-value">{order.customer_name}</span>
              </div>
              <div className="inv-info-item">
                <span className="inv-info-label">Phone</span>
                <span className="inv-info-value">{order.phone}</span>
              </div>
              <div className="inv-info-item">
                <span className="inv-info-label">Address</span>
                <span className="inv-info-value">{order.address}</span>
              </div>
              <div className="inv-info-item">
                <span className="inv-info-label">Delivery</span>
                <span className="inv-info-value">
                  {order.delivery_type === "home_delivery" ? "🚚 Home Delivery" : "🏪 Self Pickup"}
                </span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="inv-section">
            <div className="inv-section-title">Order Items</div>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Generic Name</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="inv-med-name">{item.name}</td>
                    <td className="inv-med-generic">{item.generic_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price} BDT</td>
                    <td className="inv-item-total">{item.price * item.quantity} BDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="inv-totals">
            <div className="inv-total-row">
              <span>Subtotal</span>
              <span>{subtotal} BDT</span>
            </div>
            <div className="inv-total-row">
              <span>Delivery Charge</span>
              <span>{order.delivery_charge === 0 ? "Free" : `${order.delivery_charge} BDT`}</span>
            </div>
            <div className="inv-total-divider" />
            <div className="inv-grand-row">
              <span>Grand Total</span>
              <span className="inv-grand-value">{order.total_price} <small>BDT</small></span>
            </div>
          </div>

          {/* Footer */}
          <div className="inv-card-footer">
            💊 Thank you for using CareMeds. Get well soon!
          </div>

        </div>
      </div>
    </div>
  );
}