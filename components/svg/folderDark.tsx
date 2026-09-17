"use client";

import React, { useId } from "react";

interface DarkFolderIconProps
    extends React.SVGProps<SVGSVGElement> { }

const DarkFolderIcon = (props: DarkFolderIconProps) => {
    const id = useId();

    const maskId = `mask-${id.replace(/:/g, "")}`;
    const gradId = `grad-${id.replace(/:/g, "")}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 168 105"
            fill="none"
            {...props}
        >
            <mask id={maskId} fill="white">
                <path d="M43.3027 0C44.6967 1.0848e-05 46.0415 0.365782 47.2217 1.0293H160C164.418 1.02941 168 4.61109 168 9.0293V96.1309C168 100.549 164.418 104.131 160 104.131H8C3.58172 104.131 0 100.549 0 96.1309V9.0293C0 8.47616 0.0552225 7.93559 0.162109 7.41406C0.461956 3.26935 3.91755 0.000252128 8.13867 0H43.3027Z" />
            </mask>

            {/* Main folder */}
            <path
                d="M43.3027 0C44.6967 1.0848e-05 46.0415 0.365782 47.2217 1.0293H160C164.418 1.02941 168 4.61109 168 9.0293V96.1309C168 100.549 164.418 104.131 160 104.131H8C3.58172 104.131 0 100.549 0 96.1309V9.0293C0 8.47616 0.0552225 7.93559 0.162109 7.41406C0.461956 3.26935 3.91755 0.000252128 8.13867 0H43.3027Z"
                fill={`url(#${gradId})`}
                stroke="var(--Neutral-300-05, rgba(39, 39, 39, 0.05))"
                strokeWidth="1"
            />



            <defs>
                <linearGradient
                    id={gradId}
                    x1="84"
                    y1="0"
                    x2="84"
                    y2="104.131"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#171717" />
                    <stop offset="1" stopColor="#080808" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default DarkFolderIcon;