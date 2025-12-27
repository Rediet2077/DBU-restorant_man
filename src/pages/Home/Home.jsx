// src/pages/Home/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  FaUtensils, 
  FaGlassWhiskey, 
  FaMugHot,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaPhone,
  FaArrowRight
} from "react-icons/fa";

import food1 from "../../assets/images/fulll.jpg";
import food2 from "../../assets/images/koker.jpg";
import food3 from "../../assets/images/picfood.jpg";
import heroImg from "../../assets/images/picdescktop.jpg";

const Home = () => {
  const cafeterias = [
    {
      id: 1,
      name: "Female Launch",
      image: food1,
      description: "Specializing in traditional Ethiopian dishes with a focus on female students' preferences.",
      specialties: ["Chechebsa", "Sugar Potato", "Shiro"],
      openTime: "12:00 AM",
      closeTime: "5:00 PM",
      location: "Female Campus Building",
      rating: 4.5,
      phone: "+251 111 234 567"
    },
    {
      id: 2,
      name: "Male Launch",
      image: food2,
      description: "Hearty meals and traditional favorites designed to satisfy the appetites of male students.",
      specialties: ["Sanbusa", "Sugar Potato"],
      openTime: "12:00 AM",
      closeTime: "4:00 PM",
      location: "Male Campus Building",
      rating: 4.3,
      phone: "+251 111 234 568"
    },
    {
      id: 3,
      name: "Megenagna",
      image: food3,
      description: "A fusion of Ethiopian and international cuisine, offering variety for diverse tastes.",
      specialties: ["Rice", "Macaroni"],
      openTime: "12:00 AM",
      closeTime: "4:00 PM",
      location: "Megenagna Campus Area",
      rating: 4.2,
      phone: "+251 111 234 569"
    },
    {
      id: 4,
      name: "Marcan",
      image: food1,
      description: "Fresh and healthy options with a focus on natural ingredients and refreshing beverages.",
      specialties: ["Ertb", "Juice",  "Fruit Platters"],
      openTime: "12:00 AM",
      closeTime: "4:00 PM",
      location: "Marcan Campus Building",
      rating: 4.7,
      phone: "+251 111 234 570"
    },
    {
      id: 5,
      name: "Megezez",
      image: food2,
      description: "Traditional Ethiopian breakfast and lunch options with authentic flavors.",
      specialties: ["Enkulal", "Sga Frfr", "Sga Wot"],
      openTime: "2:00 AM",
      closeTime: "11:00 PM",
      location: "Megezez Campus Area",
      rating: 4.8,
      phone: "+251 111 234 571"
    }
  ];

  return (
    <div className="bg-[#fff9f0] text-[#333] font-poppins overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#fff9f0] to-[#ffecc2]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-[#0f172b] mb-6">
              Enjoy Our <span className="text-[#ffa500]">Delicious</span> Meal
            </h1>
            <p className="text-lg max-w-md mb-6">
              DBU Launch delivers premium quality food right to your doorstep.
              Fast, fresh, and flavorful meals for students and staff at Debre
              Brehan University.
            </p>
            <Link to="/service">
              <button className="bg-[#ffa500] hover:bg-[#e08e0b] text-black font-semibold py-3 px-6 rounded-lg transition-all">
                Order Now
              </button>
            </Link>
          </div>
          <div className="flex-1">
            <img
              src={heroImg}
              alt="Delicious Food"
              className="w-full max-w-lg rounded-2xl animate-float"
            />
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              We are ready to serve you with our premium delivery system
            </h3>
            <p className="text-lg max-w-md">
              Located in the heart of Debre Brehan University, we provide
              high-quality meals prepared with fresh ingredients by our master
              chefs. Our mission is to deliver delicious, nutritious food
              quickly and efficiently to the university community.
            </p>
          </div>
          <div className="flex-1 flex gap-6 flex-wrap">
            <div className="bg-[#f8f9fa] p-6 rounded-xl text-center transition-transform hover:-translate-y-1 w-32">
              <h3 className="text-4xl text-[#ffa500] font-bold mb-2">10+</h3>
              <p>Years Experience</p>
            </div>
            <div className="bg-[#f8f9fa] p-6 rounded-xl text-center transition-transform hover:-translate-y-1 w-32">
              <h3 className="text-4xl text-[#ffa500] font-bold mb-2">5</h3>
              <p>Master Chefs</p>
            </div>
            <div className="bg-[#f8f9fa] p-6 rounded-xl text-center transition-transform hover:-translate-y-1 w-32">
              <h3 className="text-4xl text-[#ffa500] font-bold mb-2">20+</h3>
              <p>Menu Items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Cafeterias Section */}
      <section className="py-12 px-6 bg-gradient-to-r from-[#fff9f0] to-[#fff9f0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172b] mb-4">
              Our Campus Cafeterias
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our five unique cafeterias located across campus
            </p>
          </div>
          
          {/* Grid layout for cafeterias - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cafeterias.map((cafeteria) => (
              <div 
                key={cafeteria.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={cafeteria.image} 
                    alt={cafeteria.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center">
                    <FaStar className="text-yellow-500 mr-1 text-xs" />
                    <span className="text-sm font-semibold">{cafeteria.rating}</span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#0f172b] mb-2">{cafeteria.name}</h3>
                  <p className="text-gray-700 mb-3">{cafeteria.description}</p>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {cafeteria.specialties.map((specialty, idx) => (
                        <span 
                          key={idx}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-orange-500" />
                      <span>{cafeteria.openTime} - {cafeteria.closeTime}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-orange-500" />
                      <span className="truncate max-w-[100px]">{cafeteria.location}</span>
                    </div>
                  </div>
                  
                  <Link to={`/cafeteria/${cafeteria.id}`}>
                    <button className="w-full bg-[#ffa500] hover:bg-[#e08e0b] text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center text-sm">
                      View Menu
                      <FaArrowRight className="ml-2" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172b] mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All cafes provide these three essential categories to satisfy every craving
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Food Category */}
            <div className="bg-white rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaUtensils className="text-4xl text-orange-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Food</h3>
              <p className="text-gray-600 text-center mb-6">
                From gourmet meals to quick bites. Each cafe offers its unique food specialties including burgers, pizza, salads, Asian cuisine, and more.
              </p>
              <div className="text-center text-orange-500 font-semibold">
                20+ Food Items Available
              </div>
            </div>
            
            {/* Soft Drinks Category */}
            <div className="bg-white rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaGlassWhiskey className="text-4xl text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Soft Drinks</h3>
              <p className="text-gray-600 text-center mb-6">
                Refreshing beverages including sodas, juices, iced teas, smoothies, milkshakes, and specialty drinks available at all locations.
              </p>
              <div className="text-center text-blue-500 font-semibold">
                15+ Drink Options
              </div>
            </div>
            
            {/* Hot Drinks Category */}
            <div className="bg-white rounded-xl shadow-lg p-8 transition-transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaMugHot className="text-4xl text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Hot Drinks</h3>
              <p className="text-gray-600 text-center mb-6">
                Premium coffee, espresso, tea, hot chocolate, and specialty warm beverages to power you through the day.
              </p>
              <div className="text-center text-amber-600 font-semibold">
                10+ Hot Drink Varieties
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
