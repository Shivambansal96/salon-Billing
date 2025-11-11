/**
 * Bill HTML Export Utility
 * Generates a self-contained HTML file from transaction data
 * Can be sent via WhatsApp or email
 */

export const generateBillHTML = (transaction, customer) => {
    const getServices = (tx) =>
        Array.isArray(tx?.services)
            ? tx.services
            : Array.isArray(tx?.items)
                ? tx.items
                : [];

    const getTotal = (tx) =>
        tx?.totals?.total || tx?.total || tx?.amount || 0;

    const services = getServices(transaction);
    const hasMembership = transaction?.membership || customer?.membershipOwned;
    const membershipName =
        transaction?.membership ||
        customer?.membershipOwned?.membershipName ||
        null;

    const amountSaved =
        transaction?.totals?.amountSaved &&
            transaction.totals.amountSaved > 0
            ? transaction.totals.amountSaved
            : 0;

    const paymentMode = transaction?.paymentMode || "Cash";
    const membershipCost = transaction?.totals?.membershipCost || 0;
    const purchasedMembership = transaction?.purchasedMembership;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bill - ${transaction.id || 'Invoice'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 30px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }

        .logo {
            width: 120px;
            height: auto;
            margin: 0 auto 15px;
            display: block;
        }

        .salon-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
        }

        .bill-details {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }

        .detail-item {
            flex: 1;
            min-width: 150px;
        }

        .detail-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .detail-value {
            color: #1f2937;
            font-weight: 600;
            margin-top: 5px;
        }

        .customer-section {
            margin-bottom: 25px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .customer-section h3 {
            font-size: 14px;
            color: #374151;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .customer-info {
            font-size: 14px;
            line-height: 1.6;
        }

        .customer-info p {
            margin-bottom: 5px;
        }

        .customer-info strong {
            color: #1f2937;
        }

        .membership-badge {
            color: #10b981;
            font-weight: 600;
            margin-top: 8px;
        }

        .services-section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .services-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
        }

        .services-table thead {
            background: #f3f4f6;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .services-table th {
            padding: 12px;
            text-align: left;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }

        .services-table th:last-child {
            text-align: right;
        }

        .services-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
        }

        .services-table tbody tr:last-child td {
            border-bottom: none;
        }

        .services-table tbody tr:nth-child(even) {
            background: #fafafa;
        }

        .service-name {
            color: #1f2937;
            font-weight: 500;
        }

        .staff-name {
            color: #6b7280;
        }

        .category {
            color: #6b7280;
            font-size: 12px;
        }

        .price {
            color: #1f2937;
            font-weight: 600;
            text-align: right;
        }

        .summary-section {
            margin-bottom: 25px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
        }

        .summary-label {
            color: #6b7280;
        }

        .summary-value {
            color: #1f2937;
            font-weight: 600;
        }

        .membership-purchase {
            color: #8b5cf6;
            font-weight: 600;
        }

        .savings {
            color: #0ea5e9;
            font-weight: 600;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .total-label {
            font-size: 16px;
            color: white;
            font-weight: 700;
        }

        .total-amount {
            font-size: 24px;
            color: white;
            font-weight: 700;
        }

        .footer {
            text-align: center;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 13px;
        }

        .footer p {
            margin-bottom: 5px;
        }

        .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        }

        button {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-print {
            background: #3b82f6;
            color: white;
        }

        .btn-print:hover {
            background: #2563eb;
        }

        .btn-download {
            background: #10b981;
            color: white;
        }

        .btn-download:hover {
            background: #059669;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
                max-width: 100%;
                padding: 20px;
            }

            .action-buttons {
                display: none;
            }
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            .bill-details {
                flex-direction: column;
            }

            .services-table {
                font-size: 12px;
            }

            .services-table th,
            .services-table td {
                padding: 8px;
            }

            .total-amount {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="salon-name">Great Look Professional Unisex Studio</div>
        </div>

        <!-- Bill Details -->
        <div class="bill-details">
            <div class="detail-item">
                <div class="detail-label">Invoice No</div>
                <div class="detail-value">${transaction.id || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${new Date(transaction.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</div>
            </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
            <h3>Customer Details</h3>
            <div class="customer-info">
                <p><strong>Name:</strong> ${customer?.name || transaction.customerName || 'Walk-in Customer'}</p>
                ${(customer?.phone || transaction.phoneNumber) ? `<p><strong>Phone:</strong> ${customer?.phone || transaction.phoneNumber}</p>` : ''}
                ${(customer?.dob || transaction.dob) ? `<p><strong>DOB:</strong> ${customer?.dob || transaction.dob}</p>` : ''}
                ${hasMembership ? `<p class="membership-badge">✓ Member: ${membershipName}</p>` : ''}
            </div>
        </div>

        <!-- Services Section -->
        <div class="services-section">
            <h3 class="section-title">Services</h3>
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Staff</th>
                        <th>Category</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${services.length > 0 ? services.map(srv => `
                        <tr>
                            <td class="service-name">${srv.serviceName || 'N/A'}</td>
                            <td class="staff-name">${srv.staffName || '—'}</td>
                            <td class="category">${srv.category || '—'}</td>
                            <td class="price">₹${srv.price?.toFixed(2) || '0.00'}</td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="text-align: center; color: #9ca3af;">No services found</td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
            ${membershipCost > 0 && purchasedMembership ? `
                <div class="summary-row">
                    <span class="summary-label">Membership Purchase (${purchasedMembership.name})</span>
                    <span class="membership-purchase">₹${membershipCost.toFixed(2)}</span>
                </div>
            ` : ''}

            ${amountSaved > 0 ? `
                <div class="summary-row">
                    <span class="summary-label">Membership Savings</span>
                    <span class="savings">-₹${amountSaved.toFixed(2)}</span>
                </div>
            ` : ''}

            <div class="summary-row">
                <span class="summary-label">Payment Mode</span>
                <span class="summary-value">${paymentMode}</span>
            </div>
        </div>

        <!-- Total -->
        <div class="total-row">
            <span class="total-label">Total Amount</span>
            <span class="total-amount">₹${getTotal(transaction).toFixed(2)}</span>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your business! ✨</p>
            <p>For any queries, contact us</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
            <button class="btn-print" onclick="window.print()">🖨️ Print</button>
            <button class="btn-download" onclick="downloadHTML()">⬇️ Download</button>
        </div>
    </div>

    <script>
        function downloadHTML() {
            const html = document.documentElement.outerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bill-${transaction.id || 'invoice'}.html';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    </script>
</body>
</html>`;

    return html;
};

/**
 * Download bill as HTML file
 */
export const downloadBillAsHTML = (transaction, customer) => {
    const html = generateBillHTML(transaction, customer);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bill-\${transaction.id || 'invoice'}.html `;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Generate data URL for HTML (can be sent via WhatsApp)
 */
export const generateBillDataURL = (transaction, customer) => {
  const html = generateBillHTML(transaction, customer);
  const encoded = encodeURIComponent(html);
  return `data:text/html;charset=utf-8,\${encoded}`;
};