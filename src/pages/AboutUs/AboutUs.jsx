// src/pages/About/AboutUs.jsx
import React, { useEffect, useState } from "react";

const AboutUs = () => {
  const testimonials = [
    {
      quote: "The digital lunch system made ordering meals so easy and fast!",
      author: "Bizuayehu, Computer Science Student",
    },
    {
      quote:
        "I can pay online without worrying about losing cash — it's very convenient!",
      author: "Amina, Engineering Student",
    },
    {
      quote:
        "This system is efficient and helps cafeteria manage food better.",
      author: "Tewodros, IT Student",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-16 font-sans space-y-16">
      {/* Hero Section / Dining */}
      <section
        className="text-center text-white rounded-lg py-12 px-6 flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(44, 62, 80, 0.85)",
        }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Nourishing Minds, Building Community
        </h1>
        <p className="max-w-2xl text-base md:text-lg mb-6">
          DBU Launch provides fresh, delicious meals delivered right from the
          university dining halls. Experience high-quality, student-friendly
          meals with easy online ordering.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-8 text-left max-w-4xl w-full">
          <div>
            <h3 className="text-[#d29d0c] text-lg font-semibold mb-1">
              Our Mission
            </h3>
            <p>
              To develop a secure and efficient web-based lunch management
              system that digitalizes food ordering and payment processes,
              reduces manual errors, and improves the efficiency of lunch
              distribution for students and staff.
            </p>
          </div>
          <div>
            <h3 className="text-[#d29d0c] text-lg font-semibold mb-1">
              Our Vision
            </h3>
            <p>
              To be a leading example of digital transformation in university
              dining through innovation, sustainability, and student-centered
              service excellence.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ordering from any cafe is simple with our integrated platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Browse Cafes</h3>
              <p className="text-gray-600">
                Explore all 5 cafes, their menus, and special offers in one place.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Customize Order</h3>
              <p className="text-gray-600">
                Select items, customize as needed, and add to your cart from multiple cafes.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Checkout Once</h3>
              <p className="text-gray-600">
                Pay for all items from different cafes in a single, secure transaction.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Pickup or Delivery</h3>
              <p className="text-gray-600">
                Receive notifications when your order is ready for pickup or delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-bold text-center text-[#2c3e50] mb-8 relative after:block after:w-12 after:h-1 after:bg-[#27ae60] after:mx-auto after:mt-1">
          Why Choose Our System
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🍴",
              title: "Diverse Menus",
              desc: "Offers a variety of traditional Ethiopian dishes and healthy meal options for students and staff.",
            },
            {
              icon: "💳",
              title: "Online Payment",
              desc: "Secure digital payment system that minimizes cash handling and reduces human errors.",
            },
            {
              icon: "⚙️",
              title: "Efficient Management",
              desc: "Automated record tracking and data analytics for better meal planning and resource utilization.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-md text-center transform transition-transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section - Renamed to "Our Food Leadership" */}
      {/* <div>
        <h2 className="text-2xl font-bold text-center text-[#2c3e50] mb-8 relative after:block after:w-12 after:h-1 after:bg-[#27ae60] after:mx-auto after:mt-1">
          Our Food Leadership
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            {
              name: "Chef Alemayehu",
              role: "Head of Culinary Operations",
              img: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=200&q=80",
            },
            {
              name: "Dr. Selam",
              role: "Chief Nutrition Expert",
              img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80",
            },
            {
              name: "Chef Meron",
              role: "Sous Chef & Menu Developer",
              img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="w-52 text-center p-4 bg-white rounded-lg shadow-md transform transition-transform hover:scale-105"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-28 h-28 mx-auto rounded-full object-cover mb-2"
              />
              <h4 className="font-semibold text-lg">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* Testimonials Section */}
      <section className="bg-[#2c3e50] text-white text-center p-12 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold">What Our Students Say</h2>
        <div>
          <blockquote className="italic text-base">
            "{testimonials[index].quote}"
          </blockquote>
          <p className="mt-1 font-semibold text-sm">- {testimonials[index].author}</p>
        </div>
        <a
          href="/ContactUs"
          className="inline-block mt-4 px-6 py-2 bg-[#27ae60] rounded-full font-bold hover:bg-green-500 transition-colors text-sm"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default AboutUs;