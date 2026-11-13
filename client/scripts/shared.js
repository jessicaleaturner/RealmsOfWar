import axios from '/vendor/axios/axios.min.js';

export const getData = (route) => {
  return axios.get(route);
}

export const sendDataByToken = (route, token, data) => {
  const url = ''+route+token;
  return axios.post(url, data);
}

// this function will convert an array of objects to a readable string
export const convertObjectToString = (data) =>
{
  let temp = '';
  for(var index = 0; index < Object.keys(data).length; index++)
  {
    temp += data[index];
  }
  return temp;
}

/*axios({
  method: 'post',
  url: url,
  dataType: 'jsonp',
  data: data
});*/
