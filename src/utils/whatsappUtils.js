export const generateWhatsAppBillLink = (customer, transaction, billUrl = "") => {
  const baseUrl = billUrl || window.location.origin;
  const billPageUrl = `${baseUrl}/bill/${transaction.id}`;
  
  const total = transaction.totals?.total || transaction.total || 0;
  
  const message = `Dear ${customer.name},\n\nHere is your invoice from *GREAT LOOK Professional Unisex Studio* for a total of *₹${total.toFixed(2)}*.\n\nTo view your bill in detail, click here:\n${billPageUrl}\n\nThank you for your business! 🙏`;
  
  const encodedMessage = encodeURIComponent(message);
  let phone = customer.phone?.replace(/\D/g, "") || "";
  if (!phone.startsWith("91")) phone = "91" + phone;
  
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const sendBillViaWhatsApp = (customer, transaction, billUrl = "") => {
  const link = generateWhatsAppBillLink(customer, transaction, billUrl);
  window.open(link, "_blank", "noopener,noreferrer");
};
