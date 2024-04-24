import Background from './Background'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import Lines from './Lines'
import Nodes from './Nodes'
import MainControls from './MainControls'
import Image from './Image'
import { useGesture } from '@use-gesture/react'
import ZoomControls from './ZoomControls'
import Menu from './Menu'
import HelpControls from './HelpControls'
import { CanvasContext } from '../hook/CanvasContext'

const Canvas = () => {

  const [nodes, setNodes] = useState()
  const svgRef = useRef()

  const [floors, setFloors] = useState([])
  const [floor, setFloor] = useState(JSON.parse(localStorage.getItem("floor")) || {})
  const [buildings, setBuildings] = useState([])
  const [building, setBuilding] = useState(JSON.parse(localStorage.getItem("building")) || {})
  const [paths, setPaths] = useState(JSON.parse(localStorage.getItem("paths")) || {})
  const state = "view"
  const [mouseState, setMouseState] = useState(localStorage.getItem("mouseState") || "default")
  const mouseStateRef = useRef(mouseState)
  const [image, setImage] = useState({})
  const [locked, setLocked] = useState(false)
  
  const [svgPosition, setSvgPosition] = useState(JSON.parse(localStorage.getItem("svgPosition")) || [0, 0])
  const positionRef = useRef(svgPosition)
  const [svgScale, setSvgScale] = useState(JSON.parse(localStorage.getItem("svgScale")) || 1)
  const [origin, setOrigin] = useState([0, 0])

  useEffect(() => {
    localStorage["mouseState"] = mouseState
    mouseStateRef.current = mouseState
  }, [mouseState])

  useEffect(() => {
    localStorage["floor"] = JSON.stringify(floor)
  }, [floor])

  useEffect(() => {
    localStorage["building"] = JSON.stringify(building)
  }, [building])

  useEffect(() => {
    localStorage["paths"] = JSON.stringify(paths)
  }, [paths])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/building`, {
      method: "GET",
    }).then(res => res.json())
    .then(data => {
      console.log(data)
      setBuildings(data)
    })
  }, [])
  
  useEffect(() => {
    // Inefficient way to get all floors
    // Should be refactored
    if(!building?._id) return
    fetch(`${import.meta.env.VITE_SERVER_URL}/building/${building._id}`, {
      method: "GET",
    }).then(res => res.json())
    .then(data => {
      setFloors(data.floors)
    })
    .catch(err => console.log("Error Here: ", err))
  }, [building])


  useEffect(() => {
    const ws = new WebSocket('wss://first-response-server.onrender.com');

    ws.onopen = function() {
      console.log('Connected to the server');
      console.log(floor?.id)
      ws.send(JSON.stringify({
        type: "floor-update",
        floorId: floor?.id || ""
      }));
    };

    ws.onmessage = function(evt) {
      const data = JSON.parse(evt.data)
      console.log(data)
      if(!data?.error){

        const tempNodes = data.nodes
        setPaths(data.paths)
        setImage(data.image || {})

        const paths = []

        for(const nodeId in tempNodes){
          if(tempNodes[nodeId].state !== "compromised")tempNodes[nodeId].state = 1
          if(tempNodes[nodeId].isExit)paths.push(nodeId)
        }

        for(const path of paths){
          const queue = [[null, path]]
          for(const [prevNode, nodeId] of queue){
            if(tempNodes[nodeId].state === "compromised")continue
            tempNodes[nodeId].state = "safe"
            for(const connections of tempNodes[nodeId].connections){
              if(connections === prevNode)continue
              if(tempNodes[connections].state === 1)queue.push([nodeId, connections])
            }
          }
        }

        for(const nodeId in tempNodes){
          if(tempNodes[nodeId].state === 1){
            tempNodes[nodeId].state = "stuck"
          }
        }

        setNodes(tempNodes)
      }
    };

    ws.onclose = function() {
      console.log('Disconnected from the server');
    };

    return () => {
      ws.close()
    }
  }, [floor])

  useEffect(() => {
    localStorage["svgPosition"] = JSON.stringify(svgPosition)
  }, [svgPosition])

  useEffect(() => {
    localStorage["svgScale"] = JSON.stringify(svgScale)
  }, [svgScale])

  useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      if(!down) positionRef.current = [...svgPosition]
      else{
        if(locked)return
        setSvgPosition([(positionRef.current[0] || 0) + mx, (positionRef.current[1] || 0) + my])
      }
    },
    // Add more gesture options for different controls
    onPinch: (props) => {
      console.log(props)
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
    if(localStorage["svgPosition"]){
      const localPos = JSON.parse(localStorage["svgPosition"])
      setSvgPosition(localPos)
      positionRef.current = localPos
    }
    if(localStorage["svgScale"]){
      const localScale = parseFloat(localStorage["svgScale"])
      setSvgScale(localScale)
    }
    if(svgRef.current)setOrigin([
      svgRef.current.clientHeight / 2,
      svgRef.current.clientWidth / 2
    ])
  }, [])

  return (
    <CanvasContext.Provider value={{nodes, setNodes, mouseState, setMouseState, mouseStateRef, position: svgPosition, setSvgPosition, scale: svgScale, setSvgScale, locked, setLocked, floor, setFloor, building, setBuilding, state, paths, setPaths, image, setImage}}>
      <Container $svgPosition={svgPosition} $svgScale={svgScale} $origin={origin}>
        <Menu floors={floors} buildings={buildings} />
        <MainControls positionRef={positionRef} />
        <svg ref={svgRef} id="canvas">
          <Background svgRef={svgRef}/>
          <Image />
          <Lines />
          <Nodes />
        </svg>
        <ZoomControls />
        <HelpControls />
      </Container>
    </CanvasContext.Provider>
  )
}

export default Canvas

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
      cursor: pointer;
    }
  }
`