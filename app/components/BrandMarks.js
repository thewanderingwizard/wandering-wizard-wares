import { MoonStar } from "lucide-react";

export function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <MoonStar size={22} strokeWidth={1.7} />
    </span>
  );
}

export function MetatronsCube({ className = "" }) {
  const outer = [
    [50, 12],
    [83, 31],
    [83, 69],
    [50, 88],
    [17, 69],
    [17, 31],
  ];
  const inner = [
    [50, 31],
    [66.5, 40.5],
    [66.5, 59.5],
    [50, 69],
    [33.5, 59.5],
    [33.5, 40.5],
  ];

  return (
    <svg
      className={`metatron-cube ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <g className="cube-lines">
        <path d="M50 12 83 69 17 69Z M50 88 83 31 17 31Z" />
        <path d="M50 12V88M17 31 83 69M83 31 17 69" />
        <path d="M50 31 66.5 59.5 33.5 59.5ZM50 69 66.5 40.5 33.5 40.5Z" />
        <path d="M50 50 50 12M50 50 83 31M50 50 83 69M50 50 50 88M50 50 17 69M50 50 17 31" />
        <path d="M50 12 66.5 40.5 83 69 50 69 17 69 33.5 40.5ZM83 31 66.5 59.5 50 88 33.5 59.5 17 31 50 31Z" />
      </g>
      <g className="cube-circles">
        <circle cx="50" cy="50" r="8" />
        {inner.map(([cx, cy]) => (
          <circle key={`i-${cx}-${cy}`} cx={cx} cy={cy} r="8" />
        ))}
        {outer.map(([cx, cy]) => (
          <circle key={`o-${cx}-${cy}`} cx={cx} cy={cy} r="8" />
        ))}
      </g>
    </svg>
  );
}

export function AlchemySeal({ className = "" }) {
  return (
    <svg
      className={`alchemy-seal ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="68" />
      <circle cx="80" cy="80" r="54" />
      <circle cx="80" cy="80" r="19" />
      <path d="M80 22 130 109H30L80 22Z" />
      <path d="m80 138-50-87h100l-50 87Z" />
      <path d="M80 12v20M80 128v20M12 80h20M128 80h20" />
      <path d="m31.9 31.9 14.2 14.2m67.8 67.8 14.2 14.2m0-96.2-14.2 14.2m-67.8 67.8-14.2 14.2" />
      <path d="M59 80a21 21 0 0 1 42 0 21 21 0 0 1-42 0Z" />
      <circle cx="80" cy="80" r="5" />
      <circle cx="80" cy="22" r="3.5" />
      <circle cx="130" cy="109" r="3.5" />
      <circle cx="30" cy="109" r="3.5" />
    </svg>
  );
}
