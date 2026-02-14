/* eslint-disable react/prop-types */
import styles from "./Button.module.css";
function Button({ children, onClick, type, loading }) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      type={type}
      disabled={loading}
    >
      {children}
    </button>
  );
}

export default Button;
