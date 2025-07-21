interface MateCloudLogoProps {
  className?: string;
}

const MateCloudLogo = ({ className = "w-12 h-12" }: MateCloudLogoProps) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background cloud - larger and more defined */}
      <path
        d="M25 16C27.2 16 29 14.2 29 12C29 9.8 27.2 8 25 8C24.6 8 24.2 8.1 23.8 8.2C22.9 5.3 20.1 3 16.8 3C12.8 3 9.5 6.3 9.5 10.3C9.5 10.4 9.5 10.5 9.5 10.6C7.5 10.9 6 12.7 6 14.8C6 17.1 7.9 19 10.2 19H25Z"
        fill="#60A5FA"
        opacity="0.8"
      />
      
      {/* Mate gourd - larger and more prominent */}
      <ellipse
        cx="16"
        cy="15"
        rx="4"
        ry="5"
        fill="#D97706"
      />
      
      {/* Mate rim */}
      <ellipse
        cx="16"
        cy="11.5"
        rx="3.2"
        ry="1.2"
        fill="#92400E"
      />
      
      {/* Mate opening (interior) */}
      <ellipse
        cx="16"
        cy="11.5"
        rx="2.2"
        ry="0.8"
        fill="#451A03"
      />
      
      {/* Bombilla (metal straw) - more prominent */}
      <rect
        x="15.6"
        y="7"
        width="0.8"
        height="6"
        fill="#9CA3AF"
        rx="0.4"
      />
      
      {/* Bombilla tip/filter */}
      <ellipse
        cx="16"
        cy="8"
        rx="0.6"
        ry="0.4"
        fill="#6B7280"
      />
      
      {/* Mate texture - enhanced details */}
      <path
        d="M13 14C13 15.5 14 17 16 17C18 17 19 15.5 19 14"
        stroke="#92400E"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M13.5 16C13.5 17.2 14.5 18.5 16 18.5C17.5 18.5 18.5 17.2 18.5 16"
        stroke="#92400E"
        strokeWidth="0.6"
        fill="none"
      />
      
      {/* Mate highlights */}
      <ellipse
        cx="14.5"
        cy="13"
        rx="0.8"
        ry="1.2"
        fill="#F59E0B"
        opacity="0.6"
      />
    </svg>
  );
};

export default MateCloudLogo;