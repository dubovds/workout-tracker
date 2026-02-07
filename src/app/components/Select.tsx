"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = Readonly<{
  id: string;
  label: string;
}>;

type SelectProps = Readonly<{
  value: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}>;

export default function Select({
  value,
  options,
  onChange,
  placeholder = "Select...",
  "aria-label": ariaLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value),
    [options, value]
  );

  // Only calculate selectedIndex when dropdown is open to optimize performance
  const selectedIndex = useMemo(
    () => (isOpen ? options.findIndex((opt) => opt.id === value) : -1),
    [isOpen, options, value]
  );

  const handleSelect = useCallback(
    (optionId: string) => {
      onChange(optionId);
      setIsOpen(false);
      setFocusedIndex(-1);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation handlers - extracted for better readability
  const handleArrowDown = useCallback(() => {
    setFocusedIndex((prev) => {
      const next = prev < options.length - 1 ? prev + 1 : 0;
      optionRefs.current.get(next)?.focus();
      return next;
    });
  }, [options]);

  const handleArrowUp = useCallback(() => {
    setFocusedIndex((prev) => {
      const next = prev > 0 ? prev - 1 : options.length - 1;
      optionRefs.current.get(next)?.focus();
      return next;
    });
  }, [options]);

  const handleEnter = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < options.length) {
      const optionId = options[focusedIndex]?.id;
      if (optionId) {
        handleSelect(optionId);
      }
    }
  }, [focusedIndex, options, handleSelect]);

  const handleEscape = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const handleHome = useCallback(() => {
    setFocusedIndex(0);
    optionRefs.current.get(0)?.focus();
  }, []);

  const handleEnd = useCallback(() => {
    const lastIndex = options.length - 1;
    setFocusedIndex(lastIndex);
    optionRefs.current.get(lastIndex)?.focus();
  }, [options]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          handleArrowDown();
          break;
        case "ArrowUp":
          event.preventDefault();
          handleArrowUp();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          handleEnter();
          break;
        case "Escape":
          event.preventDefault();
          handleEscape();
          break;
        case "Home":
          event.preventDefault();
          handleHome();
          break;
        case "End":
          event.preventDefault();
          handleEnd();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleArrowDown, handleArrowUp, handleEnter, handleEscape, handleHome, handleEnd]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;
    const indexToFocus = selectedIndex >= 0 ? selectedIndex : 0;
    const timer = window.setTimeout(() => {
      optionRefs.current.get(indexToFocus)?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, selectedIndex]);

  const handleButtonClick = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return !prev;
    });
  }, [selectedIndex]);

  const listboxId = `select-listbox-${value}`;
  const buttonId = `select-button-${value}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        onClick={handleButtonClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel || "Select an option"}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 text-left text-base font-medium text-zinc-900 shadow-sm outline-none transition hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel || "Options"}
          className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
        >
          <div className="py-2">
            {options.map((option, index) => {
              const isSelected = option.id === value;
              const isFocused = index === focusedIndex;
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    if (el) {
                      optionRefs.current.set(index, el);
                    } else {
                      optionRefs.current.delete(index);
                    }
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full px-4 py-3 text-left text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  } ${
                    isFocused && !isSelected
                      ? "bg-zinc-50 dark:bg-zinc-900"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
