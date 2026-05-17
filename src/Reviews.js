// Reviews.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Reviews.css"; // optional styling

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Reviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Fetch reviews when productId changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/reviews?productId=${productId}`);
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load reviews.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to submit a review");
      return;
    }
    if (!newComment.trim()) {
      showToast("Please write a comment");
      return;
    }

    const reviewData = {
      productId: Number(productId),
      userId: user.email || user.id,
      userName: user.name || "Anonymous",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      if (!res.ok) throw new Error("Failed to save review");
      const savedReview = await res.json();
      // Optimistic update: add new review to the list
      setReviews((prev) => [savedReview, ...prev]);
      setNewComment("");
      setNewRating(5);
      showToast("✅ Review posted successfully!");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to post review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading) return <div className="reviews-loading">Loading reviews...</div>;
  if (error) return <div className="reviews-error">{error}</div>;

  return (
    <div className="reviews-container">
      {toastMsg && <div className="review-toast">{toastMsg}</div>}

      <div className="reviews-summary">
        <span className="avg-rating">⭐ {averageRating} / 5</span>
        <span className="review-count">
          ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
        </span>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmitReview} className="review-form">
          <div className="rating-select">
            <label>Your rating:</label>
            <select
              value={newRating}
              onChange={(e) => setNewRating(parseInt(e.target.value))}
              disabled={submitting}
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} {star === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Write your experience with this product..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            disabled={submitting}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="submit-review-btn"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="login-prompt">
          📝 <Link to="/login">Login</Link> to write a review.
        </p>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="review-card">
              <div className="review-header">
                <strong>{review.userName}</strong>
                <span className="review-stars">
                  {"⭐".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
                <small>{new Date(review.date).toLocaleDateString()}</small>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
