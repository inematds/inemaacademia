import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { createElement } from "react";

function GraphSkeleton() {
  return createElement(Skeleton, {
    className: "w-full rounded-xl h-[400px]",
  });
}

function InputSkeleton() {
  return createElement(Skeleton, {
    className: "w-full rounded-xl h-14",
  });
}

export const LazyDesmosGraph = dynamic(
  () =>
    import("@/components/math/desmos-graph").then((m) => m.DesmosGraph),
  {
    ssr: false,
    loading: GraphSkeleton,
  },
);

export const LazyGeoGebraEmbed = dynamic(
  () =>
    import("@/components/math/geogebra-embed").then((m) => m.GeoGebraEmbed),
  {
    ssr: false,
    loading: GraphSkeleton,
  },
);

export const LazyMathInput = dynamic(
  () => import("@/components/math/math-input").then((m) => m.MathInput),
  {
    ssr: false,
    loading: InputSkeleton,
  },
);

export const LazyMathDisplay = dynamic(
  () =>
    import("@/components/math/math-display").then((m) => m.MathDisplay),
  {
    ssr: false,
  },
);
