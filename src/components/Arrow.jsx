import { Line, Shape } from "react-konva"

const Arrow = ({x, y, rotation, color}) => {
  return (
    // Dist 20, height = 10
    // 0,0        20,0

    //    10,10

    // Dist = 20, height 10
    // -5, 0, 5
    // -10,-5       10,-5

    //         0,5


    <Line
      points={[-13, -5, 0, 7, 13, -5]}
      stroke="black"
      fill={color}
      strokeWidth={0}
      x={x}
      y={y}
      closed
      rotation={rotation}
    />
  )
}

export default Arrow