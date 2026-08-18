import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logo from "../../assets/image/logo/white-logo.png";
import Auth from "../../components/auth";
import { Link } from 'react-router-dom';
import '../../assets/css/aut.css'

export default function Register() {
  return (
    <>
     <Auth AutData={<>
                 <div className="logo-brand d-lg-none justify-content-center">
                   <img src={logo} alt="logo" className="w-100px" />
                 </div>
                 <Row className="row-gap-32px flex-wrap after-lg-card max-w-480px mx-auto">
                   <Col sm={12}>
                     <h5 className="fs-32px mb-1">Create Your Account 👋</h5>
                     <p className="fs-16px mb-0">
                       Sign up to start managing your money easily
                     </p>
                   </Col>
                    <Col sm={12}>
                         <Row className="gap-3 flex-wrap">
                             <Col sm={12}>
                     <div className="input-group-custom">
                       <label className="form-label">Full Name</label>
                       <input
                         type="name"
                         className="form-control"
                         placeholder="Enter your full name"
                       ></input>
                     </div>
                   </Col>
                   <Col sm={12}>
                     <div className="input-group-custom">
                       <label className="form-label">Email Address</label>
                       <input
                         type="email"
                         className="form-control"
                         placeholder="Enter your email address"
                       />
                     </div>
                   </Col>
                   <Col sm={12}>
                     <div className="input-group-custom">
                       <label className="form-label">Password</label>
                       <input
                         type="Password"
                         className="form-control"
                         placeholder="Create a password"
                       />
                     </div>
                   </Col>
                   <Col sm={12}>
                     <div className="input-group-custom">
                       <label className="form-label">Confirm Password</label>
                       <input
                         type="Password"
                         className="form-control"
                         placeholder="Confirm Password"
                       />
                     </div>
                   </Col>
                        </Row>
                    </Col>
                   <Col sm={12} className="d-flex flex-column gap-3">
                     <button type="submit" className="btn btn-login">
                       Create Account
                     </button>
     
                     <div className="d-flex align-items-center gap-2">
                       <hr className="ru-border-34302d8a w-100 my-0" />
                       <p className="ru-text-5b5b5b fs-12px mb-0">OR</p>
                       <hr className="ru-border-34302d8a w-100 my-0" />
                     </div>
     
                     <button className="btn-social">
                       <svg width="20" height="20" viewBox="0 0 24 24">
                         <path
                           fill="#EA4335"
                           d="M12 5.04c1.74 0 3.3.6 4.53 1.78l3.4-3.4C17.95 1.18 15.2 0 12 0 7.39 0 3.39 2.6 1.47 6.38l3.95 3.06C6.36 6.58 8.97 5.04 12 5.04z"
                         ></path>
                         <path
                           fill="#4285F4"
                           d="M23.5 12.23c0-.84-.08-1.65-.22-2.43H12v4.6h6.45c-.28 1.5-1.1 2.77-2.34 3.62l3.78 2.93c2.2-2.03 3.61-5.02 3.61-8.72z"
                         ></path>
                         <path
                           fill="#FBBC05"
                           d="M5.42 14.44l-3.95 3.06C3.39 21.4 7.39 24 12 24c3.2 0 5.95-1.18 7.93-3.19l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56z"
                         ></path>
                         <path
                           fill="rgb(52, 168, 83)"
                           d="M12 24c4.61 0 8.61-2.6 10.53-6.38l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56l-3.95 3.06C3.39 21.4 7.39 24 12 24z"
                         ></path>
                       </svg>
                       Continue with Google
                     </button>
                   </Col>
     
                   <Col xs={12}>
                     <p className="signup-text">
                       Already have an account? <Link to="/login">Login</Link>
                     </p>
                   </Col>
                 </Row>
                 </>}/>
    </>
  );
}
