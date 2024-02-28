import { useEffect, useState } from 'react'

const Background = ({svgScale, svgPosition, svgRef}) => {

  const [backgroundPattern, setBackgroundPattern] = useState([])

  useEffect(() => {
    const updateBackground = () => {
      //Set lines as pattern
      if(!svgPosition || !svgScale)return
      const gap = 60
      const width = svgRef.current.clientWidth / svgScale + gap // / svgScale
      const height = svgRef.current.clientHeight / svgScale + gap
      let x = -svgPosition[0] - (
        svgRef.current.clientWidth * (1-svgScale) / 2
      )
      x = Math.floor(x / (gap * svgScale)) * gap
      let y = -svgPosition[1] - (
        svgRef.current.clientHeight * (1-svgScale) / 2
      )
      y = Math.floor(y / (gap * svgScale)) * gap
      let start = 0

      const tempPattern = []
      while(start < height){
        tempPattern.push(
          <line key={start} x1={x} y1={y + start} x2={x+width} y2={y + start} stroke={((y + start )/ gap) % 5 ? "#e6e6e6" : "#b5b5b5"} />
          )
        start += gap
      }
      tempPattern.push(
        <line key={start} x1={x} y1={y + start} x2={x+width} y2={y + start} stroke={((y + start) / gap) % 5 ? "#e6e6e6" : "#b5b5b5"} />
      )
      start = 0
      while(start < width){
        tempPattern.push(
          <line key={start+"x"} x1={x + start} y1={y} x2={x + start} y2={y+height} stroke={((x + start) / gap) % 5 ? "#e6e6e6" : "#b5b5b5"} /> // #e6e6e6
        )
        start += gap
      }
      tempPattern.push(
        <line key={start+"x"} x1={x + start} y1={y} x2={x + start} y2={y+height} stroke={((x + start) / gap) % 5 ? "#e6e6e6" : "#b5b5b5"} /> // #e6e6e6
      )
      setBackgroundPattern(tempPattern)
    }
    window.addEventListener("resize", updateBackground)
    updateBackground()
    return () => {
      window.removeEventListener("resize", updateBackground)
    }
  }, [svgScale, svgPosition])
  return (
    <>
      {backgroundPattern}
    </>
  )
}

export default Background