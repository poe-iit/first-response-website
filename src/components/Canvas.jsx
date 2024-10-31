import { Stage, Layer } from "react-konva"
import { useContext, useEffect, useRef, useState } from "react"
import Node from "./Node";
import InvisibleNode from "./InvisibleNode";
import ConnectedLines from "./ConnectedLines";
import Background from "./Background";
import FollowNode from "./FollowNode";
import { CanvasContext } from "../hooks/CanvasContext";

function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}

const Canvas = ({ edit }) => {
  const { stageRef, state, nodes, setNodes, connections, canvasIsDraggable} = useContext(CanvasContext)

  const createNode = (x, y) => {
    const defaultName = generateUniqueId()
    const node = {
      name: defaultName,
      state: "safe",
      isExit: false,
      ui: {
        x,
        y
      },
      operation: "create"
    }
    setNodes(prevState => {
      const clonedMap = new Map([...prevState])
      clonedMap.set(defaultName, node)
      return clonedMap
    })
  }
  const handleClick = (e) => {
    const scale = stageRef.current.scaleX()
    const position = stageRef.current.position()
    switch(state){
      case "create":
        const x = (e.evt.x - position.x) / scale
        const y = (e.evt.y - position.y) / scale
        createNode(x, y)
        break
      default:
        break
    }
  }
  const handleResize = (e) => {
    stageRef.current.setWidth(window.innerWidth)
    stageRef.current.setHeight(window.innerHeight)
  }

  const handleWheel = (e) => {
    e.evt.preventDefault();
    if(!canvasIsDraggable)return
    const stage = stageRef.current;
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    // Adjust scale based on wheel direction
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    stage.scale({ x: newScale, y: newScale });

    // Adjust position to zoom centered on mouse position
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    stageRef.current?.fire("zoom")
  };

  useEffect(() => {
    console.log(nodes)
  }, [nodes])
  useEffect(() => {
    console.log(connections)
  }, [connections])
  useEffect(() => {
    console.log(stageRef.current)
    setTimeout
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} onClick={handleClick} ref={stageRef} draggable={canvasIsDraggable} onWheel={handleWheel}
    >
      <Layer>
        <Background />
      </Layer>
      <Layer>
        {
          connections.map(
            (connection, key) => <ConnectedLines 
              key={key}
              connectionData={connection}
            />
          )
        }
      </Layer>
      {edit ? <Layer>
        {
          connections.map(
            (connection, key) => <InvisibleNode 
              key={key}
              connectionData={connection}
            />
          )
        }
      </Layer> : <></>}
      <Layer>
        {
          [...nodes].map(
            ([_, node], key) => <Node
              key={key}
              nodeData={node}
            />
          )
        }
      </Layer>
      {state === "create" ? <Layer>
        <FollowNode />
      </Layer> : <></>}
    </Stage>
  )
}

export default Canvas