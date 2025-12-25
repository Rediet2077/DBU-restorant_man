import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tx_ref = searchParams.get("tx_ref");

  useEffect(() => {
    if (!tx_ref) {
      alert("Transaction reference missing");
      navigate("/user-dashboard");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await axios.get(
          `http://localhost/dbu-api/verify_payment.php?tx_ref=${tx_ref}`
        );

        if (res.data.status === "success") {
          alert("Payment successful! Your balance has been updated.");
        } else {
          alert("Payment failed or canceled.");
        }
      } catch (err) {
        console.error(err);
        alert("Error verifying payment");
      } finally {
        navigate("/user-dashboard"); // Redirect back to dashboard
      }
    };

    verifyPayment();
  }, [tx_ref, navigate]);

  return <div className="flex items-center justify-center h-screen">Processing payment...</div>;
}

export default PaymentCallback;
