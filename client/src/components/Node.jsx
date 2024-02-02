import React, { useEffect, useRef } from 'react'
import styled from "styled-components"

const Node = ({ id, setNodes, node, updateLines, handleClick, selectedOption, selectedNode }) => {
  // Add a dialog box that comes up on right click to change a node to exit node

  const isMoving = useRef(false)
  const circleRef = useRef()

  const diff = useRef()
  const handlePointerDown = (e) => {
    diff.current = {
      x: e.clientX - circleRef.current.attributes.cx.value,
      y: e.clientY - circleRef.current.attributes.cy.value
    }
    isMoving.current = selectedOption === "move" ? true : false
  }

  const handlePointerMove = (e) => {
    if(isMoving.current){
      circleRef.current.attributes.cx.value = e.clientX - diff.current.x
      circleRef.current.attributes.cy.value = e.clientY - diff.current.y
      updateLines(id, {
        x: circleRef.current.attributes.cx.value,
        y: circleRef.current.attributes.cy.value
      })
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
    isMoving.current = false
  }

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointermove", handlePointerMove)
    return () => {
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [])

  return (
    <Container
      className="node"
      cx={node.ui.x}
      cy={node.ui.y}
      r="20"
      fill={node.isDisabled ? "red" : node.isExit ? "blue" : "green" }
      ref={circleRef}
      onPointerDown={handlePointerDown}
      onClick={handleClick && handleClick}
      filter={selectedNode === id ? "url(#glow)" : undefined}
    ></Container>
  )
}

export default Node

const Container = styled.circle`
  position: absolute;
  width: 20px;
  height: 100px;
  background-color: white;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  transform: rotate(${(props) => props.tilt}deg);
`