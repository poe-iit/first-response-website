import React, { useContext, useEffect, useState } from 'react'
import { Line } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const Background = () => {

  const { stageRef } = useContext(CanvasContext)
  const lineDistance = 55
  const [horizontalLines, setHorizontalLines] = useState([])
  const [verticalLines, setVerticalLines] = useState([])

  // stageRef.curren

  const createLines = () => {
    const position = stageRef.current.position()
    const { height, width } = stageRef.current.attrs

    const scale = stageRef.current.scaleX()

    const startX = position.x / scale ,
          startY = position.y / scale
          
    const verticalLines = [], horizontalLines = []

    let horizontalX = -startX, horizontalY = -startY
    const horizontalMod = horizontalY % lineDistance
    const outlinedHorizontalMod = horizontalY % (lineDistance * 5)
    let outlinedHorizontalLine = horizontalY - outlinedHorizontalMod

    horizontalY += (lineDistance - horizontalMod)
    horizontalY -= lineDistance*2 // Backward buffer

    while(outlinedHorizontalLine > horizontalY)outlinedHorizontalLine -= lineDistance * 5

    const horizontalLineCount = Math.ceil(height / (lineDistance * scale)) + 4
    // + 2 for backward +2 for forward
    for(let i = 0; i < horizontalLineCount; i++){
      while(outlinedHorizontalLine < horizontalY)outlinedHorizontalLine += lineDistance * 5
      horizontalLines.push({
        stroke: outlinedHorizontalLine === horizontalY ? 
        (scale < 0.5 ? "black" : "#b5b5b5") : 
        (scale < 0.5 ? "#b5b5b5" : "#e6e6e6"),
        points: [horizontalX, horizontalY, horizontalX + (width / scale), horizontalY]
      })
      horizontalY += lineDistance
    }
    
    let verticalX = -startX, verticalY = -startY
    const verticalMod = verticalX % lineDistance
    const outlinedVerticalMod = verticalX % (lineDistance * 5)
    let outlinedVerticalLine = verticalX - outlinedVerticalMod

    verticalX += (lineDistance - verticalMod)
    verticalX -= lineDistance*2 // Backward buffer

    while(outlinedVerticalLine > verticalX)outlinedVerticalLine -= lineDistance * 5

    const verticalLineCount = Math.ceil(width / (lineDistance * scale)) + 4
    // + 2 for backward +2 for forward
    for(let i = 0; i < verticalLineCount; i++){
      while(outlinedVerticalLine < verticalX)outlinedVerticalLine += lineDistance * 5
      verticalLines.push({
        stroke: outlinedVerticalLine === verticalX ? 
        (scale < 0.5 ? "black" : "#b5b5b5") : 
        (scale < 0.5 ? "#b5b5b5" : "#e6e6e6"),
        points: [verticalX, verticalY, verticalX, (height / scale) + verticalY]
      })
      verticalX += lineDistance
    }
    setHorizontalLines(horizontalLines)
    setVerticalLines(verticalLines)
  }



  useEffect(() => {
    createLines()
    console.log(stageRef)
    stageRef.current?.addEventListener("dragmove positionchanged zoom", createLines)
    window.addEventListener("resize", createLines)
    return () => {
      stageRef.current?.removeEventListener("dragmove positionchanged zoom", createLines)
      window.removeEventListener("resize", createLines)
    }
  }, [])

  return (
    <>
      {
        verticalLines.map((line, key) => <Line key={key} points={line.points} stroke={line.stroke} strokeWidth={1}/>)
      }
      {
        horizontalLines.map((line, key) => <Line key={key} points={line.points} stroke={line.stroke} strokeWidth={1}/>)
      }
    </>
  )
}

// Vertical |

// Horizontal -
// x, 0, x, 0 + width

export default Background