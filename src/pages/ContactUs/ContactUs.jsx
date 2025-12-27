import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    message: "",
    comments: false,
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateEthiopianPhone = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    const patterns = [
      /^09\d{8}$/, /^07\d{8}$/, 
      /^2519\d{8}$/, /^2517\d{8}$/, 
      /^\+2519\d{8}$/, /^\+2517\d{8}$/
    ];
    return patterns.some((p) => p.test(cleaned));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (formData.phone && !validateEthiopianPhone(formData.phone))
      newErrors.phone = "Invalid Ethiopian phone format";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    alert("Message Submitted Successfully 🎉");
    setFormData({ name: "", email: "", phone: "", location: "", message: "", comments: false });
    setErrors({});
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e4edf5] py-3 px-4">

      <div className="w-full max-w-[1200px] bg-white rounded-xl shadow-xl pb-8 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0d4a8a] to-[#1a6bb3] text-white text-center py-10 px-4">
          <h1 className="text-3xl font-bold tracking-wide">Contact Us</h1>
          <p className="max-w-xl mx-auto mt-2 opacity-90 text-lg">
            Have questions about our dining services? We would love to hear from you.
          </p>
        </div>

        {/* BODY CONTENT */}
        <div className="flex flex-wrap gap-6 p-6">

          {/* FORM */}
          <div className="flex-1 min-w-[300px]">
            <form onSubmit={handleSubmit} className="flex flex-col">
              
              <label className="font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text" required name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Your full name"
                className="p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring focus:ring-blue-300"
              />

              <label className="mt-3 font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email" required name="email"
                value={formData.email} onChange={handleChange}
                placeholder="Your email"
                className={`p-3 rounded-lg bg-gray-50 border 
                  ${errors.email ? "border-red-500 ring ring-red-200" : "border-gray-300 focus:ring-blue-300"}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

              <label className="mt-3 font-semibold text-gray-700">
                Phone <span className="text-xs text-gray-500">(0912345678 / +251912345678)</span>
              </label>
              <input
                type="tel" name="phone"
                value={formData.phone} onChange={handleChange}
                placeholder="Ethiopian number"
                className={`p-3 rounded-lg bg-gray-50 border 
                  ${errors.phone ? "border-red-500 ring ring-red-200" : "border-gray-300 focus:ring-blue-300"}`}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

              <label className="mt-3 font-semibold text-gray-700 mb-1">Location</label>
              <input
                name="location"
                value={formData.location} onChange={handleChange}
                placeholder="City, Region"
                className="p-3 rounded-lg border bg-gray-50 border-gray-300 focus:ring focus:ring-blue-300"
              />

              <label className="mt-3 font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                disabled={!formData.comments}
                value={formData.message} onChange={handleChange}
                placeholder={formData.comments ? "Type your message..." : "Enable message below"}
                className="min-h-[120px] p-3 rounded-lg border bg-gray-50 border-gray-300 focus:ring focus:ring-blue-300"
              />

              <div className="bg-blue-50 text-sm border-l-4 border-blue-600 p-3 rounded-md mt-3">
                <b className="text-blue-700">Note:</b> Check below to enable message writing.
              </div>

              <label className="mt-3 flex items-center gap-2 text-gray-700 cursor-pointer">
                <input type="checkbox" name="comments"
                  checked={formData.comments}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                Questions or Comments?
              </label>

              <button
                type="submit"
                className="mt-5 bg-gradient-to-r from-[#0d4a8a] to-[#1a6bb3] text-white font-semibold py-3 rounded-lg text-lg hover:-translate-y-[2px] hover:shadow-lg transition">
                Submit
              </button>
            </form>
          </div>

          {/* INFO SECTION */}
          <div className="flex-1 min-w-[300px] bg-[#f9fbfd] rounded-lg p-5 shadow-md">
            <img
              src="https://img.freepik.com/premium-photo/thoughtful-woman-is-talking-mobile-phone_447912-6750.jpg?semt=ais_hybrid&w=740"
              alt="Contact"
              className="rounded-lg shadow mb-4"
            />
            <h3 className="text-2xl font-bold text-[#0d4a8a] border-b pb-2 mb-4">Get in Touch</h3>
            <p><b>Email:</b> dining@dbu.edu.et</p>
            <p><b>Phone:</b> +251 01 681 5440</p>
            <p><b>Address:</b> Debre Birhan University, Ethiopia</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
