import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, FunnelChart, GaugeChart, LineChart, PieChart } from "echarts/charts";
import { AriaComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Only the parts of Apache ECharts that Avrit uses, so the bundle stays small.
echarts.use([BarChart, LineChart, PieChart, GaugeChart, FunnelChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, AriaComponent, CanvasRenderer]);

export { echarts };

// One ECharts chart. Pass an `option` that is memoized (useMemo), so the chart is not redrawn on every render.
export default function EChart({ option, height = 300, label }) {
  const el = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    const instance = echarts.init(el.current, null, { renderer: "canvas" });
    chart.current = instance;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(el.current);
    return () => {
      observer.disconnect();
      instance.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, true);
  }, [option]);

  return <div ref={el} role="img" aria-label={label} style={{ height, width: "100%" }} />;
}