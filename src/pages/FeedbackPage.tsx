import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, ThumbsUp } from "lucide-react";
import Header from "@/components/layout/Header";
import { mockOrders } from "@/data/mockOrders";
import { toast } from "sonner";

const FeedbackPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const order = mockOrders.find((o) => o.id === id);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const quickTags = ["Great food", "Fast delivery", "Well packed", "Value for money", "Fresh ingredients", "Tasty"];

  if (!order) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="container max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary font-medium mt-2 inline-block">Back to orders</Link>
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (restaurantRating === 0) { toast.error("Please rate the restaurant"); return; }
    setSubmitted(true);
    toast.success("Thank you for your feedback! 🙏");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-md py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="h-10 w-10 text-accent" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">Thank You!</h2>
          <p className="text-sm text-muted-foreground mt-2">Your feedback helps us improve</p>
          <Link to="/orders" className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-lg pb-20 px-4">
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Link to={`/order/${id}`} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <h1 className="font-display font-bold text-xl text-foreground">Rate Your Experience</h1>
        </div>

        {/* Order info */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-foreground">{order.restaurantName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{order.id} · {order.items.map((i) => i.name).join(", ")}</p>
        </div>

        {/* Restaurant rating */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">How was the food?</h3>
          <div className="flex gap-2 justify-center mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRestaurantRating(s)} className="p-1">
                <Star className={`h-10 w-10 transition-colors ${s <= restaurantRating ? "fill-warning text-warning" : "text-muted hover:text-warning/50"}`} />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {restaurantRating === 0 ? "Tap to rate" : restaurantRating <= 2 ? "We'll do better" : restaurantRating <= 3 ? "Average" : restaurantRating === 4 ? "Good!" : "Excellent!"}
          </p>
        </div>

        {/* Delivery rating */}
        {order.deliveryPartnerName && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">
              How was the delivery by {order.deliveryPartnerName}?
            </h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setDeliveryRating(s)} className="p-1">
                  <Star className={`h-8 w-8 transition-colors ${s <= deliveryRating ? "fill-warning text-warning" : "text-muted hover:text-warning/50"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick tags */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-4">
          <h3 className="font-display font-bold text-sm text-foreground mb-3">What did you like?</h3>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button key={tag}
                onClick={() => setReview((prev) => prev.includes(tag) ? prev.replace(tag + ", ", "").replace(tag, "") : prev ? prev + ", " + tag : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  review.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Written review */}
        <div className="p-4 rounded-xl bg-card shadow-card mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">Write a Review (optional)</h3>
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us more about your experience..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-gradient-hero text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity">
          Submit Feedback
        </button>
      </main>
    </div>
  );
};

export default FeedbackPage;
