import React, { useContext, useEffect, useState } from 'react'
import Arrow from './Arrow'
import { CanvasContext } from '../hooks/CanvasContext'

const getDistance = (pos1, pos2) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}
const Arrows = () => {
  const { nodes, connections, setNodeStates, nodeStates }  = useContext(CanvasContext)
  const [paths, setPaths] = useState(new Map())
  const [neighbors, setNeighbors] = useState(new Map())
  const dijkstra = (node_map, paths, startNodeName, ignoreCompromised = false) => {
    const queue = [startNodeName]
    const distances = {}
    const previousNodes = {}
    for(const node of node_map.values()){
      distances[node.name] = Number.MAX_SAFE_INTEGER
      previousNodes[node.name] = null
    }
    distances[startNodeName] = 0
    
    while(queue.length > 0){
      const currentNodeName = queue.pop()
      const currentNode = node_map.get(currentNodeName)
      for(const connection of paths?.get(currentNodeName)?.keys()){
        if(ignoreCompromised && node_map.get(connection).state === "compromised")continue
        const distance = distances[currentNodeName] + getDistance(currentNode.ui, node_map.get(connection).ui)
        if(distance < distances[connection]){
          distances[connection] = distance
          previousNodes[connection] = currentNodeName
          queue.push(connection)
          queue.sort((a, b) => distances[b] - distances[a])
        }
      }
    }
    return [previousNodes, distances]
  }
  const getSafestPath = (node_map, paths) => {
    const exits = [], nodeStates = new Map()
    for(const node of node_map.values()){
      if(node.isExit && node.state !== "compromised")exits.push(node.name)
    }
    const neighbor = new Map(), distance = {}
    for(const exit of exits){
      const [previousNodes, distances] = dijkstra(node_map, paths, exit, true)
      for(const node_name in previousNodes){
        const neighborNode = previousNodes[node_name]
        if(!isNaN(distance[node_name]) && distance[node_name] < distances[node_name])continue
        neighbor.set(node_name, neighborNode)
        distance[node_name] = distances[node_name]
      }
    }
    const stuckNodes = new Set()
    for(const node of node_map.values()){
      if(!neighbor.get(node.name)){
        stuckNodes.add(node.name)
        nodeStates.set(node.name, node.state === "compromised" ? "compromised" : "stuck")
      }else{
        nodeStates.set(node.name, node.state)
      }
    }
    for(const exit of exits){
      const [previousNodes, distances] = dijkstra(node_map, paths, exit, false)
      for(const node_name in previousNodes){
        if(!stuckNodes.has(node_name))continue
        const neighborNode = previousNodes[node_name]
        if(!isNaN(distance[node_name]) && distance[node_name] < distances[node_name])continue
        neighbor.set(node_name, neighborNode)
        distance[node_name] = distances[node_name]
      }
    }
    setNeighbors(neighbor)
    setNodeStates(nodeStates)
  }
  useEffect(() => {
    const paths = new Map()
    for(const connection of connections){
      const firstNode = connection.connectedNodes[0]
      const secondNode = connection.connectedNodes[1]
      if(!paths.has(firstNode.name))paths.set(firstNode.name, new Map())
      if(!paths.has(secondNode.name))paths.set(secondNode.name, new Map())
      paths.get(firstNode.name).set(secondNode.name, "yx")
      paths.get(secondNode.name).set(firstNode.name, "xy")
    }
    setPaths(paths)
    getSafestPath(nodes, paths, connections)
  }, [nodes, connections])
  return (
    <>
      {
      neighbors?.size > 0 ?
        Array(...neighbors).map(([node, closestNode], key) => {
          if(!closestNode || !node)return null
          let rotation = 0
          const path = paths.get(node).get(closestNode)
          if(path === "xy"){
            if(nodes.get(node).ui.x > nodes.get(closestNode).ui.x){
              rotation = 90
            }else{
              rotation = 270
            }
          }
          else if(path === "yx"){
            if(nodes.get(node).ui.y > nodes.get(closestNode).ui.y){
              rotation = 180
            }else{
              rotation = 0
            }
          }
          let x = nodes.get(node).ui.x, y = nodes.get(node).ui.y
          switch(rotation){
            case 0:
              y += 20
              break
            case 90:
              x -= 20
              break
            case 180:
              y -= 20
              break
            case 270:
              x += 20
              break
          }
          return (<Arrow 
            key={key}
            x={x}
            y={y}
            rotation={rotation}
            color={nodes.get(node).state === "compromised" ? "#e63946" : nodeStates.get(node) === "stuck" ? "#ff8800" : "#0277bd"}
          />)
        }
        ) : null
      }
    </>
  )
}

export default Arrows