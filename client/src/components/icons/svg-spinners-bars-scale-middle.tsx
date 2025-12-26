import * as React from "react";

export function BarsScaleMiddleIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="2.8" height="12" x="1" y="6">
        <animate
          attributeName="y"
          begin="SVGKWB9Ob0W.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="SVGKWB9Ob0W.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="5.8" y="6">
        <animate
          attributeName="y"
          begin="SVGKWB9Ob0W.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="SVGKWB9Ob0W.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="10.6" y="6">
        <animate
          id="SVGKWB9Ob0W"
          attributeName="y"
          begin="0;SVGCkSt6baQ.end-0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="0;SVGCkSt6baQ.end-0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="15.4" y="6">
        <animate
          attributeName="y"
          begin="SVGKWB9Ob0W.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="SVGKWB9Ob0W.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="20.2" y="6">
        <animate
          id="SVGCkSt6baQ"
          attributeName="y"
          begin="SVGKWB9Ob0W.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="SVGKWB9Ob0W.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
    </svg>
  );
}
