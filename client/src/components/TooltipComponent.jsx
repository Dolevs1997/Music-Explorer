import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import propTypes from "prop-types";
import React from "react";

function TooltipComponent({ children, text, placement = "bottom", delay = { show: 250, hide: 100 } }) {
  return (
    <OverlayTrigger placement={placement} delay={delay} overlay={<Tooltip id="tooltip">{text}</Tooltip>}>
      {children}
    </OverlayTrigger>
  );
}

TooltipComponent.propTypes = {
  children: propTypes.any,
  text: propTypes.oneOfType([propTypes.string, propTypes.node]),
  placement: propTypes.string,
  delay: propTypes.object,
};

export default TooltipComponent;
