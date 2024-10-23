import { useState } from 'react'
import styled from 'styled-components'

const FilterInput = ({ header, updateFunc, dataList }) => {
  const [data, setData] = useState("")

  function addData() {
    if(data?.length > 0){
      updateFunc([...dataList, data])
      setData("")
    }
  }
  function handleKeyDown(e) {
    if(e.key === "Enter" || e.keyCode === 13){
      addData()
    }
  }
  function removeData(idx) {
    const copyDataList = [...dataList]
    copyDataList.splice(idx, 1)
    updateFunc(copyDataList)
  }

  return (
    <Container>
      <label htmlFor={`log-filter-${header}`}>
        <input id={`log-filter-${header}`} onInput={(e) => setData(e.target.value)} value={data} onKeyDown={handleKeyDown}/>
        <button onClick={(e) => addData()}>Add</button>
      </label>
      <ul>
        {
          dataList.map((data, key) => <li key={key}>{data} <button onClick={() => removeData(key)}>X</button></li>)
        }
      </ul>
      {
        dataList?.length ? <></> : <p>All {header} selected</p>
      }
    </Container>
  )
}

const Container = styled.div`
  ul{
    list-style: none;
    display: flex;
    flex-direction: row;
    gap: 0.3em;
    margin-top: 0.3em;
    li {
      background-color: #e1dada;
      padding: 0 0 0 0.3em;
      border-radius: 0.2em;
      button {
        font-size: 1em;
        padding: 0.2em 0.3em 0.2em 0;
        background-color: transparent;
        border: 0;
        outline: 0;
        cursor: pointer;
      }
    }
  }
`

export default FilterInput