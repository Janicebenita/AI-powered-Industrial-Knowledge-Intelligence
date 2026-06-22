"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function ProcessingTimeline({ steps }: { steps: string[] }) {
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-500/20 text-cyan-200">
            <CheckCircle2 size={16} />
          </span>
          <span className="text-sm font-medium">{step}</span>
        </motion.div>
      ))}
    </div>
  );
}
