import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/contact.css";

const ContactPage = () => {
  const [filter, setFilter] = useState("All Reviews");
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    title: "",
    message: "",
    rating: 0,
    maxStars: 5,
  });

  const topics = [
    "General Experience",
    "Tickets",
    "Employee",
    "Art in Technology",
    "Local Artists",
    "Installation",
    "Women in Art",
  ];

  const filteredReviews =
    filter === "All Reviews"
      ? reviews
      : reviews.filter((r) => r.topic === filter);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    const newReview = {
      ...formData,
      customer: "Current User",
      date: new Date().toLocaleDateString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setFormData({
      topic: "",
      title: "",
      message: "",
      rating: 0,
      maxStars: 5,
    });
    setShowForm(false);
  };

  return (
    <div className="main-layout">
      <div className="review-container">
        <div className="review-header">
          <h1 className="review-title">Reviews ({filteredReviews.length})</h1>
          <div className="review-controls">
            <button
              className="add-review-button"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Add New Review"}
            </button>
            <select
              className="filter-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All Reviews">All Reviews</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showForm && (
          <div className="form-wrapper">
            <motion.h1
              className="form-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Please Describe your Review!
            </motion.h1>

            <motion.form
              onSubmit={handleSubmit}
              className="review-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="form-group">
                <label>Exhibit</label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an exhibit</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter review title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  name="message"
                  placeholder="Write your feedback"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>


              <div className="form-group">
                <label>Rating</label>
                <div className="rating-stars">
                  {Array.from(
                    { length: formData.maxStars },
                    (_, i) => i + 1
                  ).map((num) => (
                    <span
                      key={num}
                      className={num <= formData.rating ? "star filled" : "star"}
                      onClick={() => handleRatingChange(num)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-review-button">
                Submit Review
              </button>
            </motion.form>
          </div>
        )}

        <div className="review-list">
          {filteredReviews.length === 0 ? (
            <p className="no-reviews">No reviews yet.</p>
          ) : (
            filteredReviews.map((review, index) => (
              <motion.div
                className="review-card"
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <h2 className="review-card-title">Title: {review.title}</h2>
                <p><strong>Feedback:</strong> {review.message}</p>
                <p className="review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(review.maxStars - review.rating)}
                </p>
                <p><strong>Customer:</strong> {review.customer}</p>
                <p><strong>Exhibit:</strong> {review.topic}</p>
                <p><strong>Date Posted:</strong> {review.date}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;



