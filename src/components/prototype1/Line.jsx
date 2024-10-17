import styled from "styled-components"

const Line = ({ x, y, length, angle }) => {
  return (
    <Container $angle={angle} $length={length} $x={x} $y={y} />
  )
}

const Container = styled.div`
  position: absolute;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$length}px;
  height: 1px;
  background-color: black;
  transform-origin: 0% 0%;
  transform: rotate(${props => props.$angle}deg);
`
export default Line