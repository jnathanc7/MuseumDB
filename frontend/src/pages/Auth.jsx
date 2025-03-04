import React, { useState } from 'react';
import '../styles/auth.css';

// Auth is a functional component representing the sign in/up page.
const Auth = () => {
  // State variable to track whether the right (sign-up) panel is active.
  // When true, the UI will show the sign-up form; otherwise, the sign-in form is visible.
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Handler for when the "Sign Up" button is clicked.
  // This sets our state to true, activating the sign-up panel.
  const handleSignUpClick = () => setRightPanelActive(true);

  // Handler for when the "Sign In" button is clicked.s
  // This resets our state to false, activating the sign-in panel.sd
  const handleSignInClick = () => setRightPanelActive(false);

  return (
    // The outer div has a unique "auth-page" class to scope styles specific to this page.
    <div className="auth-page">

      {/* 
          Main container for the forms and overlay.
          We use a dynamic class name ("auth-container" plus "auth-right-panel-active" when active)
          to trigger CSS animations without conflicting with other global ".container" styles.
      */}
      <div
        className={`auth-container ${rightPanelActive ? 'auth-right-panel-active' : ''}`}
        id="auth-container"
      >
        {/* 
            Sign Up Form Container:
            - "auth-form-container" is the generic container style for a form.
            - "auth-sign-up-container" specifies this is the sign-up form.
        */}
        <div className="auth-form-container auth-sign-up-container">
          <form action="#">
            <h1>Create Account</h1>
            {/* Social media icons container */}
            <div className="auth-social-container">
              <a href="#" className="social">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social"> 
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className="social">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* 
            Sign In Form Container:
            - "auth-form-container" for common styling.
            - "auth-sign-in-container" specifies this is the sign-in form.
        */}
        <div className="auth-form-container auth-sign-in-container">
          <form action="#">
            <h1>Sign in</h1>
            <div className="auth-social-container">
              <a href="#" className="social">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social">
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className="social">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your account</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* 
            Overlay Container:
            Contains the sliding overlay panels for switching between sign-in and sign-up.
            The class names here are prefixed with "auth-" to ensure uniqueness.
        */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            {/* 
                Left overlay panel: displays when the sign-in form is active.
                The button here triggers handleSignInClick to switch views.
            */}
            <div className="auth-overlay-panel auth-overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={handleSignInClick}>
                Sign In
              </button>
            </div>
            {/* 
                Right overlay panel: displays when the sign-up form is active.
                The button here triggers handleSignUpClick to switch views.
            */}
            <div className="auth-overlay-panel auth-overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" onClick={handleSignUpClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
          Footer:
          This section remains at the bottom and includes external links.
          Note the use of rel="noopener noreferrer" for security on external links.
      */}
      <footer>
        <p>
        © 2025 Houston Museum of Fine Arts. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Auth;
