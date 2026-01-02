import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to allow callback to finish
    setTimeout(() => {
      navigate("/user-dashboard");
    }, 2000);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
      <p>Updating your balance...</p>
    </div>
  );
}
