"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type Time,
} from "lightweight-charts";
import { useForge } from "@/store/forge";

export function PriceChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const price = useForge((s) => s.venue?.prices?.[symbol]);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(242,237,228,0.45)",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, visible: false },
      crosshair: { vertLine: { color: "#c4a57455" }, horzLine: { color: "#c4a57455" } },
      height: 320,
    });
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#c4a574",
      topColor: "rgba(196,165,116,0.25)",
      bottomColor: "rgba(196,165,116,0)",
      lineWidth: 2,
    });
    const base = price || 100;
    const data: AreaData[] = [];
    const now = Math.floor(Date.now() / 1000);
    let p = base * 0.98;
    for (let i = 80; i >= 0; i--) {
      p = p * (1 + (Math.random() - 0.48) * 0.004);
      data.push({ time: (now - i * 60) as Time, value: p });
    }
    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    });
    ro.observe(ref.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  useEffect(() => {
    if (!seriesRef.current || !price) return;
    seriesRef.current.update({
      time: Math.floor(Date.now() / 1000) as Time,
      value: price,
    });
  }, [price]);

  return <div ref={ref} className="w-full" />;
}
