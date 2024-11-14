import { useContext } from 'react'
import { Circle } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const Node = ({
  nodeData
}) => {
  const { state, nodes, setNodes, stageRef, prevSelectedNode, setPrevSelectedNode, setUpdateNode, nodeStates} = useContext(CanvasContext)
  // Things that could be in useContext or gloabl config
  //circleRadius, prevSelectedNode, setPrevSelectedNode, setConnections, connections, setNodes, state, stageRef
  const circleRadius = 20
  const connectNodes = () => {
    if(prevSelectedNode === null || prevSelectedNode === undefined){
      setPrevSelectedNode({
        id: nodeData?.id,
        name: nodeData.name
      })
      // Try getting only data you need?
      // What if a node is deleted or updated?
      // Anytime it's any other state setPrevSelectedNode to null or check if the node is still alright, use an id instead... it's a quick check up
      return
    }
    // If user selected the same node
    if(prevSelectedNode.name === nodeData.name)return
    // Check to make sure we aren't double connecting
    // Maybe a seperate map would be nice but is it worth it?
    
    setNodes(prevState => {
      const copyNode = new Map([...prevState])
      const firstNode = copyNode.get(prevSelectedNode.name)
      const secondNode = copyNode.get(nodeData.name)
      const connection = firstNode.connections.find(connection => connection.name === secondNode.name)
      if(!connection || connection.direction === ""){
        firstNode.connections = firstNode.connections.filter(connection => connection.name !== secondNode.name)
        secondNode.connections = secondNode.connections.filter(connection => connection.name !== firstNode.name)
        const firstConnection = {}, secondConnection = {}
        if(secondNode?.id)firstConnection.id = secondNode?.id
        firstConnection.name = secondNode.name
        firstConnection.direction = "xy"
        if(firstNode?.id)secondConnection.id = firstNode?.id
        secondConnection.name = firstNode.name
        secondConnection.direction = "yx"
        firstNode.connections.push(firstConnection)
        secondNode.connections.push(secondConnection)
        if(!firstNode.operation)firstNode.operation = "update"
        if(!secondNode.operation)secondNode.operation = "update"
      }
      return copyNode
    })
    setPrevSelectedNode(null)
  }
  const deleteNode = () => {
    setNodes(prevState => {
      const copyNode = new Map([...prevState])
      const node = copyNode.get(nodeData.name)
      const connections = node.connections
      const otherNodes = connections.map(connection => connection.name)
      for(const otherNodeName of otherNodes){
        const otherNode = copyNode.get(otherNodeName)
        if(("id" in node) && ("id" in otherNode)){
          const connection = node.connections.find(connection => connection.name === otherNodeName)
          connection.direction = ""
          const otherConnection = otherNode.connections.find(connection => connection.name === nodeData.name)
          otherConnection.direction = ""
        }else{
          node.connections = node.connections.filter(connection => connection.name !== otherNodeName)
          otherNode.connections = otherNode.connections.filter(connection => connection.name !== nodeData.name)
        }
        if(!otherNode.operation)otherNode.operation = "update"
      }
      if("id" in nodeData)node.operation = "delete"
      else copyNode.delete(nodeData.name)
      if(!node.operation)node.operation = "update"
      return copyNode
    })
  }
  const changeNodeState = () => {

    const clonedNodes = new Map(nodes)
    const node = clonedNodes.get(nodeData.name)
    if(node.state === "compromised")node.state = "safe"
    else node.state = "compromised"
    if("id" in nodeData && nodeData.operation !== "hide")node.operation = "update"
    setNodes(clonedNodes)
  }
  const changeNodeExit = () => {

    const clonedNodes = new Map(nodes)
    const node = clonedNodes.get(nodeData.name)
    node.isExit = !node.isExit
    if("id" in nodeData && nodeData.operation !== "hide")node.operation = "update"
    setNodes(clonedNodes)
  }
  const handleClick = (e) => {
    switch(state){
      case "connect":
        connectNodes()
        break
      case "delete":
        deleteNode()
        break
      case "fire":
        changeNodeState()
        break
      case "exit":
        changeNodeExit()
        break
      case "update":
        setUpdateNode(nodeData.name)
        break
      default:
        break
    }
  }
  // const handleDragMove = (e) => {
  //   // Don't think I have to do anything here
  //   // nodePosition.current = {
  //   //   x: e.evt.x,
  //   //   y: e.evt.y
  //   // }
  // }
  const handleDragEnd = (e) => {
    // Maybe add an animation here
    const scale = stageRef.current.scaleX()
    const position = stageRef.current.position()

    const x = (e.evt.x - position.x) / scale
    const y = (e.evt.y - position.y) / scale
    // Factor in the offset of where the mouse was on the node for the final calculation
    setNodes(prevState => {
      const newNodes = new Map(prevState)
      const node = newNodes.get(nodeData.name)
      node.ui.x = x
      node.ui.y = y
      if("id" in nodeData)node.operation = "update"
      return newNodes
    })
  }
  const handleDragStart = (e) => {
    // Keep an animation or box shadow here
    console.log(e)
  }
  // Maybe use the id prop to figure out the node being selected
  return (
    (nodeData?.operation === "delete") ? null :
    <Circle
      x={nodeData.ui.x}
      y={nodeData.ui.y}
      fill={
        nodeStates.get(nodeData.name) === "compromised" ? 
        "#e63946": nodeData.isExit ? 
        "#4caf50": nodeStates.get(nodeData.name) === "stuck" ? "#ff8800": "#0277bd"
      }
      radius={circleRadius}
      onClick={handleClick}
      onTap={handleClick}
      draggable={state === "default"}
      onDragStart={handleDragStart}
      // onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    />
  )
}

export default Node