import styled from "styled-components"
import Line from "./Line";

const getLineData = (x1, y1, x2, y2) => {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // console.log(length, angle, x1, y1, x2, y2)
  return {
    length,
    angle
  }
}

const InvisibleNode = ({ state, connectionData, connections, setConnections }) => {
  const { connectedNodes } = connectionData
  const firstNode = connectedNodes[0]
  const secondNode = connectedNodes[1]
  const x = firstNode.ui.x,
        y = secondNode.ui.y

  const { length: firstLineLength, angle:firstLineAngle } = getLineData(x, y, firstNode.ui.x, firstNode.ui.y)

  const { length: secondLineLength, angle: secondLineAngle } = getLineData(x, y, secondNode.ui.x, secondNode.ui.y)


  const handleClick = (e) => {
    const tempConnections = JSON.parse(JSON.stringify(connections))
    switch(state){
      case "update":
        for(const invisibleNode of tempConnections){
          if("operation" in invisibleNode && (invisibleNode.operation === "hide" || invisibleNode.operation === "delete"))continue
          if(invisibleNode.connectedNodes[0].name === firstNode.name && invisibleNode.connectedNodes[1].name === secondNode.name){
            const tempNode = invisibleNode.connectedNodes[0]
            invisibleNode.connectedNodes[0] = invisibleNode.connectedNodes[1]
            invisibleNode.connectedNodes[1] = tempNode
            invisibleNode.operation = "update"
            break
          }
        }
        setConnections(tempConnections)
        console.log("update")
        break
      case "delete":
        for(let i = 0; i < tempConnections.length; i++){
          const invisibleNode = tempConnections[i]
          if(invisibleNode.connectedNodes[0].name === firstNode.name && invisibleNode.connectedNodes[1].name === secondNode.name){
            if("id" in invisibleNode){
              invisibleNode.operation = "delete"
            }else{
              tempConnections.splice(i, 1)
            }
          }
        }
        setConnections(tempConnections)
        console.log("delete")
        break
      default:
        console.log("default")
    }
  }
  return (
    (("operation" in connectionData) && (connectionData.operation === "delete" || connectionData.operation === "hide")) ? null :
    <>
      <Line x={x} y={y} length={firstLineLength} angle={firstLineAngle} />
      <Line x={x} y={y} length={secondLineLength} angle={secondLineAngle} />
      <Container $x={x} $y={y} onClick={handleClick} />
    
    </>
  )
}

const Container = styled.div`
  position: absolute;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #dcbcbc;
  transform: translate(-50%, -50%);

`
export default InvisibleNode