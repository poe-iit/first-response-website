import styled from "styled-components"

/*
connectedNodes: [name, name]
floor: id (worry about this when uploading)
pattern: string -> xy or yx
*/

// Use better data structures like Map later
const Node = ({ state, setNodes, nodeData, setPrevSelectedNode, prevSelectedNode, setConnections, connections }) => {
  const handleClick = (e) => {
    switch(state){
      case "create":
        break
      case "connect":
        if(prevSelectedNode === null)setPrevSelectedNode(nodeData)
        else if(prevSelectedNode.name !== nodeData.name){
          let isConnected = false
          for(const connection of connections){
            if("operation" in connection && (connection.operation === "hide" || connection.operation === "delete"))continue
            const firstNode = connection.connectedNodes[0]
            const secondNode = connection.connectedNodes[1]
            if(
              (firstNode.name === prevSelectedNode.name || 
              secondNode.name === prevSelectedNode.name) && 
              (firstNode.name === nodeData.name ||
                secondNode.name === nodeData.name)
            ){
              isConnected = true
              break
            }
          }
          if(isConnected)break
          const invisibleNode = {
            connectedNodes: [prevSelectedNode, nodeData],
            operation: "create"
          }
          setConnections([...connections, invisibleNode])
          setPrevSelectedNode(null)
        }
        break
      case "delete":
        if("id" in nodeData){
          setNodes(nodes => {
            const tempNodes = JSON.parse(JSON.stringify(nodes))
            for(const node of tempNodes){
              if(node.name === nodeData.name ){
                node.operation = "delete"
                return tempNodes
              }
            }
            return tempNodes
          })
          setConnections(connections => {
            for(const connection of connections){
              if(connection.connectedNodes[0].name === nodeData.name || connection.connectedNodes[1].name === nodeData.name){
                connection.operation = "hide"
              }
            }
            return connections
          })
        }else {
          // Make variables global when it's time for cases where nodes on different floors could have the same name so you need floorId === floorId
          setConnections(connections => connections.filter(connection => connection.connectedNodes[0].name !== nodeData.name && connection.connectedNodes[1].name !== nodeData.name))
          setNodes(nodes => nodes.filter(node => node.name !== nodeData.name))
        }
        break
      default:
        break
    }
  }
  return (
    ("operation" in nodeData) && (nodeData.operation === "delete") ? 
    null :
    <Container $ui={nodeData.ui} onClick={handleClick} />
  )
}

const Container = styled.div`
  position: absolute;
  top: ${props => props.$ui.y}px;
  left: ${props => props.$ui.x}px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: black;
  transform: translate(-50%, -50%);
`
export default Node