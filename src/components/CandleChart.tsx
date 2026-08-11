"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type MouseEventParams,
} from "lightweight-charts";
import clsx from "clsx";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const RANGES = ["1D", "1W", "1M", "1Y"] as const;
type Range = (typeof RANGES)[number];

const UP = "#3ddc97";
const DOWN = "#e85d4c";

function fmt(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Real OHLCV candles from the venue's market feed, terminal-styled. */
export function CandleChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [range, setRange] = useState<Range>("1D");
  const [loading, setLoading] = useState(true);
  const [legend, setLegend] = useState<Candle | null>(null);
  const lastCandleRef = useRef<Candle | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(221,226,234,0.45)",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.24 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(169,138,91,0.35)", labelBackgroundColor: "#171a20" },
        horzLine: { color: "rgba(169,138,91,0.35)", labelBackgroundColor: "#171a20" },
      },
      height: 380,
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
      priceLineColor: "rgba(169,138,91,0.6)",
      priceLineStyle: 3,
    });
    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: "vol",
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.84, bottom: 0 },
      borderVisible: false,
    });

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      const bar = param.seriesData.get(candles) as Candle | undefined;
      if (bar && typeof bar.open === "number") {
        setLegend({ ...bar, time: Number(param.time), volume: 0 });
      } else {
        setLegend(lastCandleRef.current);
      }
    });

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/candles?symbol=${symbol}&range=${range}`);
      if (!res.ok) return;
      const data = (await res.json()) as { candles: Candle[] };
      if (!candleRef.current || !volumeRef.current || !data.candles?.length)
        return;
      candleRef.current.setData(
        data.candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
      volumeRef.current.setData(
        data.candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color:
            c.close >= c.open ? "rgba(61,220,151,0.22)" : "rgba(232,93,76,0.22)",
        }))
      );
      chartRef.current?.timeScale().fitContent();
      const last = data.candles[data.candles.length - 1];
      lastCandleRef.current = last;
      setLegend(last);
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const changePct =
    legend && legend.open > 0
      ? ((legend.close - legend.open) / legend.open) * 100
      : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
          {legend ? (
            <>
              <span>
                O <span className="text-text">{fmt(legend.open)}</span>
              </span>
              <span>
                H <span className="text-text">{fmt(legend.high)}</span>
              </span>
              <span>
                L <span className="text-text">{fmt(legend.low)}</span>
              </span>
              <span>
                C <span className="text-text">{fmt(legend.close)}</span>
              </span>
              <span className={changePct >= 0 ? "text-up" : "text-down"}>
                {changePct >= 0 ? "+" : ""}
                {changePct.toFixed(2)}%
              </span>
            </>
          ) : (
            <span>{loading ? "LOADING FEED…" : "NO DATA"}</span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              data-cursor
              onClick={() => setRange(r)}
              className={clsx(
                "px-2.5 py-1 font-mono text-[11px] transition-colors",
                range === r
                  ? "bg-copper-dim text-copper"
                  : "text-muted hover:text-text"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
