import { useContext } from "react"
import { CanvasContext } from "../hook/CanvasContext"

const Nodes = () => {

  const { nodes, floor, mouseStateRef } = useContext(CanvasContext)

  const alarmNode = (nodeId) => {
    if(!floor?.id)return
    if(mouseStateRef.current !== "danger")return
    const tempNodes = JSON.parse(JSON.stringify(nodes))
    tempNodes[nodeId].state = tempNodes[nodeId].state === "compromised" ? "safe" : "compromised"

    console.log(tempNodes)
    console.log(floor.id, nodeId)

    fetch(`${import.meta.env.VITE_SERVER_URL}/floor/${floor.id}/nodes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        [nodeId]: tempNodes[nodeId].state
      })
    })

    // set(ref(db, `buildings/DF6QbHKTyxHlBnf4MBeZ/floors/${floorId}/nodes/${nodeId}/state`), tempNodes[nodeId].state)
    
    // Important don't delete this

    // const paths = []

    // for(const nodeId in tempNodes){
    //   if(tempNodes[nodeId].state !== "compromised")tempNodes[nodeId].state = 1
    //   if(tempNodes[nodeId].isExit)paths.push(nodeId)
    // }

    // for(const path of paths){
    //   const queue = [[null, path]]
    //   for(const [prevNode, nodeId] of queue){
    //     if(tempNodes[nodeId].state === "compromised")continue
    //     tempNodes[nodeId].state = "safe"
    //     for(const connections of tempNodes[nodeId].connections){
    //       if(connections === prevNode)continue
    //       if(tempNodes[connections].state === 1)queue.push([nodeId, connections])
    //     }
    //   }
    // }

    // for(const nodeId in tempNodes){
    //   if(tempNodes[nodeId].state === 1){
    //     tempNodes[nodeId].state = "stuck"
    //   }
    // }

    // setNodes(tempNodes)
  }

  return (
    <>
      {
        nodes && Object.keys(nodes).map((key) => {
          return <circle data-title={key} key={key} cx={nodes[key].ui.x} cy={nodes[key].ui.y} r="20" fill={nodes[key].state === "compromised" ? "red" : nodes[key].state === "stuck" ? "orange" : nodes[key].isExit ? "blue" : "green" } onClick={() => alarmNode(key)}/>
        })
      }
    </>
  )
}

export default Nodes