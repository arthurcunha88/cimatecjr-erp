import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, placeholder = "Selecione", className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] sm:text-[14px] font-medium text-[#1a1c1c]">
          {label}
          {required && <span className="text-[#c8181e] ml-0.5">*</span>}
        </label>
        <select
          ref={ref}
          className={cn(
            "h-10 sm:h-12 rounded-lg border border-[#d1d1d1] px-3 sm:px-4 pr-8 text-sm sm:text-[15px] text-[#1a1c1c] bg-white outline-none appearance-none transition-all",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center]",
            "focus:border-[#c8181e] focus:ring-2 focus:ring-[#c8181e]/10",
            error && "border-[#ba1a1a] focus:ring-0",
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-[11px] sm:text-[12px] text-[#ba1a1a]">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;