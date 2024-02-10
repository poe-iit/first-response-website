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

  const [paths, setPaths] = useState()

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
    if(!paths)return
    const set = new Set()
    const connections = []
    for(const key in nodes){
      if(key in paths)continue
      let distNode = [Number.MAX_SAFE_INTEGER, null]
      for(const exit in paths){
        if(paths[exit].distances[key] && paths[exit].distances[key] < distNode[0]){
          distNode = [paths[exit].distances[key], paths[exit].prev[key]]
        }
      }

      if(distNode[0] === Number.MAX_SAFE_INTEGER) continue
      const nodeStart = nodes[key].ui
      const nodeEnd = nodes[distNode[1]].ui
      // Create a line svg to display each node connection
      connections.push(<line
        key={key+"-"+distNode[1]}
        x1={nodeStart.x} 
        y1={nodeStart.y} 
        x2={nodeEnd.x} 
        y2={nodeEnd.y} 
        stroke="black"
      />)
      connections.push(
        <polygon
          key={key+"-"+distNode[1]+"-end"}
          id={key}
          points={(nodeStart.x)+ "," + nodeStart.y + " " + (nodeStart.x - 10) + "," + (nodeStart.y - 10) + " " + (nodeStart.x - 10) + "," + (nodeStart.y)}
          fill='black'
          style={{
            transformOrigin: (nodeStart.x) + "px " + (nodeStart.y) + "px",
            transform: "rotate(" +( Math.atan2((nodeStart.y - nodeEnd.y), (nodeStart.x - nodeEnd.x)) * 180 / Math.PI + 45 ) + "deg)" + "\n" + "translate(-8px, 20px)"
          }}
        />
      )
      set.add(key+", "+distNode[1])
      set.add(distNode[1]+", "+key)
    }

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
  }, [paths])

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

  useEffect(() => {
    if(nodes){
      function dijkstra(graph, startNode) {
        const distances = {}; // Store distances from the start node
        const prev = {}; // Store the previous node in the optimal path
        const visited = new Set(); // Track visited nodes
        for(const node in nodes){
          if(nodes[node].isDisabled)visited.add(node)
        }
        const queue = []; // Priority queue of nodes to visit
      
        // Initialize distances and queue
        for (let node in graph) {
          distances[node] = Infinity;
          queue.push(node);
          prev[node] = null;
        }
        distances[startNode] = 0;
      
        while (queue.length !== 0) {
          // Sort queue by distance (simple priority queue)
          queue.sort((a, b) => distances[a] - distances[b]);
          const currentNode = queue.shift(); // Node with the shortest distance
          visited.add(currentNode);
      
          for (let neighbor of graph[currentNode].connections) {
            if (visited.has(neighbor)) continue; // Skip visited nodes
      
            // Calculate new distance
            const newDistance = distances[currentNode] + (
              (
                graph[currentNode].ui.x - graph[neighbor].ui.x
              )**2 + (
                graph[currentNode].ui.y - graph[neighbor].ui.y
              )**2
            )**(1/2);
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance; // Update distance
              prev[neighbor] = currentNode; // Update path
            }
          }
        }
      
        return { distances, prev };
      }

      const tempPaths = {}
  
      // Example usage
      for(const node in nodes){
        if(nodes[node].isExit && !nodes[node].isDisabled){
          const result = dijkstra(nodes, node);
          tempPaths[node] = {
            ...result
          }
        }
      }
      setPaths(tempPaths)
    }
  }, [nodes])

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
      /* polygon{
        transform: translate(10px, 10px)
        scale(${props => props.$svgScale});
      } */
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