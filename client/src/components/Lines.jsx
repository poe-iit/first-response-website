import { useContext, useEffect, useState } from 'react'
import { CanvasContext } from '../hook/CanvasContext'

const Lines = () => {
  const { nodes, paths } = useContext(CanvasContext)
  const [lines, setLines] = useState([])
  const [shortestPaths, setShortestPaths] = useState()
  const [initialShortestPaths, setInitialShortestPaths] = useState()

  // Split this component into lines and arrows

  useEffect(() => {
    if(nodes){
      function dijkstra(graph, startNode) {
        const distances = {}; // Store distances from the start node
        const prev = {}; // Store the previous node in the optimal path
        const visited = new Set(); // Track visited nodes
        // This part was commentted but just make dijkstra run twice and then add arrows to the nodes without arrows
        // Probably run it at the first load so you can always reference it since it won't change
        // You'll have the initial that points to the closest and this algorithm that points to the closest that is safe, and if a node is compromised or stuck you use the initial
        for(const node in nodes){
          if(nodes[node].state === "compromised")visited.add(node)
        }
        // Make compromised nodes of lower priority
        // But howww
        const queue = []; // Priority queue of nodes to visit
      
        // Initialize distances and queue
        for (let node in graph) {
          distances[node] = Infinity;
          queue.push(node);
          prev[node] = null;
        }
        distances[startNode] = 0;
      
        while (queue.length !== 0) {
          // Sort queue by distance (simple priority queue)
          queue.sort((a, b) => distances[a] - distances[b]);
          const currentNode = queue.shift(); // Node with the shortest distance
          visited.add(currentNode);
      
          for (let neighbor of graph[currentNode].connections) {
            if (visited.has(neighbor)) continue; // Skip visited nodes
      
            // Calculate new distance
            const newDistance = distances[currentNode] + (
              Math.abs(
                graph[currentNode].ui.x - graph[neighbor].ui.x
              ) + Math.abs(
                graph[currentNode].ui.y - graph[neighbor].ui.y
              )
            );
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance; // Update distance
              prev[neighbor] = currentNode; // Update path
            }
          }
        }
      
        return { distances, prev };
      }

      const tempShortestPaths = {}
  
      // Example usage
      for(const node in nodes){
        if(nodes[node].isExit && nodes[node].state !== "compromised"){
          const result = dijkstra(nodes, node);
          tempShortestPaths[node] = {
            ...result
          }
        }
      }
      setShortestPaths(tempShortestPaths)
    }
  }, [nodes])

  useEffect(() => {
    let skip = true
    for(const exit in initialShortestPaths){
      if(!(exit in nodes) || !nodes[exit].isExit)skip = false
    }
    if(!initialShortestPaths)skip = false
    if(skip)return
    if(nodes){
      function dijkstra(graph, startNode) {
        const distances = {}; // Store distances from the start node
        const prev = {}; // Store the previous node in the optimal path
        const visited = new Set(); // Track visited nodes
        // This part was commentted but just make dijkstra run twice and then add arrows to the nodes without arrows
        // Probably run it at the first load so you can always reference it since it won't change
        // You'll have the initial that points to the closest and this algorithm that points to the closest that is safe, and if a node is compromised or stuck you use the initial

        // for(const node in nodes){
        //   if(nodes[node].state === "compromised")visited.add(node)
        // }

        // Make compromised nodes of lower priority
        // But howww
        const queue = []; // Priority queue of nodes to visit
      
        // Initialize distances and queue
        for (let node in graph) {
          distances[node] = Infinity;
          queue.push(node);
          prev[node] = null;
        }
        distances[startNode] = 0;
      
        while (queue.length !== 0) {
          // Sort queue by distance (simple priority queue)
          queue.sort((a, b) => distances[a] - distances[b]);
          const currentNode = queue.shift(); // Node with the shortest distance
          visited.add(currentNode);
      
          for (let neighbor of graph[currentNode].connections) {
            if (visited.has(neighbor)) continue; // Skip visited nodes
      
            // Calculate new distance
            const newDistance = distances[currentNode] + (
              Math.abs(
                graph[currentNode].ui.x - graph[neighbor].ui.x
              ) + Math.abs(
                graph[currentNode].ui.y - graph[neighbor].ui.y
              )
            );
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance; // Update distance
              prev[neighbor] = currentNode; // Update path
            }
          }
        }
      
        return { distances, prev };
      }

      const tempShortestPaths = {}
  
      // Example usage
      for(const node in nodes){
        if(nodes[node].isExit){
          const result = dijkstra(nodes, node);
          tempShortestPaths[node] = {
            ...result
          }
        }
      }
      setInitialShortestPaths(tempShortestPaths)
    }
  }, [nodes])

  useEffect(() => {
    if(!shortestPaths || !initialShortestPaths)return
    const set = new Set()
    const connections = []
    console.log(nodes, initialShortestPaths, shortestPaths)
    for(const key in nodes){
      if(key in shortestPaths)continue
      let distNode = [Number.MAX_SAFE_INTEGER, null]
      for(const exit in shortestPaths){
        if(shortestPaths[exit].distances[key] && shortestPaths[exit].distances[key] < distNode[0]){
          distNode = [shortestPaths[exit].distances[key], shortestPaths[exit].prev[key]]
        }
      }
      if(distNode[0] === Number.MAX_SAFE_INTEGER){
        for(const exit in initialShortestPaths){
          console.log(exit, initialShortestPaths, nodes)
          if( nodes[exit].state === "compromised")continue
          if(initialShortestPaths[exit].distances[key] && initialShortestPaths[exit].distances[key] < distNode[0]){
            distNode = [initialShortestPaths[exit].distances[key], initialShortestPaths[exit].prev[key]]
          }
        }
      }

      if(distNode[0] === Number.MAX_SAFE_INTEGER) continue
      const nodeStart = nodes[key].ui
      const nodeEnd = nodes[distNode[1]].ui
      const pathKey = key + "->" + distNode[1]
      const right = Number(nodeStart.x) < Number(nodeEnd.x)
      const top = Number(nodeStart.y) > Number(nodeEnd.y)
      // console.log( paths[pathKey], nodeStart.ui, nodeEnd.ui)
      if(pathKey in paths){
        const adjustedX1 = Number(nodeEnd.x) + (right ? -5 : 5),
              adjustedY1 = Number(nodeEnd.y) + (top ? 5 : -5),
              adjustedX2 = Number(nodeStart.x) + (right ? 5 : -5),
              adjustedY2 = Number(nodeStart.y) + (top ? -5 : 5)

        const dir = paths[pathKey] === "x" ? ((right && top || !right && !top) ? 0 : 1) : ((top && !right || !top && right) ? 0 : 1)
        console.log(dir, right, top)
        connections.push(<path
          key={pathKey+"2"}
          id={pathKey}
          className='admin-line'
          stroke='black'
          fill='transparent'
          cursor={"pointer"}
          d={`
            M${nodeStart.x} ${nodeStart.y} 
            L${paths[pathKey] === "x" ? adjustedX1 : nodeStart.x} ${paths[pathKey] === "x" ? nodeStart.y : adjustedY1}
            A 5 5 0 0 ${dir} ${paths[pathKey] === "x" ? nodeEnd.x : adjustedX2} ${paths[pathKey] === "x" ? adjustedY2 : nodeEnd.y}
            L${nodeEnd.x} ${nodeEnd.y}
          `}
        />)
      }
      // Create a line svg to display each node connection
      // connections.push(<line
      //   key={key+"-"+distNode[1]}
      //   x1={nodeStart.x} 
      //   y1={nodeStart.y} 
      //   x2={nodeEnd.x} 
      //   y2={nodeEnd.y} 
      //   stroke="black"
      // />)

      // Make this better and more understandable
      // You get the position, then get the left and right by creating an arc around the line, then move the arrow forward by 6.5
      let angle = paths[pathKey] === "x" ? (right ? 0 : Math.PI) : (top ? 3*Math.PI/2 : Math.PI/2)
      if(angle < 0) angle += 2*Math.PI
      angle += Math.PI
      const radius = 10
      const circleRadius = 20
      const start = [parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      const rightPoint = [radius * Math.cos(angle+Math.PI/4) + parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), radius * Math.sin(angle+Math.PI/4) + parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      const left = [radius * Math.cos(angle-Math.PI/4) + parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), radius * Math.sin(angle-Math.PI/4) + parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      // console.log(start, left, right)
      connections.push(
        <path
          key={key+"-"+distNode[1]+"-end"}
          id={key}
          stroke='black'
          fill="black"
          d={`${"M"+start[0]} ${start[1]} ${"L"+left[0]} ${left[1]} ${"L"+rightPoint[0]} ${rightPoint[1]} Z`}
        />
      )
      set.add(key+", "+distNode[1])
      set.add(distNode[1]+", "+key)
    }

    for(const key in nodes){
      for(const connection of nodes[key].connections){
        if(!set.has(key+ ", " +connection)){
          set.add(key+", "+connection)
          set.add(connection+", "+key)
          
          const nodeStart = nodes[key].ui
          const nodeEnd = nodes[connection].ui
          // Create a line svg to display each node connection
          const pathKey = key + "->" + connection
          const right = Number(nodeStart.x) < Number(nodeEnd.x)
          const top = Number(nodeStart.y) > Number(nodeEnd.y)
          // console.log( paths[pathKey], nodeStart.ui, nodeEnd.ui)
          if(pathKey in paths){
            const adjustedX1 = Number(nodeEnd.x) + (right ? -5 : 5),
                  adjustedY1 = Number(nodeEnd.y) + (top ? 5 : -5),
                  adjustedX2 = Number(nodeStart.x) + (right ? 5 : -5),
                  adjustedY2 = Number(nodeStart.y) + (top ? -5 : 5)

            const dir = paths[pathKey] === "x" ? ((right && top || !right && !top) ? 0 : 1) : ((top && !right || !top && right) ? 0 : 1)
            console.log(dir, right, top)
            connections.push(<path
              key={pathKey+"2"}
              id={pathKey}
              className='admin-line'
              stroke='black'
              fill='transparent'
              cursor={"pointer"}
              d={`
                M${nodeStart.x} ${nodeStart.y} 
                L${paths[pathKey] === "x" ? adjustedX1 : nodeStart.x} ${paths[pathKey] === "x" ? nodeStart.y : adjustedY1}
                A 5 5 0 0 ${dir} ${paths[pathKey] === "x" ? nodeEnd.x : adjustedX2} ${paths[pathKey] === "x" ? adjustedY2 : nodeEnd.y}
                L${nodeEnd.x} ${nodeEnd.y}
              `}
            />)
          }
          // connections.push(<line
          //   key={key+"-"+connection}
          //   x1={nodeStart.x} 
          //   y1={nodeStart.y} 
          //   x2={nodeEnd.x} 
          //   y2={nodeEnd.y} 
          //   stroke="black"
          // />)
        }
      }
    }
    setLines(connections)
  }, [shortestPaths, initialShortestPaths])

  return (
    <>
      {lines}
    </>
  )
}

export default Lines