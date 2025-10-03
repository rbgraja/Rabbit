import { Link } from "react-router-dom";
import { FaCommentAlt } from "react-icons/fa"; // Thoda better icon for reviews

function AddTestimonialLink() {
  return (
    <Link
      to="/testimonials"
      className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-shadow shadow-md"
    >
      <FaCommentAlt className="w-5 h-5" />
      See All Reviews
    </Link>
  );
}

export default AddTestimonialLink;
