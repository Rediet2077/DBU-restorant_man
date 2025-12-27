import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFileContract, FaCommentDots, FaClock, FaMapMarkerAlt, FaUtensils, FaSeedling, FaPizzaSlice } from "react-icons/fa";
import { MdFastfood, MdLocalCafe, MdRestaurantMenu } from "react-icons/md";
import {
  getContractsFromStorage,
  saveContractsToStorage,
  getFeedbacksFromStorage,
  saveFeedbacksToStorage
} from "../../services/storageService";
import axios from "axios";

// ===================== API CONFIG =====================
const API_BASE = "http://localhost/DBU-APII/dbu-api";

// --- CAFETERIA INFO ---
const CAFETERIA_INFO = [
  {
    id: "abay",
    name: "Female launch",
    description: "Serving all-day meals for female students. Located in the women's dorm area.",
    status: "open",
    hours: "7:00 AM - 9:00 PM",
    specialties: [{name: "Injera", icon: FaUtensils}, {name: "Shiro", icon: FaSeedling}, {name: "Chechebsa", icon: MdLocalCafe}]
  },
  {
    id: "tana",
    name: " Male launch",
    description: "Traditional Ethiopian cuisine and quick service for male students.",
    status: "open",
    hours: "7:00 AM - 9:00 PM",
    specialties: [{name: "Doro Wot", icon: FaUtensils}, {name: "Kitfo", icon: MdFastfood}, {name: "Tibs", icon: FaPizzaSlice}]
  },
  {
    id: "guna",
    name: "Megenagna",
    description: "The main campus hub for lunch and dinner. Variety of international options.",
    status: "open",
    hours: "11:00 AM - 9:00 PM",
    specialties: [{name: "Pasta", icon: FaPizzaSlice}, {name: "Pizza", icon: FaPizzaSlice}, {name: "Burger", icon: MdFastfood}]
  },
  {
    id: "megezez",
    name: "Megezez (Academic)",
    description: "Quick lunch and coffee spot located within the academic building.",
    status: "open",
    hours: "8:00 AM - 6:00 PM",
    specialties: [{name: "Sandwiches", icon: MdFastfood}, {name: "Salads", icon: FaSeedling}, {name: "Coffee", icon: MdLocalCafe}]
  },
  {
    id: "marcan",
    name: "Marcan",
    description: "Healthy breakfast and lunch near the sports facilities.",
    status: "open",
    hours: "7:00 AM - 2:00 PM",
    specialties: [{name: "Breakfast", icon: MdLocalCafe}, {name: "Smoothies", icon: FaSeedling}, {name: "Energy Bars", icon: MdFastfood}]
  }
];

const Service = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCafe, setSelectedCafe] = useState("");
  const [showContract, setShowContract] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [contractSuccess, setContractSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountInfo, setAccountInfo] = useState("");
  const [feedback, setFeedback] = useState({
    orderId: "",
    rating: "",
    accuracy: "",
    timeliness: "",
    comment: "",
  });

  const handleCafeSelect = (e) => setSelectedCafe(e.target.value);

  const handleViewMenu = (e) => {
    e.preventDefault();
    navigate(`/cafe-menu/${selectedCafe}`);
  };

  const showMainMenu = () => {
    setShowContract(false);
    setShowFeedback(false);
    setContractSuccess(false);
    setPaymentMethod("");
    setAccountInfo("");
    // Clear URL params if needed
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // --- Chapa Payment Logic ---

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const txRef = query.get("tx_ref");
    
    if (txRef && (status === "success" || status === "chapa-success")) {
      window.history.replaceState(null, "", location.pathname);
      verifyChapaContract(txRef);
    }
  }, [location]);

  const initializeChapaPayment = async (contractData) => {
    try {
      const tx_ref = `tx-contract-${Date.now()}`;
      const return_url = `${window.location.origin}/service?status=success&tx_ref=${tx_ref}`;

      const chapaPayload = {
        amount: contractData.amount,
        currency: "ETB",
        email: "student@dbu.edu.et",
        first_name: contractData.firstName,
        last_name: contractData.lastName,
        phone_number: contractData.phone,
        tx_ref: tx_ref,
        callback_url: "https://api.chapa.co/v1/transaction/verify/" + tx_ref,
        return_url: return_url,
        customization: {
          title: "DBU Dining Contract",
          description: "Payment for meal plan contract",
        },
      };

      const response = await axios.post(`${API_BASE}/initialize_chapa.php`, chapaPayload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;

      if (data.status === "success" && data.data && data.data.checkout_url) {
        sessionStorage.setItem("temp_contract", JSON.stringify({
          ...contractData,
          id: Date.now(),
          paymentStatus: "Pending via Chapa",
          tx_ref: tx_ref,
        }));
        window.location.href = data.data.checkout_url;
      } else {
        alert("Failed to initialize Chapa payment: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Chapa Initialization Error:", error);
      alert("Failed to initialize Chapa payment. Please inspect console or try again.");
    }
  };

  const verifyChapaContract = async (txRef) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/verify_chapa.php?tx_ref=${txRef}`, { method: "GET" });
      const verifyData = await verifyRes.json();

      if (verifyData.status === "success") {
        const tempContract = sessionStorage.getItem("temp_contract");
        if (tempContract) {
          const contractData = JSON.parse(tempContract);
          const finalizedContract = {
            ...contractData,
            paymentStatus: "Paid via Chapa",
          };
          const contracts = getContractsFromStorage();
          saveContractsToStorage([...contracts, finalizedContract]);
          sessionStorage.removeItem("temp_contract");
          setContractSuccess(true);
          setShowContract(false);
          setTimeout(() => showMainMenu(), 3000);
        }
      } else {
        alert("Payment verification failed.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      alert("Error verifying payment.");
    }
  };

  const handleSubmitContract = (e) => {
    e.preventDefault();

    // Use FormData to get values from inputs
    const formData = new FormData(e.target);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const idNumber = formData.get("idNumber");
    const phone = formData.get("phone");
    const amount = formData.get("amount");

    const newContract = {
      id: Date.now(),
      firstName: firstName || "",
      lastName: lastName || "",
      idNumber: idNumber || "",
      phone: phone || "",
      amount: amount || "",
      paymentMethod,
      accountInfo: paymentMethod === "Chapa" ? "Chapa Online Payment" : accountInfo,
      date: new Date().toISOString()
    };

    if (paymentMethod === "Chapa") {
        initializeChapaPayment(newContract);
        return;
    }

    const contracts = getContractsFromStorage();
    saveContractsToStorage([...contracts, newContract]);
    setContractSuccess(true);
    setShowContract(false);

    setTimeout(() => showMainMenu(), 2000);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();

    const feedbacks = getFeedbacksFromStorage();
    const newFeedback = { ...feedback, id: Date.now() };
    saveFeedbacksToStorage([...feedbacks, newFeedback]);

    alert("Thank you! Your feedback has been submitted.");

    setShowFeedback(false);
    setFeedback({
      orderId: "",
      rating: "",
      accuracy: "",
      timeliness: "",
      comment: "",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "open") {
      return <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-md">Open Now</span>;
    }
    return null;
  };

  const handleCafeteriaClick = (cafeteriaId) => {
    sessionStorage.setItem("selectedCafeteria", cafeteriaId);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 mt-3 text-center text-green-500">
          🍽️ Campus Dining Service
        </h1>
        <p className="text-center text-gray-500 mb-6 max-w-3xl mx-auto text-lg">
          Explore our vibrant campus cafeterias. Click **View Menu** to start your order!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {CAFETERIA_INFO.map((cafeteria) => (
            <div 
              key={cafeteria.id} 
              className="bg-white rounded-2xl shadow-2xl border-t-8 border-gray-500 overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1"
            >
             
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <MdRestaurantMenu className="text-4xl text-gray-600" />
                  {getStatusBadge(cafeteria.status)}
                </div>
                
                <h3 className="text-2xl font-bold mb-1 text-gray-800">{cafeteria.name}</h3>
                <p className="text-gray-500 text-sm min-h-[40px]">{cafeteria.description}</p>
              </div>

              {/* Details and Specialties */}
              <div className="p-6 pt-2 border-t border-gray-100">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-md text-gray-600">
                    <FaClock className="mr-3 text-green-500 text-lg" />
                    <span className="font-semibold">{cafeteria.hours}</span>
                  </div>
                  <div className="flex items-center text-md text-gray-600">
                    <FaMapMarkerAlt className="mr-3 text-green-500 text-lg" />
                    <span>Location: {cafeteria.name.split('(')[1]?.replace(')', '') || 'Campus Area'}</span>
                  </div>
                </div>

              
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Top Dishes:</p>
                  <div className="flex flex-wrap gap-2">
                    {cafeteria.specialties.map((specialty, index) => (
                      <span key={index} className="flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                        <specialty.icon className="mr-1.5 text-green-600" />
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCafeteriaClick(cafeteria.id)}
                  className="w-full py-3 font-extrabold rounded-xl transition duration-300 transform hover:scale-[1.01] shadow-lg bg-green-600 hover:bg-green-700 text-white"
                >
                  View Menu & Order
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            onClick={() => setShowContract(true)}
            className="flex items-center bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-[1.02] transform transition duration-300 border-l-8 border-yellow-500"
          >
            <FaFileContract className="text-5xl text-yellow-600 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-800">New Contract Enrollment</h2>
              <p className="text-gray-500 text-sm">
                Secure your meal plan. Easy registration and payment setup.
              </p>
            </div>
          </div>

          <div
            onClick={() => setShowFeedback(true)}
            className="flex items-center bg-white rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-[1.02] transform transition duration-300 border-l-8 border-blue-500"
          >
            <FaCommentDots className="text-5xl text-blue-600 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-800">Share Your Feedback</h2>
              <p className="text-gray-500 text-sm">
                Rate your recent delivery/service. Help us serve you better!
              </p>
            </div>
          </div>
        </section>

        {/* Success Message */}
        {contractSuccess && (
          <div className="fixed top-6 right-6 bg-green-500 text-white py-3 px-6 rounded-lg shadow-2xl flex items-center animate-bounce transition z-50">
            <span className="font-bold mr-2">✅ Success!</span> Contract submitted.
          </div>
        )}

        {showContract && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmitContract}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-3 transform transition-all duration-300 scale-100 max-h-full overflow-y-auto mt-10 mb-4"
            >
              <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Contract Registration</h2>

              <input type="text" name="firstName" placeholder="First Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input type="text" name="lastName" placeholder="Last Name" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input type="text" name="idNumber" placeholder="ID Number" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input type="tel" name="phone" placeholder="Phone Number" pattern="^(\+251|0)[1-9][0-9]{8}$" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input type="number" name="amount" placeholder="Contract Amount (ETB)" min="1" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />

              <select
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select Payment Method</option>
                <option value="Chapa">Chapa (Online Payment)</option>
                <option value="Telebirr">Telebirr</option>
                <option value="CBE">CBE</option>
                <option value="Cash">Cash (Manual Submission)</option>
                <option value="OtherBank">Other Bank Transfer</option>
              </select>

              {paymentMethod !== "" && paymentMethod !== "Cash" && paymentMethod !== "Chapa" && (
                <input
                  type="text"
                  placeholder={`Enter ${paymentMethod === 'Telebirr' ? 'Phone Number' : 'Account Number'}`}
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              )}

              {/* Tighter button group */}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300 shadow-md text-sm">Submit Contract</button>
                <button type="button" onClick={showMainMenu} className="flex-1 py-2.5 rounded-lg bg-gray-400 text-white font-bold hover:bg-gray-500 transition duration-300 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleSubmitFeedback}
              className="bg-white rounded-2xl w-full max-w-sm p-2 shadow-2xl space-y-3 transform transition-all duration-300 scale-100 max-h-full overflow-y-auto mt-24 mb-10"
            >
              <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">✍️ Service Feedback</h2>
              
              <input type="text" placeholder="Order ID (Optional)" value={feedback.orderId} onChange={(e) => setFeedback({ ...feedback, orderId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              
              <label className="block text-xs font-medium text-gray-700 pt-1">Overall Satisfaction:</label>
              <select value={feedback.rating} onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">⭐ Select Rating (1-5)</option>
                <option value="5">5 - Excellent! (Highly Satisfied)</option>
                <option value="4">4 - Good (Satisfied)</option>
                <option value="3">3 - Fair (Not Satisfied)</option>
                <option value="2">2 - Poor (Dissatisfied)</option>
                <option value="1">1 - Very Bad (Highly Dissatisfied)</option>
              </select>

              <label className="block text-xs font-medium text-gray-700 pt-1">Order Accuracy:</label>
              <select value={feedback.accuracy} onChange={(e) => setFeedback({ ...feedback, accuracy: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Was your order correct?</option>
                <option value="yes">✅ Yes, perfect!</option>
                <option value="no">❌ No, there was an error.</option>
              </select>
              
              <label className="block text-xs font-medium text-gray-700 pt-1">Delivery Timeliness:</label>
              <select value={feedback.timeliness} onChange={(e) => setFeedback({ ...feedback, timeliness: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Was delivery on time?</option>
                <option value="yes">⏱️ Yes, on time!</option>
                <option value="no">🐢 No, it was late.</option>
              </select>
              
              <textarea rows="2" placeholder="Additional comments (2-3 lines)" value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 shadow-md text-sm">Submit Feedback</button>
                <button type="button" onClick={showMainMenu} className="flex-1 py-2.5 rounded-lg bg-gray-400 text-white font-bold hover:bg-gray-500 transition duration-300 text-sm">Back</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Service;
