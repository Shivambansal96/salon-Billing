import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function BillPage() {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      setLoading(true);
      try {
        const txData = await window.storage.get(transactionId, false);

        if (!txData || !txData.value) {
          setTransaction(null);
          setCustomer(null);
        } else {
          const tx =
            typeof txData.value === "string"
              ? JSON.parse(txData.value)
              : txData.value;

          setTransaction(tx);

          if (tx.customerId) {
            const customerData = await window.storage.get(tx.customerId, false);
            if (customerData?.value) {
              setCustomer(
                typeof customerData.value === "string"
                  ? JSON.parse(customerData.value)
                  : customerData.value
              );
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  const getServices = (tx) =>
    Array.isArray(tx?.services)
      ? tx.services
      : Array.isArray(tx?.items)
        ? tx.items
        : [];

  const getTotal = (tx) =>
    tx?.totals?.total || tx?.total || tx?.amount || 0;

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (!transaction)
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h5">Bill not found</Typography>
      </Box>
    );

  const services = getServices(transaction);

  // Membership detection
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

  // Payment Mode
  const paymentMode = transaction?.paymentMode || "Cash";

  // Membership Cost
  const membershipCost = transaction?.totals?.membershipCost || 0;
  const purchasedMembership = transaction?.purchasedMembership;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/salon-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1,
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: "1rem",
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(6px)",
            boxShadow: 4,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <img
              src="/GL_logoNoBg.png"
              alt="Salon Logo"
              style={{ width: "120px", marginBottom: "10px" }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Great Look Professional Unisex Studio
            </Typography>
          </Box>

          {/* Bill Details */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle2">
              Invoice No: <strong>{transaction.id}</strong>
            </Typography>

            <Typography variant="subtitle2">
              Date:{" "}
              <strong>{new Date(transaction.date).toLocaleString("en-IN")}</strong>
            </Typography>
          </Box>

          {/* Customer */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              Name: <strong>{customer?.name || transaction.customerName}</strong>
            </Typography>
            <Typography variant="subtitle2">
              Phone:{" "}
              <strong>{customer?.phone || transaction.phoneNumber || "N/A"}</strong>
            </Typography>

            {hasMembership && (
              <Typography variant="subtitle2" sx={{ color: "#10b981", mt: 1 }}>
                Membership: <strong>{membershipName}</strong>
              </Typography>
            )}
          </Box>

          {/* SERVICES TABLE */}
          <Box sx={{ mb: 3 }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Services
            </Typography>

            <Box
              sx={{
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  // gridTemplateColumns: "1.3fr 1fr 1fr 0.6fr",
                  gridTemplateColumns: "1.5fr 1.3fr 1fr 0.6fr",
                  backgroundColor: "#f3f4f6",
                  p: 1,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                <span>Service</span>
                <span>Category</span>
                <span>Staff</span>
                <span >Price</span>
              </Box>

              {/* Rows */}
              {services.map((srv, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1.3fr 1fr 0.6fr",
                    p: 1,
                    fontSize: "0.85rem",
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                    borderBottom:
                      idx === services.length - 1
                        ? "none"
                        : "1px solid #e5e7eb",
                  }}
                >
                  <span>{srv.serviceName}</span>

                  <span style={{ color: "#6b7280" }}>
                    {srv.category || "—"}
                  </span>

                  <span style={{ color: "#374151" }}>
                    {srv.staffName || "—"}
                  </span>

                  <span
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    ₹{srv.price}
                  </span>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Membership Purchase */}
          {membershipCost > 0 && purchasedMembership && (
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#8b5cf6",
                textAlign: "right",
                mb: 1,
              }}
            >
              Membership Purchase ({purchasedMembership.name}): ₹{membershipCost.toFixed(2)}
            </Typography>
          )}

          {/* Membership Savings Row */}
          {amountSaved > 0 && (
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#0ea5e9",
                textAlign: "right",
                mb: 1,
              }}
            >
              Membership Savings: ₹{amountSaved.toFixed(2)}
            </Typography>
          )}

          {/* Payment Mode */}
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#444",
              textAlign: "right",
              mb: 1,
            }}
          >
            Payment Mode: {paymentMode}
          </Typography>

          {/* Total */}
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#10b981",
              textAlign: "right",
            }}
          >
            Total: ₹{getTotal(transaction).toFixed(2)}
          </Typography>
        </Box>

        {/* Print Button */}
        <Button
          variant="contained"
          sx={{ mt: 3, width: "100%", py: 1.3 }}
          startIcon={<Printer />}
          onClick={() => window.print()}
        >
          Print Invoice
        </Button>
      </Container>
    </Box>
  );
}

export default BillPage;
