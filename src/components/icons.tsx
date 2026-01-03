import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 16.5C18.5 14 21.5 14.5 21.5 14.5C21.5 14.5 20.5 18 17.5 21.5C14.5 25 10.5 25 10.5 25C10.5 25 11 20.5 14.5 16.5Z" />
      <path d="M12 2C12 2 8 8.5 12 13" />
      <path d="M12 13C16 8.5 20 2 20 2" />
      <path d="M2.5 11C2.5 11 6.5 12.5 10 12.5C13.5 12.5 17.5 11 17.5 11" />
      <path d="M10 12.5C4.81163 12.6599 2.5 17 2.5 17" />
      <path d="M14 12.5C19.1884 12.6599 21.5 17 21.5 17" />
    </svg>
  );
}
