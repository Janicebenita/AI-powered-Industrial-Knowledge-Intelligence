import { cn } from "@/lib/utils";

export function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("min-h-10 rounded-lg bg-blue-500 px-4 font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60", className)} {...props}>
      {children}
    </button>
  );
}
