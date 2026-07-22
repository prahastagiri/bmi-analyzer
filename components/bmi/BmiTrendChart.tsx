"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateIdealWeightRange } from "@/lib/calculations";
import { FREE_CHART_DAYS } from "@/lib/tiers";
import { formatNumber, formatShortDate } from "@/lib/utils";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 18, bottom: 30, left: 46 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

const NORMAL_BMI_MIN = 18.5;
const NORMAL_BMI_MAX = 24.9;

// Butuh minimal 3 titik agar tren terbaca — sejalan dengan Definition of Done.
const MIN_POINTS = 3;

interface TrendItem {
  created_at: string;
  weight_kg: number | string;
  bmi_value: number | string;
  height_cm: number | string;
}

interface ParsedPoint {
  time: number;
  weight: number;
  bmi: number;
  heightCm: number;
}

interface ChartCoord {
  x: number;
  y: number;
  point: ParsedPoint;
}

interface ChartGeometry {
  coords: ChartCoord[];
  domainMin: number;
  domainMax: number;
  yFor: (value: number) => number;
  bandTop: number | null;
  bandBottom: number | null;
  firstLabel: string;
  lastLabel: string;
}

interface BmiTrendChartProps {
  items: TrendItem[];
  premium?: boolean;
}

export function BmiTrendChart({ items, premium = false }: BmiTrendChartProps) {
  const [metric, setMetric] = useState<"bmi" | "weight">("bmi");

  // Oldest -> newest so the line reads left-to-right in time order. Pengguna
  // free hanya melihat jendela FREE_CHART_DAYS terakhir; premium melihat semua.
  // Jendela dihitung relatif ke entri TERBARU (bukan Date.now()) agar memo tetap
  // murni & deterministik terhadap data.
  const points = useMemo(() => {
    const parsed = [...(items ?? [])]
      .map((item) => ({
        time: new Date(item.created_at).getTime(),
        weight: Number(item.weight_kg),
        bmi: Number(item.bmi_value),
        heightCm: Number(item.height_cm),
      }))
      .filter(
        (point) =>
          Number.isFinite(point.time) &&
          Number.isFinite(point.weight) &&
          Number.isFinite(point.bmi)
      )
      .sort((a, b) => a.time - b.time);

    if (premium || parsed.length === 0) {
      return parsed;
    }

    const latestTime = parsed[parsed.length - 1].time;
    const cutoff = latestTime - FREE_CHART_DAYS * 24 * 60 * 60 * 1000;

    return parsed.filter((point) => point.time >= cutoff);
  }, [items, premium]);

  const enoughData = points.length >= MIN_POINTS;

  // Healthy zone for the current metric. Weight zone uses the most recent
  // entry's height so it reflects the user's current build.
  const band = useMemo(() => {
    if (metric === "bmi") {
      return { min: NORMAL_BMI_MIN, max: NORMAL_BMI_MAX };
    }

    const latest = points[points.length - 1];

    if (!latest || !Number.isFinite(latest.heightCm) || latest.heightCm <= 0) {
      return null;
    }

    const range = calculateIdealWeightRange(latest.heightCm);
    return { min: range.lower, max: range.upper };
  }, [metric, points]);

  const geometry = useMemo((): ChartGeometry | null => {
    if (!enoughData) {
      return null;
    }

    const values = points.map((point) =>
      metric === "bmi" ? point.bmi : point.weight
    );

    let domainMin = Math.min(...values);
    let domainMax = Math.max(...values);

    // Keep the healthy band visible even if all readings sit outside it.
    if (band) {
      domainMin = Math.min(domainMin, band.min);
      domainMax = Math.max(domainMax, band.max);
    }

    // Pad the domain so points never touch the top/bottom edges.
    const span = domainMax - domainMin || 1;
    domainMin -= span * 0.08;
    domainMax += span * 0.08;

    const times = points.map((point) => point.time);
    const timeMin = Math.min(...times);
    const timeMax = Math.max(...times);
    const timeSpan = timeMax - timeMin;

    const xFor = (time: number): number =>
      timeSpan === 0
        ? PADDING.left + PLOT_WIDTH / 2
        : PADDING.left + ((time - timeMin) / timeSpan) * PLOT_WIDTH;

    const yFor = (value: number): number =>
      PADDING.top +
      (1 - (value - domainMin) / (domainMax - domainMin)) * PLOT_HEIGHT;

    const coords: ChartCoord[] = points.map((point) => ({
      x: xFor(point.time),
      y: yFor(metric === "bmi" ? point.bmi : point.weight),
      point,
    }));

    return {
      coords,
      domainMin,
      domainMax,
      yFor,
      bandTop: band ? yFor(band.max) : null,
      bandBottom: band ? yFor(band.min) : null,
      firstLabel: formatShortDate(points[0].time),
      lastLabel: formatShortDate(points[points.length - 1].time),
    };
  }, [band, enoughData, metric, points]);

  const digits = 1;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Tren {metric === "bmi" ? "BMI" : "berat badan"}</CardTitle>
            <CardDescription>
              Perkembangan hasil yang kamu simpan, dengan pita hijau sebagai zona
              sehat.
            </CardDescription>
          </div>
          <div className="flex gap-2" role="group" aria-label="Pilih metrik grafik">
            <Button
              type="button"
              size="sm"
              variant={metric === "bmi" ? "default" : "secondary"}
              onClick={() => setMetric("bmi")}
            >
              BMI
            </Button>
            <Button
              type="button"
              size="sm"
              variant={metric === "weight" ? "default" : "secondary"}
              onClick={() => setMetric("weight")}
            >
              Berat
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {enoughData && geometry ? (
          <figure className="space-y-3">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="h-auto w-full min-w-[320px]"
                role="img"
                aria-label={`Grafik tren ${
                  metric === "bmi" ? "BMI" : "berat badan"
                } dari ${points.length} pengukuran tersimpan.`}
              >
                {/* Healthy zone band */}
                {geometry.bandTop !== null && geometry.bandBottom !== null ? (
                  <g>
                    <rect
                      x={PADDING.left}
                      y={geometry.bandTop}
                      width={PLOT_WIDTH}
                      height={Math.max(geometry.bandBottom - geometry.bandTop, 0)}
                      fill="#10b981"
                      fillOpacity="0.12"
                    />
                    <line
                      x1={PADDING.left}
                      x2={PADDING.left + PLOT_WIDTH}
                      y1={geometry.bandTop}
                      y2={geometry.bandTop}
                      stroke="#10b981"
                      strokeOpacity="0.4"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1={PADDING.left}
                      x2={PADDING.left + PLOT_WIDTH}
                      y1={geometry.bandBottom}
                      y2={geometry.bandBottom}
                      stroke="#10b981"
                      strokeOpacity="0.4"
                      strokeDasharray="4 4"
                    />
                  </g>
                ) : null}

                {/* Axis frame */}
                <line
                  x1={PADDING.left}
                  x2={PADDING.left}
                  y1={PADDING.top}
                  y2={PADDING.top + PLOT_HEIGHT}
                  stroke="#e2e8f0"
                />
                <line
                  x1={PADDING.left}
                  x2={PADDING.left + PLOT_WIDTH}
                  y1={PADDING.top + PLOT_HEIGHT}
                  y2={PADDING.top + PLOT_HEIGHT}
                  stroke="#e2e8f0"
                />

                {/* Y axis labels: domain max (top) and min (bottom) */}
                <text
                  x={PADDING.left - 8}
                  y={PADDING.top + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {formatNumber(geometry.domainMax, digits)}
                </text>
                <text
                  x={PADDING.left - 8}
                  y={PADDING.top + PLOT_HEIGHT}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {formatNumber(geometry.domainMin, digits)}
                </text>

                {/* Trend line */}
                <path
                  d={geometry.coords
                    .map((coord, index) =>
                      `${index === 0 ? "M" : "L"} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Points */}
                {geometry.coords.map((coord) => (
                  <circle
                    key={coord.point.time}
                    cx={coord.x}
                    cy={coord.y}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                ))}

                {/* X axis labels: first and last date */}
                <text
                  x={PADDING.left}
                  y={HEIGHT - 8}
                  textAnchor="start"
                  fontSize="11"
                  fill="#64748b"
                >
                  {geometry.firstLabel}
                </text>
                <text
                  x={PADDING.left + PLOT_WIDTH}
                  y={HEIGHT - 8}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {geometry.lastLabel}
                </text>
              </svg>
            </div>
            <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-sky-600" />
                {metric === "bmi" ? "Nilai BMI" : "Berat badan"}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-4 rounded-sm bg-emerald-500/30" />
                {metric === "bmi"
                  ? "Zona BMI normal (18,5-24,9)"
                  : "Zona berat sehat"}
              </span>
            </figcaption>
            {!premium ? (
              <p className="text-xs text-slate-500">
                Menampilkan {FREE_CHART_DAYS} hari terakhir.{" "}
                <Link
                  href="/upgrade"
                  className="font-semibold text-amber-700 hover:underline"
                >
                  Upgrade untuk grafik penuh →
                </Link>
              </p>
            ) : null}
          </figure>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Grafik tren muncul setelah kamu punya minimal {MIN_POINTS} hasil
              tersimpan.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {points.length === 0
                ? "Belum ada hasil tersimpan. Ukur dan simpan secara rutin — misalnya seminggu sekali — untuk melihat progresmu."
                : `Baru ada ${points.length} hasil. Tambah ${
                    MIN_POINTS - points.length
                  } lagi untuk melihat pola perkembanganmu.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
