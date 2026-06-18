// src/components/Filters/CountryFilter.jsx
import { useState, useRef, useEffect } from "react";

export default function CountryFilter({ countries, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCountry =
    countries.find((c) => c.code === value) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          {/* Country Flag */}
          {selectedCountry.code !== "all" && (
            <span className="text-xl">
              {selectedCountry.code === "GB"
                ? "🇬🇧"
                : selectedCountry.code === "US"
                  ? "🇺🇸"
                  : selectedCountry.code === "CA"
                    ? "🇨🇦"
                    : selectedCountry.code === "AU"
                      ? "🇦🇺"
                      : selectedCountry.code === "ZA"
                        ? "🇿🇦"
                        : "🌍"}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {selectedCountry.name}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                value === country.code
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700"
              }`}
            >
              {country.code !== "all" && (
                <span className="text-lg">
                  {country.code === "GB"
                    ? "🇬🇧"
                    : country.code === "US"
                      ? "🇺🇸"
                      : country.code === "CA"
                        ? "🇨🇦"
                        : country.code === "AU"
                          ? "🇦🇺"
                          : country.code === "ZA"
                            ? "🇿🇦"
                            : "🌍"}
                </span>
              )}
              <span className="text-sm">{country.name}</span>
              {value === country.code && (
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
