import { EdgeProps, getBezierPath } from "@xyflow/react";
import React from "react";

export const CustomEdge = (props: EdgeProps) => {
    const {
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      selected,
      style = {},
    } = props;
  
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  
    return (
      <g className={`custom-edge ${selected ? "selected" : ""}`}>
        <path
          id={id}
          style={{
            stroke: "black", // Change the color when selected
            strokeWidth: selected ? 5 : 2, // Change stroke width when selected
            // ...style,
          }}
          className="react-flow__edge-path"
          d={edgePath}
        />
      </g>
    );
  };