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
      
      {/* Mate gourd - rotated sideways */}
      <ellipse
        cx="16"
        cy="15"
        rx="5"
        ry="3.5"
        fill="#D97706"
      />
      
      {/* Mate rim/opening - now on the side */}
      <ellipse
        cx="20.5"
        cy="15"
        rx="1.2"
        ry="2.8"
        fill="#92400E"
      />
      
      {/* Mate opening (interior) */}
      <ellipse
        cx="20.5"
        cy="15"
        rx="0.8"
        ry="2"
        fill="#451A03"
      />
      
      {/* Bombilla (metal straw) - now horizontal and more visible */}
      <rect
        x="21"
        y="14.6"
        width="6"
        height="0.8"
        fill="#9CA3AF"
        rx="0.4"
      />
      
      {/* Bombilla tip/filter */}
      <ellipse
        cx="26.5"
        cy="15"
        rx="0.4"
        ry="0.6"
        fill="#6B7280"
      />
      
      {/* Mate texture - adjusted for sideways position */}
      <path
        d="M14 13C15.5 13 17 14 17 16C17 18 15.5 19 14 19"
        stroke="#92400E"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M16 13.5C17.2 13.5 18.5 14.5 18.5 16C18.5 17.5 17.2 18.5 16 18.5"
        stroke="#92400E"
        strokeWidth="0.6"
        fill="none"
      />
      
      {/* Mate highlights */}
      <ellipse
        cx="15"
        cy="14.5"
        rx="1.2"
        ry="0.8"
        fill="#F59E0B"
        opacity="0.6"
      />
    </svg>
  );
};

export default MateCloudLogo;