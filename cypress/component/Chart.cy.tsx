/**
 * 组件测试：图表组件
 * 
 * 使用 Cypress Component Testing 测试单个组件
 */
import React from "react";
import { mount } from "cypress/react18";
import { Chart } from "@/element/Chart/index";
import type { IChartProps } from "@/element/Chart/index";

describe("Chart Component", () => {
  const defaultProps: IChartProps = {
    id: "test-chart-1",
    type: "chart",
    chartType: "radar1",
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    option: {
      dataset: {
        source: [
          ["name", "value"],
          ["A", 30],
          ["B", 80],
          ["C", 45],
          ["D", 60],
        ],
      },
      radar: {
        indicator: [
          { name: "A", max: 100 },
          { name: "B", max: 100 },
          { name: "C", max: 100 },
          { name: "D", max: 100 },
        ],
      },
      series: {
        type: "radar",
        data: [
          {
            value: [30, 80, 45, 60],
            itemStyle: { color: "#5F95FF" },
          },
        ],
      },
    },
  };

  it("should render chart component", () => {
    mount(<Chart {...defaultProps} />);
    
    // 验证图表容器存在
    cy.get(`[id="dom_${defaultProps.id}"]`).should("exist");
  });

  it("should handle double click to open data modal", () => {
    mount(<Chart {...defaultProps} />);
    
    // 双击图表
    cy.get(`[id="dom_${defaultProps.id}"]`).dblclick();
    
    // 这里需要根据实际实现来验证弹窗是否打开
    // 可能需要 mock 事件总线或其他依赖
  });
});

