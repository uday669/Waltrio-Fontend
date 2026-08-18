import React from 'react'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logo from "../assets/image/logo/white-logo.png";


export default function Auth(props) {
  return (
    <>
      <div className="overflow-hidden">
             <Row>
               <Col className="left-panel " lg={6} xl={7}>
                 <div className="logo-brand">
                   <img src={logo} alt="logo" className="w-100px" />
                 </div>
     
                 <h1 className="hero-title">
                   Track, Plan.
                   <br />
                   Save. <span className="highlight">Grow.</span>
                 </h1>
     
                 <p className="hero-subtitle">
                   All-in-one money management for you, your family and your groups.
                 </p>
     
                 <div className="features-list">
                   <div className="feature-item">
                     <div className="feature-icon purple">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <path
                           d="M12 20V10M18 20V4M6 20V16"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                         />
                       </svg>
                     </div>
                     <div className="feature-text">
                       <h5>Track Income &amp; Expenses</h5>
                       <p>Know where your money goes</p>
                     </div>
                   </div>
     
                   <div className="feature-item">
                     <div className="feature-icon teal">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <rect
                           x="3"
                           y="6"
                           width="18"
                           height="13"
                           rx="2"
                           stroke="currentColor"
                           strokeWidth="2"
                         />
                         <path
                           d="M16 13H21M16 10H21"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                         />
                         <circle
                           cx="7"
                           cy="12"
                           r="2"
                           stroke="currentColor"
                           strokeWidth="2"
                         />
                       </svg>
                     </div>
                     <div className="feature-text">
                       <h5>Manage Budgets</h5>
                       <p>Set budgets and achieve your goals</p>
                     </div>
                   </div>
     
                   <div className="feature-item">
                     <div className="feature-icon blue">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <path
                           d="M7 7H17M17 7L14 4M17 7L14 10"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         />
                         <path
                           d="M17 17H7M7 17L10 14M7 17L10 20"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         />
                       </svg>
                     </div>
                     <div className="feature-text">
                       <h5>Split &amp; Settle Easily</h5>
                       <p>Manage group or trip expenses</p>
                     </div>
                   </div>
     
                   <div className="feature-item">
                     <div className="feature-icon indigo">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                         <path
                           d="M12 3L20 6V11C20 16.5 16.5 20 12 21C7.5 20 4 16.5 4 11V6L12 3Z"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinejoin="round"
                         />
                         <path
                           d="M9 12L11 14L15 10"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         />
                       </svg>
                     </div>
                     <div className="feature-text">
                       <h5>Secure &amp; Private</h5>
                       <p>Your data is 100% secure</p>
                     </div>
                   </div>
                 </div>
     
                 <div className="laptop-mockup d-none ">
                   <div className="laptop-screen">
                     <div className="laptop-screen-inner">
                       <div className="mockup-header">
                         <div className="mockup-dot"></div>
                         <div className="mockup-dot"></div>
                         <div className="mockup-dot"></div>
                         <span>MoneyTrack</span>
                       </div>
                       <div className="mockup-content">
                         <div className="mockup-stats">
                           <div className="mockup-stat">
                             <div className="mockup-stat-label">Total Balance</div>
                             <div className="mockup-stat-value">₹18,450</div>
                           </div>
                           <div className="mockup-stat">
                             <div className="mockup-stat-label">Total Income</div>
                             <div className="mockup-stat-value">₹50,000</div>
                           </div>
                           <div className="mockup-stat">
                             <div className="mockup-stat-label">Total Expenses</div>
                             <div className="mockup-stat-value">₹31,550</div>
                           </div>
                         </div>
                         <div className="mockup-chart">
                           <div className="mockup-chart-left">
                             <div className="donut-chart"></div>
                           </div>
                           <div className="mockup-chart-right">
                             <div className="mockup-list-item">
                               <span>Food</span>
                               <span>₹12,500</span>
                             </div>
                             <div className="mockup-list-item">
                               <span>Travel</span>
                               <span>₹8,000</span>
                             </div>
                             <div className="mockup-list-item">
                               <span>Shopping</span>
                               <span>₹5,500</span>
                             </div>
                             <div className="mockup-list-item">
                               <span>Bills</span>
                               <span>₹3,550</span>
                             </div>
                             <div className="mockup-list-item">
                               <span>Others</span>
                               <span>₹2,000</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="laptop-base"></div>
                 </div>
               </Col>
               <Col lg={6} xl={5} className="right-panel">
                {props.AutData}
               </Col>
             </Row>
           </div> 
    </>
  )
}
