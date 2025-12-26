import { Loader2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import propTypes from "prop-types";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

Spinner.propTypes = {
  className: propTypes.string,
};

export { Spinner };
