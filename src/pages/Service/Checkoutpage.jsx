// // CheckoutPage.jsx

// import React from 'react';

// // This component receives all necessary data and handlers from the parent component (OrderPage.jsx)
// const CheckoutPage = ({
//     totalAmount, 
//     cart, 
//     stock, 
//     deliveryPlace, 
//     setDeliveryPlace, 
//     paymentMethod, 
//     setPaymentMethod, 
//     contractType, 
//     setContractType, 
//     handleOrderConfirmation, 
//     onBackToMenu // New prop to close the modal
// }) => {

//   return (
//     <div className="modal is-active">
//       <div className="modal-content">
//         <h3>Finalize Order</h3>
//         {/* Close button uses the onBackToMenu prop */}
//         <button className="close-btn" onClick={onBackToMenu}>X</button>
        
//         <form onSubmit={handleOrderConfirmation}>
//             {/* 1. Choose Delivery Place */}
//             <div className="form-group">
//                 <label>Choose Delivery Place:</label>
//                 <select 
//                     value={deliveryPlace} 
//                     onChange={(e) => setDeliveryPlace(e.target.value)}
//                     required
//                 >
//                     <option value="">-- Select Location --</option>
//                     <option value="Campus Dorm 1">Campus Dorm 1</option>
//                     <option value="Main Library">Main Library</option>
//                     <option value="Admin Building">Admin Building</option>
//                     <option value="Other">Other (Specify in notes)</option>
//                 </select>
//             </div>

//             {/* 2. Payment Method */}
//             <div className="form-group">
//                 <label>Choose Payment Method:</label>
//                 <div className="radio-group">
                    
//                     <input type="radio" id="payCash" name="payment" value="cash" 
//                         checked={paymentMethod === 'cash'} 
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                     />
//                     <label htmlFor="payCash">Pay Birr (Cash on Delivery)</label>

//                     <input type="radio" id="payCBE" name="payment" value="cbe" 
//                         checked={paymentMethod === 'cbe'} 
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                     />
//                     <label htmlFor="payCBE">CBE (Commercial Bank)</label>
                    
//                     <input type="radio" id="payTelebirr" name="payment" value="telebirr" 
//                         checked={paymentMethod === 'telebirr'} 
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                     />
//                     <label htmlFor="payTelebirr">Telebirr</label>

//                     <input type="radio" id="payOther" name="payment" value="other" 
//                         checked={paymentMethod === 'other'} 
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                     />
//                     <label htmlFor="payOther">Other</label>
//                 </div>
                
//                 {paymentMethod === 'cash' && (<p className="note">Payment is collected in cash upon delivery.</p>)}
//                 {paymentMethod === 'cbe' && (<p className="note contract-note">Please note: You will be redirected to the payment site.</p>)}
//                 {paymentMethod === 'telebirr' && (<p className="note contract-note">Please note: The Telebirr payment link will open in a new window.</p>)}
//                 {paymentMethod === 'other' && (<p className="note">We will contact you regarding your preferred payment method.</p>)}
//             </div>
            
//             {/* 3. Contract Choice */}
//             <div className="form-group">
//                 <label>Choose Contract Type (Optional):</label>
//                 <select 
//                     value={contractType} 
//                     onChange={(e) => setContractType(e.target.value)}
//                 >
//                     <option value="none">No Contract</option>
//                     <option value="weekly">Weekly Meal Plan</option>
//                     <option value="monthly">Monthly Meal Plan</option>
//                 </select>
//             </div>

//             {/* 4. Total and Confirmation */}
//             <div className="order-total-summary">
//                 <h4>Order Total: {totalAmount.toFixed(2)} ETB</h4>
//             </div>

//             <div className="checkout-actions">
//                 <button 
//                     type="button" 
//                     className="back-to-menu-btn" 
//                     onClick={onBackToMenu} // Uses the prop
//                 >
//                     ← Back to Menu
//                 </button>
                
//                 <button type="submit" className="confirm-order-btn">
//                     Confirm Order
//                 </button>
//             </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;