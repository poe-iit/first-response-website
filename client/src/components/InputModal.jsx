import React from 'react'
import styled from 'styled-components'

const InputModal = ({open, setOpen, input, setInput, handleAdd, header, content }) => {
  return (
    open ? <Container onClick={e => setOpen(false)}>
      <div className='content-container'
        onClick={e => e.stopPropagation()}
      >
        <h3>{header}</h3>
        <p>{content}</p>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}/>
        <button onClick={() => handleAdd()}>Create</button>
      </div>
    </Container> : null
  )
}

export default InputModal

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  .content-container{
    border: 2px solid gray;
    border-radius: 5px;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
    background-color: white;
    padding: 20px;
  }
`