// Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Auth = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Sign Up fields
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole] = useState('customer'); // role is fixed to 'customer'
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
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
        setSuccessMessage('Registration successful! You can now sign in.');
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
      const response = await fetch('http://localhost:5000/auth/login', {
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
          <form onSubmit={handleSignInSubmit}>
            <h1>Sign in</h1>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit">Sign In</button>
          </form>
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

      {errorMessage && <div className="auth-error-message">{errorMessage}</div>}
      {successMessage && <div className="auth-success-message">{successMessage}</div>}
    </div>
  );
};

export default Auth;
