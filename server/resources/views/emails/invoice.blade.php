<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #0a2342; margin: 0; padding: 0; }
    .header { background: #0a2342; color: white; padding: 30px 40px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #7ec8e3; }
    .body { padding: 30px 40px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase;
                     letter-spacing: 1.5px; color: #8899aa; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    thead tr { background: #0a2342; color: white; }
    thead th { padding: 10px 14px; text-align: left; font-size: 13px; }
    tbody tr { border-bottom: 1px solid #f0f4f8; }
    tbody td { padding: 10px 14px; font-size: 13px; }
    .totals { margin-top: 20px; text-align: right; }
    .totals p { margin: 4px 0; font-size: 14px; color: #6b7f93; }
    .grand { font-size: 20px; font-weight: bold; color: #0a2342; margin-top: 8px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #8899aa; padding: 20px; }
  </style>
</head>
<body>

  <div class="header">
    <h1>CareMeds</h1>
    <p>Medicine Delivery Platform</p>
  </div>

  <div class="body">
    <h2 style="margin-bottom: 4px;">Invoice #{{ $order->id }}</h2>
    <p style="color: #8899aa; font-size: 13px; margin-top: 0;">
      {{ \Carbon\Carbon::parse($order->created_at)->format('d M Y, h:i A') }}
    </p>

    <div style="margin-top: 24px;">
      <div class="section-title">Customer Details</div>
      <div class="info-row"><span>Name</span><span>{{ $order->customer_name }}</span></div>
      <div class="info-row"><span>Phone</span><span>{{ $order->phone }}</span></div>
      <div class="info-row"><span>Address</span><span>{{ $order->address }}</span></div>
      <div class="info-row"><span>Delivery Type</span>
        <span>{{ $order->delivery_type === 'home_delivery' ? 'Home Delivery' : 'Self Pickup' }}</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        @foreach($items as $item)
        <tr>
          <td>{{ $item->name }}</td>
          <td>{{ $item->quantity }}</td>
          <td>{{ $item->price }} BDT</td>
          <td>{{ $item->price * $item->quantity }} BDT</td>
        </tr>
        @endforeach
      </tbody>
    </table>

    <div class="totals">
      <p>Subtotal: {{ $order->total_price - $order->delivery_charge }} BDT</p>
      <p>Delivery Charge: {{ $order->delivery_charge }} BDT</p>
      <p class="grand">Grand Total: {{ $order->total_price }} BDT</p>
    </div>
  </div>

  <div class="footer">
    Thank you for using CareMeds. Get well soon! 💊
  </div>

</body>
</html>