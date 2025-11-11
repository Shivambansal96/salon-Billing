import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function BillPage() {
  const { transactionId } = useParams();
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        let tx = null;
        let cust = null;

        // ✅ First, try to get data from URL parameter (for shared links)
        const dataParam = searchParams.get('data');
        if (dataParam) {
          try {
            tx = JSON.parse(decodeURIComponent(dataParam));
            console.log('✅ Loaded bill data from URL parameter');
          } catch (err) {
            console.warn('Could not parse URL data:', err);
          }
        }

        // ✅ If no URL data, try to get from localStorage (same device)
        if (!tx) {
          try {
            const txData = await window.storage.get(transactionId, false);
            if (txData?.value) {
              tx = typeof txData.value === "string"
                ? JSON.parse(txData.value)
                : txData.value;
              console.log('✅ Loaded bill data from localStorage');
            }
          } catch (err) {
            console.warn('Could not load from localStorage:', err);
          }
        }

        // ✅ If still no transaction, show error
        if (!tx) {
          setError('Bill not found. This link may have expired or is invalid.');
          setTransaction(null);
          setCustomer(null);
          return;
        }

        setTransaction(tx);

        // ✅ Try to load customer data
        if (tx.customerId) {
          try {
            const customerData = await window.storage.get(tx.customerId, false);
            if (customerData?.value) {
              cust = typeof customerData.value === "string"
                ? JSON.parse(customerData.value)
                : customerData.value;
              setCustomer(cust);
              console.log('✅ Loaded customer data from localStorage');
            }
          } catch (err) {
            console.warn('Could not load customer:', err);
            // Use customer info from transaction if localStorage fails
            if (tx.customerName) {
              setCustomer({
                name: tx.customerName,
                phone: tx.phoneNumber,
                dob: tx.dob
              });
            }
          }
        } else if (tx.customerName) {
          // Create minimal customer object from transaction
          setCustomer({
            name: tx.customerName,
            phone: tx.phoneNumber,
            dob: tx.dob
          });
        }
      } catch (err) {
        console.error('Error loading transaction:', err);
        setError('An error occurred while loading the bill.');
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId, searchParams]);




  
  const getServices = (tx) =>
    Array.isArray(tx?.services)
      ? tx.services
      : Array.isArray(tx?.items)
      ? tx.items
      : [];

  const getTotal = (tx) =>
    tx?.totals?.total || tx?.total || tx?.amount || 0;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container maxWidth="sm">
          <Box sx={{ p: 3, borderRadius: "1rem", bgcolor: "#fee2e2", border: "2px solid #dc2626" }}>
            <Typography variant="h5" sx={{ color: "#dc2626", fontWeight: 700, mb: 2 }}>
              ⚠️ Error
            </Typography>
            <Typography sx={{ color: "#991b1b" }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box sx={{ textAlign: "center", py: 4, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h5">Bill not found</Typography>
      </Box>
    );
  }

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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
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
              Name: <strong>{customer?.name || transaction.customerName || "Walk-in Customer"}</strong>
            </Typography>
            {(customer?.phone || transaction.phoneNumber) && (
              <Typography variant="subtitle2">
                Phone:{" "}
                <strong>{customer?.phone || transaction.phoneNumber}</strong>
              </Typography>
            )}

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
                  gridTemplateColumns: "1.3fr 1fr 1fr 0.6fr",
                  backgroundColor: "#f3f4f6",
                  p: 1,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                <span>Service</span>
                <span>Staff</span>
                <span>Category</span>
                <span style={{ textAlign: "right" }}>Price</span>
              </Box>

              {/* Rows */}
              {services.length > 0 ? (
                services.map((srv, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1fr 1fr 0.6fr",
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

                    <span style={{ color: "#374151" }}>
                      {srv.staffName || "—"}
                    </span>

                    <span style={{ color: "#6b7280" }}>
                      {srv.category || "—"}
                    </span>

                    <span
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      ₹{srv.price}
                    </span>
                  </Box>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: "center", color: "#6b7280" }}>
                  No services found
                </Box>
              )}
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

          {/* Divider */}
          <Box sx={{ my: 2, borderTop: "2px solid #e5e7eb" }} />

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

          {/* Footer */}
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Thank you for your business! ✨
            </Typography>
          </Box>
        </Box>

        {/* Print Button */}
        <Button
          variant="contained"
          sx={{ mt: 3, width: "100%", py: 1.3 }}
          onClick={() => window.print()}
        >
          🖨️ Print Invoice
        </Button>

        {/* Back Button */}
        <Button
          variant="outlined"
          sx={{ mt: 1, width: "100%", py: 1.3 }}
          onClick={() => window.history.back()}
        >
          ← Go Back
        </Button>
      </Container>
    </Box>
  );
}

export default BillPage;
