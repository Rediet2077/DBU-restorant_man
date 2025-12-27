import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-columns">
          <div>
            <h5 className="footer-title">Company</h5>
            <ul className="footer-links">
              <li><a href="/aboutus">About Us</a></li>
              <li><a href="/contactus">Contact Us</a></li>
              <li><a href="#">Reservation</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Condition</a></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-title">Contact</h5>
            <p><i className="bi bi-geo-alt-fill"></i> 123 Street, Debre Birhan University</p>
            <p><i className="bi bi-telephone-fill"></i> +125976542311</p>
            <p><i className="bi bi-envelope-fill"></i> info@dbulaunch.com</p>
          </div>

          <div>
            <h5 className="footer-title">Opening Hours</h5>
            <p>Monday - Sunday: 6:00 AM - 12:00 PM</p>
            <p>Delivery: 7:00 AM - 11:30 PM</p>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; 2025 DBU LAUNCH. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
