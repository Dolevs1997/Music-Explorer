/* eslint-disable react/prop-types */
import "./Button.module.css";
function Button({ children, onClick, type, loading }) {
  return (
    <button onClick={onClick} type={type} disabled={loading}>
      {children}
    </button>
  );
}

export default Button;
