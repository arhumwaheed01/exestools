import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type BaseProps = {
  label: string;
  helperText?: string;
  as?: "textarea" | "input";
};

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { as?: "textarea" };
type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & { as: "input" };
type Props = TextareaProps | InputProps;

export function ToolInput({
  label,
  helperText = "Type or paste text. Changes are reflected instantly.",
  as = "textarea",
  className = "",
  id,
  ...rest
}: Props) {
  const fieldId = id ?? `tool-input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const currentLength = typeof rest.value === "string" ? rest.value.length : 0;
  const isInput = as === "input";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={fieldId}
          className="text-sm font-semibold text-secondary-text"
        >
          {label}
        </label>
        <span className="text-xs font-medium text-secondary-text/70">
          {currentLength.toLocaleString()} characters
        </span>
      </div>
      <p className="text-xs text-secondary-text/75">{helperText}</p>
      <div
        className={`relative flex overflow-hidden rounded-xl border border-input-border/90 bg-background shadow-inner ring-1 ring-black/3 transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
          isInput
            ? "min-h-13"
            : "min-h-[min(12rem,40vh)] flex-1 lg:min-h-[280px]"
        }`}
      >
        {isInput ? (
          <input
            id={fieldId}
            className={`input m-0 h-13 w-full border-0 bg-transparent px-4 py-2 text-sm shadow-none ring-0 focus:border-transparent focus:outline-none focus:ring-0 md:px-5 md:text-base ${className}`.trim()}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        ) : (
          <textarea
            id={fieldId}
            className={`input m-0 min-h-[min(12rem,40vh)] w-full flex-1 resize-y border-0 bg-transparent p-4 text-sm shadow-none ring-0 focus:border-transparent focus:outline-none focus:ring-0 md:p-5 md:text-base lg:min-h-0 ${className}`.trim()}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )}
      </div>
    </div>
  );
}
