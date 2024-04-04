import Background from './Background'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import MainControls from './MainControls'
import { useGesture } from '@use-gesture/react'
import { useParams, useNavigate } from 'react-router-dom'
import ZoomControls from './ZoomControls'
import HelpControls from './HelpControls'
import { v4 as uuidv4 } from 'uuid'
import AdminNodes from './AdminNodes'
import { CanvasContext } from '../hook/CanvasContext'
import AdminLines from './AdminLines'
import PublishFloor from './PublishFloor'
import UpdateFloor from './UpdateFloor'

/*
Make position, scale and size of canvas global
*/
const serverUrl = import.meta.env.VITE_SERVER_URL
const EditCanvas = () => {
  const navigate = useNavigate()
  const svgRef = useRef()
  const newNodeRef = useRef()
  const params = useParams()
  const [error, setError] = useState(false)

  const [mouseState, setMouseState] = useState(localStorage.getItem("editMouseState") || "default")
  const [nodes, setNodes] = useState(JSON.parse(localStorage.getItem("editNodes")) || {})
  const [paths, setPaths] = useState(JSON.parse(localStorage.getItem("editPaths")) || {})
  const [initial, setInitial] = useState(JSON.parse(localStorage.getItem("initial")) || {})
  const [buildings, setBuildings] = useState([])
  const [floorName, setFloorName] = useState("")
  const state = "edit"

  useEffect(() => {

    if(Object.keys(initial?.nodes || {}).length === 0) {
      fetch(`${serverUrl}/floor/${params.floor}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        setInitial(data)
        setNodes(data.nodes)
        setPaths(data.paths)
        setFloorName(data.name)
      })
      .catch(err =>{
        setError(true)
        console.log("Error Here: ", err)
      })
    }
  }, [initial])

  useEffect(() => {
    if(error)navigate("/404", { replace: true }) // go back to admin nav
  }, [error])

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
    localStorage["editMouseState"] = mouseState
  }, [mouseState])

  useEffect(() => {
    localStorage["editNodes"] = JSON.stringify(nodes) // save nodes
  }, [nodes])

  const [size, setSize] = useState({
    width: 0,
    height: 0
  })

  const [uploadPlan, setUploadPlan] = useState(false)
  
  const [locked, setLocked] = useState(false)

  const [nodeJoin, setNodeJoin] = useState(null)
  
  const [svgPosition, setSvgPosition] = useState(JSON.parse(localStorage.getItem("editSvgPosition")) || [0, 0])
  const positionRef = useRef(svgPosition)
  const [svgScale, setSvgScale] = useState(JSON.parse(localStorage.getItem("editSvgScale")) || 1)
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
    localStorage["editSvgPosition"] = JSON.stringify(svgPosition)
  }, [svgPosition])

  useEffect(() => {
    localStorage["editPaths"] = JSON.stringify(paths)
  }, [paths])

  useEffect(() => {
    localStorage["editSvgScale"] = JSON.stringify(svgScale)
  }, [svgScale])

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
    if(localStorage["editSvgPosition"]){
      const localPos = JSON.parse(localStorage["editSvgPosition"])
      setSvgPosition(localPos)
      positionRef.current = localPos
    }
    if(localStorage["editSvgScale"]){
      const localScale = parseFloat(localStorage["editSvgScale"])
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
    <CanvasContext.Provider value={{nodes, setNodes, mouseState, setMouseState, position: svgPosition,  setSvgPosition, scale: svgScale, setSvgScale, size, setSize, nodeJoin, setNodeJoin, locked, setLocked, state, setPaths, paths}}>
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
        {/* On publish set initial nodes to {} and change publish plan to edit plan component */}
        <UpdateFloor open={uploadPlan} setOpen={setUploadPlan} buildings={buildings} floorId={params.floor} floorName={floorName} setFloorName={setFloorName} initial={initial} setInitial={setInitial}/>
      </Container>
    </CanvasContext.Provider>
  )
}

export default EditCanvas

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