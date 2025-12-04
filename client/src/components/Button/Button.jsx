/* eslint-disable react/prop-types */
import styles from "./Button.module.css";
function Button({ children, onClick, type }) {
  return (
    <button className={styles.button} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export default Button;
