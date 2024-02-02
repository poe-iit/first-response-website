import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, collection } from 'firebase/firestore'
import FloorDropDown from '../components/FloorDropDown';
import { useGesture } from '@use-gesture/react'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_CONFIG_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_CONFIG_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId:import.meta.env.VITE_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_CONFIG_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_CONFIG_MEASUREMENT_ID
};

const Sandbox = () => {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  const svgRef = useRef()

  const [floorId, setFloorId] = useState("")

  const [nodes, setNodes] = useState({})
  const [lines, setLines] = useState([])

  const getNodes = async () => {
    if(!floorId?.length) {
      setNodes({})
      return
    }
    const collectionRef = collection(db, "floors", floorId, "nodes")
    const collectionSnap = await getDocs(collectionRef)

    const tempNode = {}
    for(const docSnap of collectionSnap.docs){
      tempNode[docSnap.id] = docSnap.data()
    }
    setNodes(tempNode)
  }

  useEffect(() => {
    getNodes()
  }, [floorId])

  useEffect(() => {
    const set = new Set()
    const connections = []
    for(const key in nodes){
      for(const connection of nodes[key].connections){
        if(!set.has(key+ ", " +connection)){
          set.add(key+", "+connection)
          set.add(connection+", "+key)
          
          const nodeStart = nodes[key].ui
          const nodeEnd = nodes[connection].ui
          // Create a line svg to display each node connection
          connections.push(<line
            key={key+"-"+connection}
            x1={nodeStart.x} 
            y1={nodeStart.y} 
            x2={nodeEnd.x} 
            y2={nodeEnd.y} 
            stroke="black"
          />)
        }
      }
    }
    setLines(connections)
  }, [nodes])

  const alarmNode = (nodeId) => {
    const tempNodes = JSON.parse(JSON.stringify(nodes))
    tempNodes[nodeId].isDisabled = true

    const paths = []

    for(const nodeId in tempNodes){
      if(!tempNodes[nodeId].isDisabled)tempNodes[nodeId].isDisabled = 1
      if(tempNodes[nodeId].isExit)paths.push(nodeId)
    }

    for(const path of paths){
      const queue = [[null, path]]
      for(const [prevNode, nodeId] of queue){
        if(tempNodes[nodeId].isDisabled === true)continue
        tempNodes[nodeId].isDisabled = false
        for(const connections of tempNodes[nodeId].connections){
          if(connections === prevNode)continue
          if(tempNodes[connections].isDisabled === 1)queue.push([nodeId, connections])
        }
      }
    }

    for(const nodeId in tempNodes){
      if(tempNodes[nodeId].isDisabled === 1)tempNodes[nodeId].isDisabled = true
    }

    setNodes(tempNodes)
  }

  // Brute force it is

  const svgContainerRef = useRef()

  const [svgPosition, setSvgPosition] = useState([0, 0])
  const positionRef = useRef(svgPosition)
  const [svgScale, setSvgScale] = useState(1)
  const [origin, setOrigin] = useState([0, 0])
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
        setSvgPosition([(positionRef.current[0] || 0) + mx, (positionRef.current[1] || 0) + my])
      }
    },
    // Add more gesture options for different controls
    onPinch: ({ offset: [s]}) => {
      setSvgScale(s)
    }
  }, {
    eventOptions: { passive: false},
    drag: { filterTaps: true },
    pinch: { filterTaps: true },
    wheel: { filterTaps: true },
    target: svgRef
  })

  const resetNodes = () => {
    const tempNodes = JSON.parse(JSON.stringify(nodes))
    for(const nodeId in tempNodes){
      tempNodes[nodeId].isDisabled = false
    }
    setNodes(tempNodes)
  }

  return (
    <Container $svgPosition={svgPosition} $svgScale={svgScale} $origin={origin}>
      <FloorDropDown setFloorId={setFloorId} floorId={floorId}/>
      <div className='svg-container' ref={svgContainerRef}>
        <div className="svg-controls">
          {/* Add icons */}
          <button onClick={() => setSvgScale(svgScale + 0.1)}>Zoom in</button>
          <button onClick={() => setSvgScale(svgScale - 0.1)}>Zoom out</button>
          <button onClick={() => {
            setSvgPosition([0, 0])
            positionRef.current = [0, 0]
          }}>Center</button>
          <button onClick={() => {
            setSvgPosition([0, 0]);
            setSvgScale(1)
            positionRef.current = [0, 0]
          }}>Reset</button>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
          {
            lines.length && lines
          }
          {
            nodes && Object.keys(nodes).map((key) => {
              return <circle key={key} cx={nodes[key].ui.x} cy={nodes[key].ui.y} r="20" fill={nodes[key].isDisabled ? "red" : nodes[key].isExit ? "blue" : "green" }onClick={() => alarmNode(key)}/>
            })
          }
        </svg>
      </div>
      <button onClick={() => resetNodes()}>Reset Node States</button>
    </Container>
  )
}

export default Sandbox

const Container = styled.div`
  .svg-container{
    height: 80vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    > svg{
      width: 100%;
      height: 100%;
      touch-action: none;
      circle, line{
        transform-origin: 50% 50%;
        transform: 
        translate(${props => props.$svgPosition[0]}px, ${props => props.$svgPosition[1]}px)
        scale(${props => props.$svgScale})
      }
      background-color: #6060d168;
      circle{
        cursor: pointer;
      }
    }
    .svg-controls{
      position: absolute;
      right: 0;
      display: flex;
      flex-direction: column;
      width: 100px;
    }
  }
`