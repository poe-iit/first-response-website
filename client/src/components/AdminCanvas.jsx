import Background from './Background'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import MainControls from './MainControls'
import { useGesture } from '@use-gesture/react'
import ZoomControls from './ZoomControls'
import HelpControls from './HelpControls'
import { v4 as uuidv4 } from 'uuid'
import AdminNodes from './AdminNodes'
import { CanvasContext } from '../hook/CanvasContext'
import AdminLines from './AdminLines'
import PublishFloor from './PublishFloor'

/*
Make position, scale and size of canvas global
*/
const serverUrl = import.meta.env.VITE_SERVER_URL
const AdminCanvas = () => {
  const svgRef = useRef()
  const newNodeRef = useRef()


  const [mouseState, setMouseState] = useState(localStorage.getItem("adminMouseState") || "default")
  const [nodes, setNodes] = useState(JSON.parse(localStorage.getItem("adminNodes")) || {})
  const [buildings, setBuildings] = useState([])
  const [paths, setPaths] = useState(JSON.parse(localStorage.getItem("adminPaths")) || {})
  const state = "admin"

  useEffect(() => {
    fetch(`${serverUrl}/building`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json())
    .then(data => {
      console.log("Hey")
      console.log(data)
      setBuildings(data)
    }).catch(err => console.log("Error Here: ", err))
  }, [])

  useEffect(() => {
    localStorage["adminMouseState"] = mouseState
  }, [mouseState])

  useEffect(() => {
    localStorage["adminNodes"] = JSON.stringify(nodes) // save nodes
  }, [nodes])

  const [size, setSize] = useState({
    width: 0,
    height: 0
  })

  const [uploadPlan, setUploadPlan] = useState(false)
  
  const [locked, setLocked] = useState(false)

  const [nodeJoin, setNodeJoin] = useState(null)
  
  const [svgPosition, setSvgPosition] = useState(JSON.parse(localStorage.getItem("adminSvgPosition")) || [0, 0])
  const positionRef = useRef(svgPosition)
  const [svgScale, setSvgScale] = useState(JSON.parse(localStorage.getItem("adminSvgScale")) || 1)
  const [origin, setOrigin] = useState([0, 0])
  
  const [nodeSelected, setNodeSelected] = useState(false)

  useEffect(() => {
    if(!svgRef.current) return
    const handleResize = () => {
      setSize({width: svgRef.current.clientWidth, height: svgRef.current.clientHeight})
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    localStorage["adminSvgPosition"] = JSON.stringify(svgPosition)
  }, [svgPosition])

  useEffect(() => {
    localStorage["adminSvgScale"] = JSON.stringify(svgScale)
  }, [svgScale])

  useEffect(() => {
    localStorage["adminPaths"] = JSON.stringify(paths)
  }, [paths])

  useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      if(!down) positionRef.current = [...svgPosition]
      else{
        if(locked || nodeSelected)return
        setSvgPosition([(positionRef.current[0] || 0) + mx, (positionRef.current[1] || 0) + my])
      }
    },
    // Add more gesture options for different controls
    onPinch: (props) => {
      setSvgScale(svgScale + props.event.deltaY / -500) // Add velocity to make it smoother
    }
  }, {
    eventOptions: { passive: false},
    drag: { filterTaps: true },
    pinch: { filterTaps: true },
    wheel: { filterTaps: true },
    target: svgRef
  })

  useEffect(() => {
    if(localStorage["adminSvgPosition"]){
      const localPos = JSON.parse(localStorage["adminSvgPosition"])
      setSvgPosition(localPos)
      positionRef.current = localPos
    }
    if(localStorage["adminSvgScale"]){
      const localScale = parseFloat(localStorage["adminSvgScale"])
      setSvgScale(localScale)
    }
    if(svgRef.current)setOrigin([
      svgRef.current.clientHeight / 2,
      svgRef.current.clientWidth / 2
    ])
  }, [])

  useEffect(() => {
    // Use animation library to make movement smoother

    const handleMouseMove = (e) => {
      if(newNodeRef.current){
        const x = (e.clientX - svgPosition[0])
        const y = (e.clientY - svgPosition[1])
        const midX = size.width / 2
        const midY = size.height / 2 
        newNodeRef.current.setAttribute("cx", (x - midX + midX * svgScale) / svgScale)
        newNodeRef.current.setAttribute("cy", (y - midY + midY * svgScale) / svgScale)
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [svgPosition, svgScale, size])

  const handleMouseDown = (e) => {
    if(mouseState === "circle"){
      const x = (e.clientX - svgPosition[0])
      const y = (e.clientY - svgPosition[1])
      const midX = svgRef.current.clientWidth / 2
      const midY = svgRef.current.clientHeight / 2 
      setNodes({
        ...nodes,
        [uuidv4()]: {
          ui: {
            x: (x - midX + midX * svgScale) / svgScale,
            y: (y - midY + midY * svgScale) / svgScale,
          },
          connections: [],
          state: "safe", // safe, compromised, stuck
          isExit: false
        }
      })
    }
  }

  return (
    <CanvasContext.Provider value={{nodes, setNodes, mouseState, setMouseState, position: svgPosition,  setSvgPosition, scale: svgScale, setSvgScale, size, setSize, nodeJoin, setNodeJoin, locked, setLocked, state, paths, setPaths}}>
      <Container $svgPosition={svgPosition} $svgScale={svgScale} $origin={origin}>
        <MainControls positionRef={positionRef} setUploadPlan={setUploadPlan}/>
        <svg ref={svgRef} onMouseDown={handleMouseDown}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feFlood floodColor="#ff4000" floodOpacity="0.5" result="color"/>
              <feComposite in="color" in2="coloredBlur" operator="in" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Background svgRef={svgRef}/>
          <AdminLines />
          <AdminNodes setNodeSelected={setNodeSelected}/>
          {mouseState === "circle" && <circle
            id='newNode'
            ref={newNodeRef}
            cx={svgPosition[0]}
            cy={svgPosition[1]}
            r={20}
            fill="transparent"
            strokeWidth={2}
            stroke='var(--md-sys-color-outline)'
            strokeDasharray={"4 1"} 
          />}
        </svg>
        <ZoomControls />
        <HelpControls />
        <PublishFloor open={uploadPlan} setOpen={setUploadPlan} buildings={buildings} />
      </Container>
    </CanvasContext.Provider>
  )
}

export default AdminCanvas

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  position: relative;
  > svg{
    width: 100%;
    height: 100%;
    touch-action: none;
    background-image: url("./demo_background.png");
    circle, line, path{
      transform-origin: 50% 50%;
      transform: 
      translate(${props => props.$svgPosition[0]}px, ${props => props.$svgPosition[1]}px)
      scale(${props => props.$svgScale})
    }
    circle{
      /* cursor: move/grab */
      cursor: pointer;
    }
    line{
      cursor: pointer;
    }
  }
`