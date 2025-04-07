// /frontend/src/pages/ResetPassword.jsx

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/resetPassword.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // read "?token=XYZ" from the URL
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (!resetToken) {
      setErrorMessage("Missing or invalid reset token.");
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!resetToken) {
      return setErrorMessage("No reset token provided in the URL.");
    }

    if (!newPassword || !confirmPassword) {
      return setErrorMessage("Please enter and confirm your new password.");
    }

    if (newPassword !== confirmPassword) {
      return setErrorMessage("Passwords do not match.");
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("https://museumdb.onrender.com/auth/reset-password", { // http://localhost:5000/auth/reset-password
        method: "POST", // https://museumdb.onrender.com/auth/reset-password
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword
        })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to reset password.");
      } else {
        setSuccessMessage("Password reset successfully! Redirecting to login...");
        // Optionally wait 1.5 seconds, then redirect
        setTimeout(() => {
          navigate("/auth");
        }, 1500);
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-page">
      <h1>Reset Your Password</h1>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
