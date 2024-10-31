import { useContext } from 'react'
import { Circle } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const Node = ({
  nodeData
}) => {
  const { state, nodes, setNodes, stageRef, prevSelectedNode, setPrevSelectedNode, connections, setConnections, setUpdateNode} = useContext(CanvasContext)
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
    let isConnected = false
    // Check to make sure we aren't double connecting
    // Maybe a seperate map would be nice but is it worth it?
    for(const connection of connections){
      if(connection?.operation === "hide" || connection?.operation === "delete")continue
      const firstNode = connection.connectedNodes[0]
      const secondNode = connection.connectedNodes[1]
      if(
        (
          firstNode.name === prevSelectedNode.name || 
          secondNode.name === prevSelectedNode.name
        ) && (
          firstNode.name === nodeData.name ||
          secondNode.name === nodeData.name
        )
      ){
        isConnected = true
        break
      }
    }
    if(isConnected)return
    const invisibleNode = {
      // Again try keeping only data needed or id and a quick lookup
      connectedNodes: [prevSelectedNode, {id: nodeData?.id, name: nodeData.name}],
      operation: "create"
    }
    setConnections([...connections, invisibleNode])
    setPrevSelectedNode(null)
  }
  const deleteNode = () => {
    if("id" in nodeData){
      setNodes(prevState => {
        const copyNode = new Map(prevState)
        const node = copyNode.get(nodeData.name)
        node.operation = "delete"

        return copyNode
      })
      setConnections(prevState => {
        const copyConnection = [...prevState]
        for(const connection of copyConnection){
          if(connection.connectedNodes[0].name === nodeData.name || connection.connectedNodes[1].name === nodeData.name){
            // Use "delete" instead, it does the smae thing
            connection.operation = "hide"
          }
        }
        return copyConnection
      })
    }else{
      setNodes(prevState => {
        prevState.delete(nodeData.name)
        return prevState
      })
      setConnections(prevState => prevState.filter(connection => connection.connectedNodes[0].name !== nodeData.name && connection.connectedNodes[1].name !== nodeData.name))
    }
  }
  const changeNodeState = () => {
    console.log("Updated")

    const clonedNodes = new Map(nodes)
    const node = clonedNodes.get(nodeData.name)
    if(node.state === "compromised")node.state = "safe"
    else node.state = "compromised"
    if("id" in nodeData && nodeData.operation !== "hide")node.operation = "update"
    setNodes(clonedNodes)
  }
  const changeNodeExit = () => {
    console.log("Updated")

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
    console.log("Updated")
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
        nodeData.state === "compromised" ? 
        "red": nodeData.isExit ? 
        "blue": "black"
      }
      radius={circleRadius}
      onClick={handleClick}
      draggable={state === "default"}
      onDragStart={handleDragStart}
      // onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    />
  )
}

export default Node