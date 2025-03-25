// Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Auth = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Sign Up fields
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole] = useState('customer');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('https://museumdb.onrender.com/auth/register', { // http://localhost:5000/auth/register
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          firstName: signupFirstName,
          lastName: signupLastName,
          phoneNumber: signupPhone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'An error occurred while registering.');
      } else {
        const loginResponse = await fetch('https://museumdb.onrender.com/auth/login', { // http://localhost:5000/auth/login
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signupEmail, password: signupPassword }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          setSuccessMessage('Account created, but login failed. Please sign in manually.');
          setRightPanelActive(false);
        } else {
          setSuccessMessage('Registration complete! Redirecting...');
          navigate('/profile');
        }

        setSignupEmail('');
        setSignupPassword('');
        setSignupFirstName('');
        setSignupLastName('');
        setSignupPhone('');
      }
    } catch (error) {
      console.error('Sign Up Error:', error);
      setErrorMessage('Network error occurred during sign up.');
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('https://museumdb.onrender.com/auth/login', { // http://localhost:5000/auth/login
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Invalid login credentials.');
      } else {
        setSuccessMessage('Login successful! Redirecting to your profile...');
        setLoginEmail('');
        setLoginPassword('');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Sign In Error:', error);
      setErrorMessage('Network error occurred during sign in.');
    }
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      const response = await fetch('https://museumdb.onrender.com/auth/forgot-password', { // http://localhost:5000/auth/forgot-password
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to send reset link.');
      } else {
        setSuccessMessage('Password reset email sent!');
        setResetEmail('');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      setErrorMessage('Network error occurred.');
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${rightPanelActive ? 'auth-right-panel-active' : ''}`} id="auth-container">
        <div className="auth-form-container auth-sign-up-container">
          <form onSubmit={handleSignUpSubmit}>
            <h1>Create Account</h1>
            <span>Use your email for registration</span>
            <input type="text" placeholder="First Name" value={signupFirstName} onChange={(e) => setSignupFirstName(e.target.value)} required />
            <input type="text" placeholder="Last Name" value={signupLastName} onChange={(e) => setSignupLastName(e.target.value)} required />
            <input type="text" placeholder="Phone Number" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required />
            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        <div className="auth-form-container auth-sign-in-container">
          {!showForgotPassword ? (
            <form onSubmit={handleSignInSubmit}>
              <h1>Sign in</h1>
              <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              <div style={{ margin: '4px 0 12px' }}>
                <span
                  style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
                  onClick={() => {
                    setShowForgotPassword(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                >
                  Forgot Password?
                </span>
              </div>
              <button type="submit">Sign In</button>
              {errorMessage && (
                <div style={{ color: "#b00020", fontSize: "13px", marginTop: "10px" }}>
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div style={{ color: "green", fontSize: "13px", marginTop: "10px" }}>
                  {successMessage}
                </div>
              )}
            </form>
          ) : (
            <form>
              <h1>Reset Password</h1>
              <span>Enter your email to receive a reset link</span>
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setErrorMessage('');
                    setResetEmail('');
                  }}
                  style={{ fontSize: "11px", padding: "10px 25px", backgroundColor: "#dc3545", border: "none", borderRadius: "20px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPasswordSubmit}
                  style={{ fontSize: "11px", padding: "10px 25px" }}
                >
                  Done
                </button>
              </div>
              {errorMessage && (
                <div style={{ color: "#b00020", fontSize: "13px", marginTop: "10px" }}>
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div style={{ color: "green", fontSize: "13px", marginTop: "10px" }}>
                  {successMessage}
                </div>
              )}
            </form>
          )}
        </div>

        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login.</p>
              <button className="ghost" onClick={() => setRightPanelActive(false)}>Sign In</button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={() => setRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
