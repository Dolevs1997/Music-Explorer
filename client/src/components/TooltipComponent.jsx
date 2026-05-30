import React from "react";
import propTypes from "prop-types";
import styles from "./TooltipComponent.module.css";

function TooltipComponent({ children, text, placement = "bottom" }) {
  const placementClass = placement === "top" ? styles.top : styles.bottom;

  return (
    <div className={styles.tooltipWrapper}>
      {children}
      <div className={`${styles.tooltipContent} ${placementClass}`}>{text}</div>
    </div>
  );
}

TooltipComponent.propTypes = {
  children: propTypes.any,
  text: propTypes.oneOfType([propTypes.string, propTypes.node]),
  placement: propTypes.string,
};

export default TooltipComponent;
