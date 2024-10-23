import styled from "styled-components"
import { Link } from "react-router-dom"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]

function padWithZeros(num, length) {
  // Convert the number to a string and pad with leading zeros
  return num.toString().padStart(length, '0');
}

const formatDate1 = (timeStamp) => {
  const createdDate = new Date(parseInt(timeStamp))
  const currDate = new Date()


  // 1000 -> 1 second
  // 60,000 -> 60 seconds -> 1 minute
  // 3,600,000 -> 60 minutes -> 1 hour
  // 3,
  let diff = (currDate - createdDate) / 1000
  if(diff < 60)return `${Math.floor(diff)} second${diff < 2 ? "" : "s"} ago`
  diff /= 60
  if(diff < 60)return `${Math.floor(diff)} minute${diff < 2 ? "" : "s"} ago`
  diff /= 60
  if(diff < 24)return `${Math.floor(diff)} hour${diff < 2 ? "" : "s"} ago`
  diff /= 24

  if(currDate.getYear() !== createdDate.getYear()){
    const yearDiff = currDate.getYear() - createdDate.getYear()
    return `${yearDiff} year${yearDiff < 2 ? "" : "s"} ago`
  }
  if(currDate.getMonth() !== createdDate.getMonth()){
    const monthDiff = currDate.getMonth() - createdDate.getMonth()
    return `${monthDiff} month${monthDiff < 2 ? "" : "s"} ago`
  }
  const dayDiff = currDate.getDate() - createdDate.getDate()
  return `${dayDiff} day${dayDiff < 2 ? "" : "s"} ago`
}

const formatDate2 = (timeStamp) => {
  const createdDate = new Date(parseInt(timeStamp))
  const year = createdDate.getFullYear()
  const month = months[createdDate.getMonth()]
  const date = createdDate.getDate()

  return `${month} ${date}, ${year}`
}

const formatDataISO8601 = (timeStamp) => {
  // 2024-10-23T14:30:00Z
  const createdDate = new Date(parseInt(timeStamp))
  const year = createdDate.getFullYear()
  const month = createdDate.getMonth()
  const day = createdDate.getDate()

  const hour = createdDate.getHours()
  const minute = createdDate.getMinutes()
  const seconds = createdDate.getSeconds()

  return `${year}-${padWithZeros(month, 2)}-${padWithZeros(day, 2)}T${padWithZeros(hour, 2)}:${padWithZeros(minute, 2)}:${padWithZeros(seconds, 2)}`

}

const formatMessage = (message) => {
  const regex = /\((.*?)\)\[(.*?)\]\[(.*?)\]/g
  
  const parts = []
  let lastIndex = 0
  let match

  // Loop through all matches
  while ((match = regex.exec(message)) !== null) {
    const [_, name, modelType, id] = match

    // Push the plain text before the current match
    if (match.index > lastIndex) {
      parts.push(message.slice(lastIndex, match.index))
    }

    // Push the Link component for the current match
    parts.push(<Link key={match.index} to={`/${modelType}/${id}`}>{name}</Link>)

    lastIndex = regex.lastIndex
  }

  // Push the remaining text after the last match
  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex))
  }

  return parts
}

const priorityColor = (priority) => {
  priority = parseInt(priority)
  switch(priority) {
    case 1:
      return "#867676"
    case 2:
      return "#4A5043"
    case 3:
      return "#555893"
    case 4:
      return "#642C61"
    case 5:
      return "#690500"
    default:
      return "#302E2B"
  }
}

const Log = ({
  message, type, createdAt, priority
}) => {
  return (
    <Container $priority={priority}>
      <p className="status">{type}</p>
      <p className="date">{formatDataISO8601(createdAt)}</p>
      <p className="log">{formatMessage(message)}</p>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: 0.5em;
  border-bottom: 1px solid #c6c6c6;
  a {
    text-decoration: none;
    color: #2929b4;
  }
  p.status {
    line-break: anywhere;
  }
  p.date{
    color: #291e5b;
  }
  &::before{
    content: "";
    display: block;
    background-color: ${props => priorityColor(props.$priority)};
    position: absolute;
    left: 0.2em;
    top: 10%;
    height: 80%;
    width: 0.2em;
    border-radius: 2em;

  }
`

export default Log