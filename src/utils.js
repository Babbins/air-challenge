export const formatDate = (date) => {
  date = new Date(date);
  const month = (date.getMonth()+1) > 9 ? (date.getMonth()+1) : "0" + (date.getMonth()+1);
  const day = (date.getDate()+1) > 9 ? (date.getDate()+1) : "0" + (date.getDate()+1);
  const hours = (date.getHours()) > 9 ? (date.getHours()) : "0" + (date.getHours());
  const minutes = (date.getMinutes()) > 9 ? (date.getMinutes()) : "0" + (date.getMinutes());
  return `${month}/${day}/${date.getFullYear()} ${hours}:${minutes}`;
}
