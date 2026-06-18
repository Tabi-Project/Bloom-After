"use client";
const FilterButton = ({
  onClick,
  isActive,
  text,
}: {
  onClick: () => void;
  isActive: boolean;
  text: string;
}) => {
  return (
    <button
      className={`filter-btn ${isActive ? "active" : ""}`}
      aria-pressed={isActive}
      data-filter={text}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default FilterButton;
