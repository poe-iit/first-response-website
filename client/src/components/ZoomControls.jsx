import styled from 'styled-components'
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useContext } from 'react';
import { CanvasContext } from '../hook/CanvasContext';

const ZoomControls = () => {

  const { setSvgScale, scale: svgScale} = useContext(CanvasContext)
  return (
    <Container>
      <button onClick={
        () => setSvgScale(svgScale - 0.1)
      }><RemoveIcon sx={{
        fontSize: "1.3em",
      }}/></button>
      <p>{(svgScale * 100).toFixed(0)}%</p>
      <button onClick={
        () => setSvgScale(svgScale + 0.1)
      }><AddIcon sx={{
        fontSize: "1.3em",
      }}/></button>
    </Container>
  )
}

export default ZoomControls

const Container = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--md-sys-color-surface);
  border: 0.1px solid var(--md-sys-color-surface-dim);
  border-radius: 5px;
  button{
    outline: 0;
    border: 0;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    display: flex;
    align-items: center;
    padding: 0.3em 0.5em;
    cursor: pointer;
    &:hover{
      background-color: var(--md-sys-color-surface-container);
    }
  }
  p{
    color: var(--md-sys-color-on-surface);
    padding: 0 0.6em;
  }
`