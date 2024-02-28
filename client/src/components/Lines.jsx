import { useEffect, useState } from 'react'

const Lines = ({ nodes }) => {
  const [lines, setLines] = useState([])
  const [paths, setPaths] = useState()

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
              (
                graph[currentNode].ui.x - graph[neighbor].ui.x
              )**2 + (
                graph[currentNode].ui.y - graph[neighbor].ui.y
              )**2
            )**(1/2);
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance; // Update distance
              prev[neighbor] = currentNode; // Update path
            }
          }
        }
      
        return { distances, prev };
      }

      const tempPaths = {}
  
      // Example usage
      for(const node in nodes){
        if(nodes[node].isExit && nodes[node].state !== "compromised"){
          const result = dijkstra(nodes, node);
          tempPaths[node] = {
            ...result
          }
        }
      }
      setPaths(tempPaths)
    }
  }, [nodes])

  useEffect(() => {
    if(!paths)return
    const set = new Set()
    const connections = []
    for(const key in nodes){
      if(key in paths)continue
      let distNode = [Number.MAX_SAFE_INTEGER, null]
      for(const exit in paths){
        if(paths[exit].distances[key] && paths[exit].distances[key] < distNode[0]){
          distNode = [paths[exit].distances[key], paths[exit].prev[key]]
        }
      }

      if(distNode[0] === Number.MAX_SAFE_INTEGER) continue
      const nodeStart = nodes[key].ui
      const nodeEnd = nodes[distNode[1]].ui
      // Create a line svg to display each node connection
      connections.push(<line
        key={key+"-"+distNode[1]}
        x1={nodeStart.x} 
        y1={nodeStart.y} 
        x2={nodeEnd.x} 
        y2={nodeEnd.y} 
        stroke="black"
      />)

      // Make this better and more understandable
      // You get the position, then get the left and right by creating an arc around the line, then move the arrow forward by 6.5
      let angle = Math.atan2(parseFloat(nodeEnd.y) - parseFloat(nodeStart.y), parseFloat(nodeEnd.x) - parseFloat(nodeStart.x))
      if(angle < 0) angle += 2*Math.PI
      angle += Math.PI
      const radius = 10
      const circleRadius = 20
      const start = [parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      const right = [radius * Math.cos(angle+Math.PI/4) + parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), radius * Math.sin(angle+Math.PI/4) + parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      const left = [radius * Math.cos(angle-Math.PI/4) + parseFloat(nodeStart.x) - (circleRadius + 6.5) * Math.cos(angle), radius * Math.sin(angle-Math.PI/4) + parseFloat(nodeStart.y) - (circleRadius + 6.5) * Math.sin(angle)]
      // console.log(start, left, right)
      connections.push(
        <path
          key={key+"-"+distNode[1]+"-end"}
          id={key}
          stroke='black'
          fill="black"
          d={`${"M"+start[0]} ${start[1]} ${"L"+left[0]} ${left[1]} ${"L"+right[0]} ${right[1]} Z`}
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
          connections.push(<line
            key={key+"-"+connection}
            x1={nodeStart.x} 
            y1={nodeStart.y} 
            x2={nodeEnd.x} 
            y2={nodeEnd.y} 
            stroke="black"
          />)
        }
      }
    }
    setLines(connections)
  }, [paths])

  return (
    <>
      {lines}
    </>
  )
}

export default Lines