/* eslint-disable react/prop-types */
import "./Button.module.css";
function Button({ className, children, onClick, type, loading }) {
  return (
    <button
      className={className}
      onClick={onClick}
      type={type}
      disabled={loading}
    >
      {children}
    </button>
  );
}

export default Button;
