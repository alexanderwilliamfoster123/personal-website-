import React, { useId } from "react";

interface FolderIconProps extends React.SVGProps<SVGSVGElement> {}

const FolderIcon = (props: FolderIconProps) => {
  const id = useId();
  const maskId = `mask-${id.replace(/:/g, "")}`;
  const gradId = `grad-${id.replace(/:/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 169 104"
      fill="none"
      {...props}
    >
      <mask id={maskId} fill="white">
        <path d="M160.223 0C164.641 1.90735e-06 168.223 3.58177 168.223 8V95.2393C168.223 99.6575 164.641 103.239 160.223 103.239H8C3.58174 103.239 2.0744e-05 99.6575 0 95.2393V8C5.45956e-05 3.58177 3.58176 0 8 0H160.223Z" />
      </mask>

      <path
        d="M160.223 0C164.641 1.90735e-06 168.223 3.58177 168.223 8V95.2393C168.223 99.6575 164.641 103.239 160.223 103.239H8C3.58174 103.239 2.0744e-05 99.6575 0 95.2393V8C5.45956e-05 3.58177 3.58176 0 8 0H160.223Z"
        fill={`url(#${gradId})`}
        stroke="var(--Neutral-300-05, rgba(39, 39, 39, 0.05))"
        strokeWidth="1"
      />

      {/* Subtle inner edge */}
      <path
        d="M160.223 0V-1V-1V0ZM168.223 8H169.223V7.99999L168.223 8ZM168.223 95.2393L169.223 95.2393V95.2393H168.223ZM160.223 103.239V104.239V103.239ZM8 103.239L8 104.239H8V103.239ZM0 95.2393H-1V95.2393L0 95.2393ZM0 8L-1 7.99999V8H0ZM8 0V-1V0ZM160.223 0V1C164.089 1 167.223 4.13404 167.223 8.00001L168.223 8L169.223 7.99999C169.223 3.02949 165.193 -0.999998 160.223 -1V0ZM168.223 8H167.223V95.2393H168.223H169.223V8H168.223ZM168.223 95.2393L167.223 95.2393C167.223 99.1052 164.089 102.239 160.223 102.239V103.239V104.239C165.193 104.239 169.223 100.21 169.223 95.2393L168.223 95.2393ZM160.223 103.239V102.239H8V103.239V104.239H160.223V103.239ZM8 103.239V102.239C4.13403 102.239 1.00002 99.1052 1 95.2393L0 95.2393L-1 95.2393C-0.999977 100.21 3.02945 104.239 8 104.239L8 103.239ZM0 95.2393H1V8H0H-1V95.2393H0ZM0 8L1 8.00001C1.00005 4.13404 4.13405 1 8 1V0V-1C3.02946 -1 -0.999939 3.02949 -1 7.99999L0 8ZM8 0V1H160.223V0V-1H8V0Z"
        fill="#272727"
        fillOpacity="0.05"
        mask={`url(#${maskId})`}
      />

      <defs>
        <linearGradient
          id={gradId}
          x1="84.1113"
          y1="-12.0449"
          x2="84.1113"
          y2="103.239"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--1800, #EAEAEA)" />
          <stop offset="1" stopColor="var(--1700, #DDD)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default FolderIcon;