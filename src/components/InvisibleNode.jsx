import React, { useContext } from 'react'
import { Circle } from 'react-konva'
import { CanvasContext } from '../hooks/CanvasContext'

const InvisibleNode = ({
  connectionData
}) => {
  const { state, nodes, connections, setConnections } = useContext(CanvasContext)
  const invisibleNodeRadius = 10
  const { connectedNodes } = connectionData
  const firstNode = nodes.get(connectedNodes[0].name)
  const secondNode = nodes.get(connectedNodes[1].name)

  const switchConnection = (connections) => {
    for(const invisibleNode of connections){
      if(invisibleNode?.operation === "hide" || invisibleNode?.operation === "delete")continue
      if(invisibleNode.connectedNodes[0].name === firstNode.name && invisibleNode.connectedNodes[1].name === secondNode.name){
        const tempNode = invisibleNode.connectedNodes[0]
        invisibleNode.connectedNodes[0] = invisibleNode.connectedNodes[1]
        invisibleNode.connectedNodes[1] = tempNode
        if(invisibleNode?.id)invisibleNode.operation = "update"
        break
      }
    }
    return connections
  }
  const deleteConnection = (connections) => {
    for(let i = 0; i < connections.length; i++){
      const invisibleNode = connections[i]
      if(invisibleNode.connectedNodes[0].name === firstNode.name && invisibleNode.connectedNodes[1].name === secondNode.name){
        if("id" in invisibleNode){
          invisibleNode.operation = "delete"
        }else{
          connections.splice(i, 1)
        }
      }
    }
    return connections
  }
  const handleClick = (e) => {
    const tempConnections = JSON.parse(JSON.stringify(connections))
    switch(state){
      case "update":
        setConnections(switchConnection(tempConnections))
        break
      case "delete":
        setConnections(deleteConnection(tempConnections))
        break
      default:
        break
    }
  }
  console.log(firstNode, secondNode)
  return (
    !(connectionData?.operation === "delete" || connectionData?.operation === "hide") ?
    <Circle x={firstNode.ui.x} y={secondNode.ui.y} radius={invisibleNodeRadius} fill="#dcbcbc" onClick={handleClick}/> :
    <></>
  )
}

export default InvisibleNode