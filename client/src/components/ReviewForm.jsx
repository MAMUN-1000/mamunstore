import { useState } from 'react';
import StarRating from './StarRating';
import axiosInstance from '../api/axiosInstance';
import { Send, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ReviewForm = ({ productId, existingReview = null, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim(),
      });

      if (onSuccess) {
        onSuccess(res.data.data.review);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-5 animate-fadeIn"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-sm text-slate-900">
          {existingReview ? 'Edit Your Review' : 'Write a Verified Customer Review'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Star Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Overall Rating <span className="text-rose-500">*</span>
        </label>
        <StarRating
          rating={rating}
          onChange={setRating}
          interactive={true}
          size="lg"
          showLabel={true}
        />
      </div>

      {/* Comment Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Your Review & Feedback
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this product? How is the build quality and performance?"
          maxLength={500}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none leading-relaxed"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Be helpful to other customers</span>
          <span>{comment.length}/500</span>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              {existingReview ? 'Update Review' : 'Submit Verified Review'}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
