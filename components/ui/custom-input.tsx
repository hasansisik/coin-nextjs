import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const showLabel = Boolean(props.value) || Boolean(props.placeholder) || props.type === 'date';
    const gradientBorder = error
      ? "linear-gradient(to right, #ef4444, #ef4444)"
      : "linear-gradient(to right, #2563CC, #309D9A)";
    
    return (
      <div className="relative">
        {/* Main input with border */}
        <div className="relative">
          {/* Gradient border container */}
          <div 
            className="absolute inset-0 rounded-md z-0" 
            style={{ 
              background: gradientBorder,
              padding: "2px",
            }}
          >
            <div className="h-full w-full bg-black rounded-md"></div>
          </div>
          
          {/* Input field */}
          <input
            className={cn(
              "relative w-full bg-transparent text-white rounded-md px-4 py-3 outline-none border-0 z-10",
              "placeholder:text-slate-400/70",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Create the border gap effect */}
          {showLabel && (
            <>
              <div
                className="absolute h-[2px] bg-black z-10"
                style={{
                  top: "0px",
                  left: "10px",
                  width: `${label.length * 6 + 10}px`
                }}
              />
              
              {/* Label text floating on top */}
              <div
                className="absolute z-20 px-1"
                style={{
                  top: "-12px",
                  left: "12px"
                }}
              >
                <span
                  className={cn(
                    "text-xs",
                    error ? "text-red-500" : "bg-clip-text text-transparent"
                  )}
                  style={{
                    backgroundImage: error ? "none" : gradientBorder,
                  }}
                >
                  {label}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput }; 