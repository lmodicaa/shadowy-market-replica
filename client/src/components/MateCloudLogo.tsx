interface MateCloudLogoProps {
  className?: string;
}

const MateCloudLogo = ({ className = "w-6 h-6" }: MateCloudLogoProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud shape */}
      <path
        d="M18.5 12.5C20.433 12.5 22 10.933 22 9C22 7.067 20.433 5.5 18.5 5.5C18.228 5.5 17.964 5.53 17.712 5.586C17.107 3.527 15.166 2 12.85 2C10.021 2 7.7 4.321 7.7 7.15C7.7 7.234 7.702 7.317 7.706 7.4C6.191 7.582 5 8.878 5 10.45C5 12.139 6.361 13.5 8.05 13.5H18.5Z"
        fill="currentColor"
        className="text-blue-400"
        opacity="0.7"
      />
      
      {/* Mate gourd */}
      <ellipse
        cx="12"
        cy="11"
        rx="2.5"
        ry="3"
        fill="currentColor"
        className="text-amber-600"
      />
      
      {/* Mate opening */}
      <ellipse
        cx="12"
        cy="9"
        rx="1.2"
        ry="0.8"
        fill="currentColor"
        className="text-amber-800"
      />
      
      {/* Bombilla (straw) */}
      <rect
        x="11.8"
        y="6"
        width="0.4"
        height="3.5"
        fill="currentColor"
        className="text-gray-400"
        rx="0.2"
      />
      
      {/* Bombilla tip */}
      <circle
        cx="12"
        cy="6.5"
        r="0.3"
        fill="currentColor"
        className="text-gray-500"
      />
      
      {/* Mate texture lines */}
      <path
        d="M10.5 10.5C10.5 11.5 11 12.5 12 12.5C13 12.5 13.5 11.5 13.5 10.5"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="none"
        className="text-amber-700"
      />
      <path
        d="M10.8 12C10.8 12.8 11.2 13.5 12 13.5C12.8 13.5 13.2 12.8 13.2 12"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="none"
        className="text-amber-700"
      />
    </svg>
  );
};

export default MateCloudLogo;