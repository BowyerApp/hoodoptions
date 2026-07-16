"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatUsd, useForge } from "@/store/forge";

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const activity = (useForge((s) => s.venue?.activity) ?? []).slice(0, limit);

  return (
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {activity.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between border-b border-border py-2.5 text-sm"
          >
            <div>
              <div>{a.label}</div>
              <div className="text-xs text-muted font-mono">
                {new Date(a.at).toLocaleTimeString()}
              </div>
            </div>
            {a.amount != null && (
              <div className="font-mono text-copper">{formatUsd(a.amount)}</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {activity.length === 0 && (
        <div className="text-sm text-muted py-6">Connecting to live tape…</div>
      )}
    </div>
  );
}
