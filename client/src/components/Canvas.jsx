import { useContext } from 'react'
import Background from './Background'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'
import Lines from './Lines'
import Nodes from './Nodes'
import { AuthContext } from '../hook/AuthContext'
import { onValue, ref, get } from 'firebase/database'
import MainControls from './MainControls'
import { useGesture } from '@use-gesture/react'
import ZoomControls from './ZoomControls'
import Menu from './Menu'
import HelpControls from './HelpControls'

const convertObjToArr = (obj) => {
  const arr = []
  for(const key in obj){
    arr.push(obj[key])
  }
  return arr
}

const Canvas = () => {
  const { db } = useContext(AuthContext)

  const [nodes, setNodes] = useState()
  const svgRef = useRef()

  const [floors, setFloors] = useState([])
  const [floorId, setFloorId] = useState(localStorage.getItem("floorId") || "")

  const [mouseState, setMouseState] = useState(localStorage.getItem("mouseState") || "default")

  
  
  
  // const floorId = "d16efd4b-21ac-4bb7-8d54-52ade69973c3"
  
  // const [floorId, setFloorId] = useState("d16efd4b-21ac-4bb7-8d54-52ade69973c3")
  
  const [locked, setLocked] = useState(JSON.parse(localStorage.getItem("locked")) || false)
  
  const [svgPosition, setSvgPosition] = useState(JSON.parse(localStorage.getItem("svgPosition")) || [0, 0])
  const positionRef = useRef(svgPosition)
  const [svgScale, setSvgScale] = useState(JSON.parse(localStorage.getItem("svgScale")) || 1)
  const [origin, setOrigin] = useState([0, 0])


  useEffect(() => {
    localStorage["mouseState"] = mouseState
  }, [mouseState])

  useEffect(() => {
    localStorage["floorId"] = floorId
  }, [floorId])
  
  useEffect(() => {
    // Inefficient way to get all floors
    // Should be refactored
    if(db){
      (async () => {
        const collectionRef = ref(db, "buildings/DF6QbHKTyxHlBnf4MBeZ/floors")
        const collectionSnap = await get(collectionRef)
        const tempFloors = collectionSnap.exists() ? collectionSnap.val() : {}
        console.log(tempFloors)
        setFloors(tempFloors)
      })()
    }
  }, [db])

  useEffect(() => {
    if(!floorId?.length || !db) return
    // getNodes()
    const unsubscribe = onValue(ref(db, `buildings/DF6QbHKTyxHlBnf4MBeZ/floors/${floorId}/nodes`), (collectionSnap) => {
      const tempNodes = collectionSnap.exists() ? JSON.parse(JSON.stringify(collectionSnap.val())) : {}

      for(const nodeId in tempNodes){
        tempNodes[nodeId].connections = convertObjToArr(tempNodes[nodeId].connections)
      }

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
    })
    return unsubscribe
  }, [floorId, db])

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
    <Container $svgPosition={svgPosition} $svgScale={svgScale} $origin={origin}>
      <Menu floors={floors} floorId={floorId} setFloorId={setFloorId} />
      <MainControls locked={locked} setLocked={setLocked} setNodes={setNodes} nodes={nodes} setSvgPosition={setSvgPosition} setSvgScale={setSvgScale} positionRef={positionRef} floorId={floorId} setMouseState={setMouseState} mouseState={mouseState}/>
      <svg ref={svgRef}>
        <Background svgPosition={svgPosition} svgScale={svgScale} svgRef={svgRef}/>
        <Lines nodes={nodes}/>
        <Nodes nodes={nodes} floorId={floorId} setNodes={setNodes} mouseState={mouseState} />
      </svg>
      <ZoomControls svgScale={svgScale} setSvgScale={setSvgScale} />
      <HelpControls />
    </Container>
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
    // background-color: #6060d168;
    background-image: url("./demo_background.png");
    /* background-color: #f2f2f2; //  */
    /* polygon{
      transform: translate(10px, 10px)
      scale(${props => props.$svgScale});
    } */
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