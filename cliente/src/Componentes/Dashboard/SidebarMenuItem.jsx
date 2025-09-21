import React from "react";
import { MdArrowRight } from "react-icons/md";

export const SidebarMenuItem = ({
  title,
  icon,
  subItems,
  isOpen,
  onToggle,
}) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-700 focus:outline-none"
      >
        <div className="flex items-center">
          {icon}
          <span>{title}</span>
        </div>
        <MdArrowRight
          className={`w-4 h-4 transform transition-transform ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {subItems.map((item) => (
            <button
              key={item}
              className="w-full p-2 text-sm text-left rounded-lg transition-colors hover:bg-gray-700 focus:outline-none"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
