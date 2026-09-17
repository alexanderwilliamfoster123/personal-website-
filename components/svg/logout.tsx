interface LogoutIconProps {
  className?: string;
}

export default function LogoutIcon({ className }: LogoutIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M8.33333 2.57918C8.71417 2.52701 9.10372 2.5 9.5 2.5C13.9183 2.5 17.5 5.85786 17.5 10C17.5 14.1421 13.9183 17.5 9.5 17.5C9.10372 17.5 8.71417 17.473 8.33333 17.4208"
        stroke="currentColor"
        strokeLinecap="round"
      />

      <path
        d="M2.50016 10L10.8335 10M2.50016 10C2.50016 9.41647 4.16208 8.32627 4.5835 7.91666M2.50016 10C2.50016 10.5835 4.16208 11.6737 4.5835 12.0833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}