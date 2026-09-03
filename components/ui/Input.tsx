import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] sm:text-[14px] font-medium text-[#1a1c1c]">
          {label}
          {required && <span className="text-[#c8181e] ml-0.5">*</span>}
        </label>
        <input
          ref={ref}
          className={cn(
            "h-10 sm:h-12 rounded-lg border border-[#d1d1d1] px-3 sm:px-4 text-sm sm:text-[15px] text-[#1a1c1c] bg-white outline-none transition-all",
            "focus:border-[#c8181e] focus:ring-2 focus:ring-[#c8181e]/10",
            error && "border-[#ba1a1a] focus:ring-0",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span className="text-[11px] sm:text-[12px] text-[#aaa]">{hint}</span>
        )}
        {error && (
          <span className="text-[11px] sm:text-[12px] text-[#ba1a1a]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;