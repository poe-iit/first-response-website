import { useContext, useEffect, useRef } from "react"
import { Circle } from "react-konva"
import { CanvasContext } from "../hooks/CanvasContext"

const FollowNode = () => {
  // Work on mimicing a cursor pointer when hovering over certain things
  const { stageRef } = useContext(CanvasContext)
  const circleRef = useRef()
  const handleHover = (e) => {
    if(circleRef.current){
      circleRef.current.position({
        x: e.clientX,
        y: e.clientY
      })
    }
  }
  useEffect(() => {
    stageRef.current?.addEventListener("mousemove", handleHover)
    return () => {
      stageRef.current?.removeEventListener("mousemove", handleHover)
    }
  }, [])
  return (
    <Circle stroke="black" strokeWidth={2} radius={20} ref={circleRef} />
  )
}

export default FollowNode