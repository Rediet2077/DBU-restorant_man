import axios from "axios";

function Payment() {
  const payNow = async () => {
    try {
      const res = await axios.post(
        "http://localhost/chapa-backend/initiate_payment.php",
        {
          amount: 100,
          email: "test@gmail.com",
          name: "Test User",
        }
      );

      window.location.href = res.data.data.checkout_url;
    } catch (error) {
      alert("Payment failed");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Pay with Chapa</h2>
      <button onClick={payNow}>Pay Now</button>
    </div>
  );
}

export default Payment;
