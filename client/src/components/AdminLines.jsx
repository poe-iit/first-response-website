import { useContext, useEffect, useState } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const AdminLines = () => {
  const { nodes, setNodes, mouseStateRef, setPaths, paths } = useContext(CanvasContext)
  const [lines, setLines] = useState([])
  
  useEffect(() => {
    if(Object.keys(nodes).length === 0) {
      setLines([])
      return
    }
    const set = new Set()
    const connections = []

    const handleClick = (e) => {
      const [id, key] = e.target.dataset.key.split("->")
      // console.log(id, key)
      if(mouseStateRef.current === "delete"){
        // console.log(id, key, "deleting line")
        setNodes(prevNodes => {
          const newNodes = {...prevNodes}
          newNodes[key].connections = newNodes[key].connections.filter(con => con !== id)
          newNodes[id].connections = newNodes[id].connections.filter(con => con !== key)
          return newNodes
        })
        setPaths(prevPaths => {
          const newPaths = {...prevPaths}
          delete newPaths[id + "->" + key]
          delete newPaths[key + "->" + id]
          return newPaths
        })
        return
      }
      // console.log(e)
    }

    const switchPath = (id1, id2) => {
      if(paths[id1 + "->" + id2] === "x"){
        setPaths(prevPaths => {
          const newPaths = {...prevPaths}
          newPaths[id1 + "->" + id2] = "y"
          newPaths[id2 + "->" + id1] = "x"
          return newPaths
        })
      }else{
        setPaths(prevPaths => {
          const newPaths = {...prevPaths}
          newPaths[id1 + "->" + id2] = "x"
          newPaths[id2 + "->" + id1] = "y"
          return newPaths
        })
      }
    }

    for(const id1 in nodes){
      for(const id2 of nodes[id1].connections){
        if(set.has(id1 + "->" + id2)) continue
        const nodeStart = nodes[id1]
        const nodeEnd  = nodes[id2]
        const key = id1 + "->" + id2
        const right = Number(nodeStart.ui.x) < Number(nodeEnd.ui.x)
        const top = Number(nodeStart.ui.y) > Number(nodeEnd.ui.y)
        // console.log(id1, id2, paths[key], nodeStart.ui, nodeEnd.ui)
        if(key in paths){
          const adjustedX1 = Number(nodeEnd.ui.x) + (right ? -5 : 5),
                adjustedY1 = Number(nodeEnd.ui.y) + (top ? 5 : -5),
                adjustedX2 = Number(nodeStart.ui.x) + (right ? 5 : -5),
                adjustedY2 = Number(nodeStart.ui.y) + (top ? -5 : 5)

          const dir = paths[key] === "x" ? ((right && top || !right && !top) ? 0 : 1) : ((top && !right || !top && right) ? 0 : 1)
          // console.log(dir, right, top)
          connections.push(<path
            key={key}
            id={key}
            data-key={key}
            className='admin-line'
            stroke='transparent'
            fill='transparent'
            cursor={"pointer"}
            d={`
              ${"M"+nodeStart.ui.x} ${nodeStart.ui.y}
              ${"L"+(paths[key] === "x" ? nodeEnd : nodeStart).ui.x}
              ${(paths[key] === "x" ? nodeStart : nodeEnd).ui.y}
              ${"L"+nodeEnd.ui.x} ${nodeEnd.ui.y}
            `}
            strokeWidth={15}
            onClick={handleClick}
          />)
          connections.push(<path
            key={key+"2"}
            id={key}
            data-key={key}
            className='admin-line'
            stroke='black'
            fill='transparent'
            cursor={"pointer"}
            d={`
              M${nodeStart.ui.x} ${nodeStart.ui.y} 
              L${paths[key] === "x" ? adjustedX1 : nodeStart.ui.x} ${paths[key] === "x" ? nodeStart.ui.y : adjustedY1}
              A 5 5 0 0 ${dir} ${paths[key] === "x" ? nodeEnd.ui.x : adjustedX2} ${paths[key] === "x" ? adjustedY2 : nodeEnd.ui.y}
              L${nodeEnd.ui.x} ${nodeEnd.ui.y}
            `}
          
            onClick={handleClick}
          />)
        }
        set.add(id1 + "->" + id2)
        set.add(id2 + "->" + id1)
      }
    }

    const pathSet = new Set()
    for(const id1 in nodes){
      for(const id2 of nodes[id1].connections){
        if(pathSet.has(id1 + "->" + id2)) continue
        const nodeStart = nodes[id1]
        const nodeEnd  = nodes[id2]
        const key = id1 + "->" + id2
        connections.push(<circle
          key={key+"3"}
          id={key}
          data-title={"Switch Directions"}
          z-index={10}
          cx={(paths[key] === "x" ? nodeEnd : nodeStart).ui.x}
          cy={(paths[key] === "x" ? nodeStart : nodeEnd).ui.y}
          r="10"
          fill="#84afd4"
          onClick={() => switchPath(id1, id2)}
        />)
        pathSet.add(id1 + "->" + id2)
        pathSet.add(id2 + "->" + id1)
      }
    }

    setLines(connections)
    // console.log(paths)
  }, [nodes, paths])

  return (
    <>
      {
        lines
      }
    </>
  )
}

export default AdminLines