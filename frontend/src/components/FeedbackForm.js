import React, { useState } from "react";
import { 
  MessageSquare, 
  X, 
  Star, 
  Send, 
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import "./FeedbackForm.css";
import API_URL from "../baseurl";

const FeedbackForm = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");

  const toggleForm = () => {
    setIsOpen(!isOpen);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError("User not found. Please log in again.");
      return;
    }

    if (!feedback.trim()) {
      setError("Please provide your feedback before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          rating: parseInt(rating),
          feedback: feedback.trim(),
          type: feedbackType,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setFeedback("");
          setRating(5);
          setFeedbackType("general");
        }, 2000);
      } else {
        setError(data.error || "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedback("");
    setRating(5);
    setFeedbackType("general");
    setError("");
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={starValue}
          type="button"
          className={`star-btn ${rating >= starValue ? 'active' : ''}`}
          onClick={() => setRating(starValue)}
          disabled={isSubmitting}
        >
          <Star 
            size={20} 
            fill={rating >= starValue ? "#F59E0B" : "none"}
            color={rating >= starValue ? "#F59E0B" : "#D1D5DB"}
          />
        </button>
      );
    });
  };

  const getRatingText = () => {
    switch (rating) {
      case 5: return "Excellent";
      case 4: return "Good";
      case 3: return "Average";
      case 2: return "Poor";
      case 1: return "Very Poor";
      default: return "";
    }
  };

  return (
    <div className="feedback-container">
      {isOpen && (
        <div className="feedback-popup">
          <div className="feedback-header">
            <div className="header-content">
              <MessageSquare size={20} className="header-icon" />
              <h3>Share Your Feedback</h3>
            </div>
            <button 
              className="close-btn" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="success-state">
              <CheckCircle size={48} className="success-icon" />
              <h4>Thank You!</h4>
              <p>Your feedback helps us improve the experience for everyone.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Feedback Type */}

              {/* Rating */}
              <div className="form-group">
                <label className="form-label">
                  How would you rate your experience?
                </label>
                <div className="rating-container">
                  <div className="stars-wrapper">
                    {renderStars()}
                  </div>
                  <span className="rating-text">
                    {getRatingText()}
                  </span>
                </div>
              </div>

              {/* Feedback Text */}
              <div className="form-group">
                <label className="form-label">
                  Your Feedback {feedbackType !== "general" && `(${feedbackType})`}
                </label>
                <textarea
                  className="feedback-textarea"
                  placeholder={
                    feedbackType === "positive" 
                      ? "What did you like about your experience? What worked well?"
                      : feedbackType === "negative"
                      ? "What could we improve? Please share any issues or suggestions..."
                      : "Share your thoughts, suggestions, or anything else you'd like us to know..."
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  rows={4}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="char-count">
                  {feedback.length}/500 characters
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn"
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <Send size={16} />
                )}
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      )}

      <button 
        className="feedback-floating-btn"
        onClick={toggleForm}
        title="Share Feedback"
        disabled={isSubmitting}
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
};

export default FeedbackForm;