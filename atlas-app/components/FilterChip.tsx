"use client";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? "bg-teal text-white"
          : "bg-gray-light text-gray-text hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
