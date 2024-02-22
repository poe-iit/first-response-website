import { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import Node from '../components/Node'
import InputModal from '../components/InputModal'
import { doc, setDoc } from 'firebase/firestore'
import { set, ref } from 'firebase/database'
import { AuthContext } from '../hook/AuthContext'

// Make sure all nodes have at least one connection/exit
// Change connections to objects instead of array

const convertArrToObj = (arr) => {
  const obj = {}
  for(let i = 0; i < arr.length; i++){
    obj[i] = arr[i]
  }
  return obj
}

const Admin = () => {
  // Add checks to make sure the paths have at least one exit and any other thing you can think of
  // Add pan and zoom
  // Add undo and redo
  // Add save and load
  // Create a buffer so the circle created isn't out of bounds
  // Add a way to delete nodes from the displayed array too (create a dialog box for delete confirmation)
  const { db } = useContext(AuthContext)

  const svgRef = useRef()

  const [selectedNode, setSelectedNode] = useState(null)

  const [nodes, setNodes] = useState(JSON.parse(localStorage.getItem("nodes")) || {})
  const [lines, setLines] = useState([])

  const [selectedOption, setSelectedOption] = useState("move")

  const [connectNodes, setConnectNodes] = useState([])
  const [disconnectNodes, setDisconnectNodes] = useState([])

  const [openInputModal, setOpenInputModal] = useState(false)
  const [nodeId, setNodeId] = useState("")

  const [openFloorModal, setOpenFloorModal] = useState(false)
  const [floorName, setFloorName] = useState("")

  const handleClick = (e, key)=> {
    e.stopPropagation()
    setSelectedNode(key)
    if(selectedOption === "connect"){
      setConnectNodes(prev => {
        if(prev[0] !== key){
          return [...prev, key]
        }
        return prev
      })
    }else if(selectedOption === "disconnect"){
      setDisconnectNodes(prev => {
        if(prev[0] !== key){
          return [...prev, key]
        }
        return prev
      })
    }else if(selectedOption === "delete"){
      setNodes(prev => {
        const newNodes = {...prev}
        for(const connection of newNodes[key].connections){
          newNodes[connection].connections = newNodes[connection].connections.filter(node => node !== key)
        }
        delete newNodes[key]
        return newNodes
      })
    }else if(selectedOption === "toggle"){
      setNodes(prev => {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            isExit: !!!prev[key].isExit
          }
        }
      })
      
    }
  }

  useEffect(() => {
    if(connectNodes?.length === 2){
      setNodes(prevNodes => {
        return {
          ...prevNodes,
          [connectNodes[0]]: {
            ...prevNodes[connectNodes[0]],
            connections: [...new Set([...prevNodes[connectNodes[0]].connections, connectNodes[1]])]
          },
          [connectNodes[1]]: {
            ...prevNodes[connectNodes[1]],
            connections: [...new Set([...prevNodes[connectNodes[1]].connections, connectNodes[0]])]
          }
        }
      })
      setConnectNodes([])
    }
  }, [connectNodes])

  useEffect(() => {
    if(disconnectNodes?.length === 2){
      setNodes(prevNodes => {
        return {
          ...prevNodes,
          [disconnectNodes[0]]: {
            ...prevNodes[disconnectNodes[0]],
            connections: prevNodes[disconnectNodes[0]].connections.filter(connection => connection !== disconnectNodes[1])
          },
          [disconnectNodes[1]]: {
            ...prevNodes[disconnectNodes[1]],
            connections: prevNodes[disconnectNodes[1]].connections.filter(connection => connection !== disconnectNodes[0])
          }
        }
      })
      setDisconnectNodes([])
    }
  }, [disconnectNodes])

  const updateLines = (id, ui) => {
    const nodesCopy = JSON.parse(JSON.stringify(nodes))
    if(id){
      nodesCopy[id].ui = ui
    }
    const set = new Set()
    const connections = []
    for(const key in nodesCopy){
      for(const connection of nodesCopy[key].connections){
        if(!set.has(key+ ", " +connection)){
          set.add(key+", "+connection)
          set.add(connection+", "+key)
          
          const nodeStart = nodesCopy[key].ui
          const nodeEnd = nodesCopy[connection].ui
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
  }
 
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes))
    updateLines()
  }, [nodes])

  const handleAdd = () => {
    setOpenInputModal(false)
    setNodes({
      ...nodes,
      [nodeId.length ? nodeId : uuidv4()]: {
        ui: {
          x: svgRef.current.clientWidth * Math.random(),
          y: svgRef.current.clientHeight * Math.random(),
        },
        connections: [],
        state: "safe", // safe, compromised, stuck
        isExit: false
      }
    })
    setNodeId("")
  }

  useEffect(() => {
    setConnectNodes([])
    setDisconnectNodes([])
  }, [selectedOption])

  const handleWindowClick = (e) => {
    setSelectedNode(null)
  }

  useEffect(() => {
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

  const validateNodes = () => {
    return true
  }
  const saveNodes = async () => {
    // validate nodes
    setOpenFloorModal(false)
    const floorId = uuidv4()

    const tempNodes =  JSON.parse(localStorage.getItem("nodes"))
    
    if(validateNodes()){
      await set(ref(db, `buildings/DF6QbHKTyxHlBnf4MBeZ/floors/${floorId}`), { 
        name: floorName,
        connectUsers: {},
        nodes: {}
      })
      for(const nodeId in tempNodes){
        tempNodes[nodeId].connections = convertArrToObj(tempNodes[nodeId].connections)
      }
      await set(
        ref(db, `buildings/DF6QbHKTyxHlBnf4MBeZ/floors/${floorId}/nodes`), tempNodes
      )
      localStorage.setItem("nodes", "{}")
      setConnectNodes([])
      setDisconnectNodes([])
      setNodes({})
    }
  }

  return (
    <Container>
      <div>Admin</div>
      <ul className='nodeList'>
        <li className='start'>{"["}</li>
        {
          nodes && Object.keys(nodes).map((key, index) => {
            return <li className='nodeId' key={index}>
              <p
                onClick={e => {
                  e.stopPropagation()
                  setSelectedNode(key)
                }}
                className={selectedNode === key ? "selected" : ""}
              >
                {key}
              </p>
            </li>
          })
        }
        <li><button onClick={() => setOpenInputModal(true)}>+</button></li>
        <li className='end'>{"]"}</li>
      </ul>

      <svg xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
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
        {
          lines.length ? lines : null
        }
        {
          nodes && Object.keys(nodes).map((key) => {
            return <Node key={key} id={key} setNodes={setNodes} node={nodes[key]} updateLines={updateLines} handleClick={e => handleClick(e, key)} selectedOption={selectedOption} selectedNode={selectedNode} setSelectedNode={setSelectedNode}/>
          })
        }
      </svg>
      <ul className='controls'>
        <li><button onClick={() => setOpenFloorModal(true)}>Upload plan</button></li>
        <li><button onClick={() => setNodes({})}>Clear</button></li>
        <li>
          <select defaultValue={"move"} onInput={(e) => setSelectedOption(e.target.value)}>
            <option value="move">Move Node</option>
            <option value="connect">Connect Nodes</option>
            <option value="disconnect">Disconnect Nodes</option>
            <option value="delete">Delete Node</option>
            <option value="toggle">Toggle Exit Node</option>
          </select>
        </li>
      </ul>
      <InputModal
        open={openInputModal}
        setOpen={setOpenInputModal}
        input={nodeId}
        setInput={setNodeId}
        handleAdd={handleAdd}
        header={"Add Node"}
        content={"Enter node id or leave blank to generate random id"}
      />
      <InputModal
        open={openFloorModal}
        setOpen={setOpenFloorModal}
        input={floorName}
        setInput={setFloorName}
        handleAdd={saveNodes}
        header={"Upload Floor"}
        content={"Enter floor name"}
      />
    </Container>

  )
}

export default Admin

const Container = styled.div`
  overflow-x: hidden;
  .nodeList {
    display: flex;
    flex-direction: row;
    padding-bottom: 0.1em;
    li{
      display: inline-flex;
      flex-direction: row;
      cursor: pointer;
      display: flex;
      align-items: center;
      &.nodeId::after{
        content: ", ";
      }
      &.nodeId p{
        width: 4em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        padding-left: 5px;
        &:hover{
          background-color: #6060d13a;
          border-radius: 15px;
        }
        &.selected{
          background-color: #6060d168;
          border-radius: 15px;
        }
      }
      button{
        cursor: pointer;
        border: 1px solid #6060d1;
        background-color: transparent;
        border-radius: 50%;
        width: 1em;
        height: 1em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  > svg{
    height: 80vh;
    width: 100vw;
    background-color: #6060d168;
    circle{
      cursor: pointer;
    }
  }
`