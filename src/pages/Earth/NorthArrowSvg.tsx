export function NorthArrowSvg({
  size,
  style,
}: {
  size: number;
  style: React.SVGAttributes<SVGSVGElement>["style"];
}) {
  return (
    <svg
      style={style}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M47.655 1.634l-35 95c-.828 2.24 1.659 4.255 3.68 2.98l33.667-21.228l33.666 21.228c2.02 1.271 4.503-.74 3.678-2.98l-35-95C51.907.514 51.163.006 50 .008c-1.163.001-1.99.65-2.345 1.626zm-.155 14.88v57.54L19.89 91.461z"
        fill="currentColor"
        fillRule="evenodd"
      ></path>
    </svg>
  );
}
