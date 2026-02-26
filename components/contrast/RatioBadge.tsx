interface RatioBadgeProps {
  level: "AA" | "AAA";
  pass: boolean;
}

export function RatioBadge({ level, pass }: RatioBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        pass
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {level} {pass ? "Pass" : "Fail"}
    </span>
  );
}
