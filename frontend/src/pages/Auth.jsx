// Auth.jsx
import { useState } from 'react';
// [CHANGES START] - Import useNavigate for client-side navigation
import { useNavigate } from 'react-router-dom';
// [CHANGES END]
import '../styles/auth.css'; // Make sure you have the CSS file for styling

/**
 * Auth Component
 * --------------
 * Displays a sliding panel UI for Sign In and Sign Up forms.
 * When the user signs up or logs in, we make a fetch call to the backend,
 * expecting a JSON response (and an httpOnly cookie with JWT on login).
 */
const Auth = () => {
  // Controls which panel (sign in / sign up) is visible
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // [CHANGES START] - Add input state for Sign Up
  // We default 'role' to "customer"
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('customer'); 
  // [CHANGES END]

  // [CHANGES START] - Add input state for Sign In
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // [CHANGES END]

  // For handling error and success messages in the UI
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // [CHANGES START] - useNavigate hook for client-side redirects
  const navigate = useNavigate();
  // [CHANGES END]

  /**
   * handleSignUpSubmit
   * ------------------
   * Triggered when user submits the Sign Up form.
   * We send a POST request to `http://localhost:5000/auth/register`
   * with email, password, and role in the request body.
   */
  const handleSignUpSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // change domain to backend domain when deploying
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        // 'credentials: include' ensures we can send/receive cookies across domains
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          role: signupRole, // Defaults to "customer"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the status code is not 2xx, handle as an error
        setErrorMessage(data.message || 'An error occurred while registering.');
      } else {
        setSuccessMessage('Registration successful! You can now sign in.');
        // (Optional) Clear the sign-up fields
        setSignupEmail('');
        setSignupPassword('');
        // Move user to the Sign In form if you want:
        // setRightPanelActive(false);
      }
    } catch (error) {
      console.error('Sign Up Error:', error);
      setErrorMessage('Network error occurred during sign up.');
    }
  };

  /**
   * handleSignInSubmit
   * ------------------
   * Triggered when user submits the Sign In form.
   * We send a POST request to `http://localhost:5000/auth/login`
   * with email and password in the request body.
   */
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // e.g., 401 = Invalid credentials, 500 = server error, etc.
        setErrorMessage(data.message || 'Invalid login credentials.');
      } else {
        // On success, the server sets an httpOnly cookie named "jwt".
        setSuccessMessage('Login successful! Redirecting to your profile...');
        // (Optional) Clear sign-in fields
        setLoginEmail('');
        setLoginPassword('');
        // [CHANGES START] - Redirect the user to the Profile page
        navigate('/profile');
        // [CHANGES END]
      }
    } catch (error) {
      console.error('Sign In Error:', error);
      setErrorMessage('Network error occurred during sign in.');
    }
  };

  // Switch panels to show Sign Up form
  const handleSignUpClick = () => setRightPanelActive(true);
  // Switch panels to show Sign In form
  const handleSignInClick = () => setRightPanelActive(false);

  return (
    <div className="auth-page">
      {/*
        auth-container determines whether the right (sign up) panel is visible.
        The class "auth-right-panel-active" toggles the animation between forms.
      */}
      <div
        className={`auth-container ${rightPanelActive ? 'auth-right-panel-active' : ''}`}
        id="auth-container"
      >
        {/*
          Sign Up Form Container
          ----------------------
          We attach our handleSignUpSubmit() to the <form onSubmit=...>
        */}
        <div className="auth-form-container auth-sign-up-container">
          <form onSubmit={handleSignUpSubmit}>
            <h1>Create Account</h1>
            <span>Use your email for registration</span>
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
            />
            {/*
              to hide role selection from the user,
              comment out the <select> or remove it entirely.
              Right now, it defaults to "customer" but the user could change it if needed.
            */}
            <select
              value={signupRole}
              onChange={(e) => setSignupRole(e.target.value)}
              style={{ marginBottom: '1rem' }}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/*
          Sign In Form Container
          ----------------------
          We attach our handleSignInSubmit() to the <form onSubmit=...>
        */}
        <div className="auth-form-container auth-sign-in-container">
          <form onSubmit={handleSignInSubmit}>
            <h1>Sign in</h1>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/*
          auth-overlay-container and auth-overlay handle the sliding animations
          that show/hide the sign-in vs sign-up forms.
        */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login.</p>
              <button className="ghost" onClick={handleSignInClick}>
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={handleSignUpClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*
        Display any error or success messages below.
        You can style these by adding CSS for .auth-error-message and .auth-success-message
      */}
      {errorMessage && <div className="auth-error-message">{errorMessage}</div>}
      {successMessage && <div className="auth-success-message">{successMessage}</div>}
    </div>
  );
};

export default Auth;
