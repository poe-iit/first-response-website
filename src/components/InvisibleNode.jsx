import React, { useContext } from 'react'
import { Circle } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const InvisibleNode = ({
  firstNodeName,
  secondNodeName
}) => {
  const { state, nodes, setNodes } = useContext(CanvasContext)
  const invisibleNodeRadius = 10
  const firstNode = nodes.get(firstNodeName)
  const secondNode = nodes.get(secondNodeName)
  let connectionData
  for(const c of firstNode.connections){
    if(c.name === secondNodeName){
      connectionData = c
      break
    }
  }

  const switchConnection = (firstNodeName, secondNodeName) => {
    const firstNode = nodes.get(firstNodeName)
    const secondNode = nodes.get(secondNodeName)
    const firstNodeConnection = firstNode.connections.find(connection => connection.name === secondNodeName),
          secondNodeConnection = secondNode.connections.find(connection => connection.name === firstNodeName)
    
    if(firstNodeConnection.direction === "")return
    firstNodeConnection.direction = firstNodeConnection.direction === "xy" ? "yx" : "xy"
    secondNodeConnection.direction = secondNodeConnection.direction === "xy" ? "yx" : "xy"

    if(!firstNode?.operation)firstNode.operation = "update"
    if(!firstNode?.operation)secondNode.operation = "update"

    setNodes(prevState => {
      const clonedMap = new Map([...prevState])
      clonedMap.set(firstNodeName, firstNode)
      clonedMap.set(secondNodeName, secondNode)
      return clonedMap
    })
  }

  const deleteConnection = (firstNodeName, secondNodeName) => {
    const firstNode = nodes.get(firstNodeName)
    const secondNode = nodes.get(secondNodeName)

    if(!firstNode?.id || !secondNode?.id){
      firstNode.connections = firstNode.connections.filter(connection => connection.name !== secondNodeName)
      secondNode.connections = secondNode.connections.filter(connection => connection.name !== firstNodeName)
      if(!firstNode?.operation)firstNode.operation = "update"
      if(!secondNode?.operation)secondNode.operation = "update"
      setNodes(prevState => {
        const clonedMap = new Map([...prevState])
        clonedMap.set(firstNodeName, firstNode)
        clonedMap.set(secondNodeName, secondNode)
        return clonedMap
      })
      return
    }

    const firstNodeConnection = firstNode.connections.find(connection => connection.name === secondNodeName),
          secondNodeConnection = secondNode.connections.find(connection => connection.name === firstNodeName)
    firstNodeConnection.direction = ""
    secondNodeConnection.direction = ""

    if(!firstNode?.operation)firstNode.operation = "update"
    if(!secondNode?.operation)secondNode.operation = "update"
    setNodes(prevState => {
      const clonedMap = new Map([...prevState])
      clonedMap.set(firstNodeName, firstNode)
      clonedMap.set(secondNodeName, secondNode)
      return clonedMap
    })
  }
  const handleClick = (e) => {
    switch(state){
      case "update":
        switchConnection(firstNodeName, secondNodeName)
        break
      case "delete":
        deleteConnection(firstNodeName, secondNodeName)
        break
      default:
        break
    }
  }
  return (
    !(connectionData?.operation === "delete" || connectionData?.operation === "hide") ?
    <Circle x={firstNode.ui.x} y={secondNode.ui.y} radius={invisibleNodeRadius} fill="#dcbcbc" onClick={handleClick} onTap={handleClick}/> :
    <></>
  )
}

export default InvisibleNode