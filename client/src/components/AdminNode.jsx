import { useContext, useEffect, useRef } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminNode = ({ id, setNodeSelected, setEditingNode, setEditNode }) => {

  const {scale, size, position, nodes, setNodes, setPaths, mouseStateRef, nodeJoin, setNodeJoin} = useContext(CanvasContext)

  const circleRef = useRef()
  const isMoving = useRef(false)

  const handlePointerDown = (e) => {
    if(mouseStateRef.current === "delete"){
      setNodes(prevNodes => {
        const newNodes = {...prevNodes}
        for(const key of newNodes[id].connections){
          newNodes[key].connections = newNodes[key].connections.filter(con => con !== id)
        }
        delete newNodes[id]
        return newNodes
      })
      return
    }    
    if(mouseStateRef.current === "default")setNodeSelected(id)
    isMoving.current = (mouseStateRef.current === "default") ? true : false
  }

  
  useEffect(() => {
    const handlePointerMove = (e) => {
  
      if(isMoving.current){
        const x = (e.clientX - position[0])
        const y = (e.clientY - position[1])
        const midX = size.width / 2
        const midY = size.height / 2
        circleRef.current.attributes.cx.value = (x - midX + midX * scale) / scale
        circleRef.current.attributes.cy.value = (y - midY + midY * scale) / scale
        // updateLines(id, {
        //   x: circleRef.current.attributes.cx.value,
        //   y: circleRef.current.attributes.cy.value
        // })
      }
    }
  
    const handlePointerUp = (e) => {
      if(isMoving.current){
        setNodes(prevNodes => {
          return {
          ...prevNodes,
          [id]: {
            ...prevNodes[id],
            ui: {
              x: circleRef.current.attributes.cx.value,
              y: circleRef.current.attributes.cy.value
            }
          }
          }
        })
      }
      setNodeSelected(false)
      isMoving.current = false
    }
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointermove", handlePointerMove)
    return () => {
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [position, scale])

  const handleClick = (e) => {
    console.log(nodes)
    if(mouseStateRef.current === "line"){
      if(!nodeJoin)setNodeJoin(id)
      else {
        if(nodeJoin !== id){
          setNodes(prevNodes => {
            const newNodes = {...prevNodes}

            newNodes[nodeJoin].connections.push(id)
            newNodes[id].connections.push(nodeJoin)

            newNodes[nodeJoin].connections = [...new Set(newNodes[nodeJoin].connections)]
            newNodes[id].connections = [...new Set(newNodes[id].connections)]
            return newNodes
          })
          setPaths(prevPaths => {
            const newPaths = {...prevPaths}
            if(Math.abs(nodes[nodeJoin].ui.x - nodes[id].ui.x) <= 15){
              newPaths[`${nodeJoin}->${id}`] = "y"
            }else newPaths[`${nodeJoin}->${id}`] = "x"
            if(Math.abs(nodes[nodeJoin].ui.y - nodes[id].ui.y) <= 15)newPaths[`${id}->${nodeJoin}`] = "x"
            else newPaths[`${id}->${nodeJoin}`] = "y"
            // newPaths[`${nodeJoin}->${id}`] ="x"
            // newPaths[`${id}->${nodeJoin}`] = "y"
            return newPaths
          })
        }
        setNodeJoin(null)
      }
    }
    else if(mouseStateRef.current === "exit"){
      setNodes(prevNodes => {
        const newNodes = {...prevNodes}
        newNodes[id].isExit = !newNodes[id].isExit
        return newNodes
      })
    }
    else if(mouseStateRef.current === "editNodeId"){
      setEditNode(true)
      setEditingNode(id)
    }
  }

  return (
    <circle
      ref={circleRef}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      cx={nodes[id].ui.x}
      cy={nodes[id].ui.y}
      r="20"
      fill={nodes[id].isExit ? "blue" : "green" }
      filter={nodeJoin === id ? "url(#glow)" : undefined}
      data-title={id}
    />
  )
}

export default AdminNode