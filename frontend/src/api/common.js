import axios from "axios";

const postMethod = async (url, endpoint, data) => {
  try {
    console.log("url", url, "endpoint", endpoint, "data", data);
    const response = await axios.post(`${url}/${endpoint}`, data);
    if (response.status === 200) {
      const jwtToken = response.data.jwtToken; 
      localStorage.setItem("jwtToken", jwtToken);
    }
    return response.status
  } catch (error) {
    console.error("Something went wrong in post request");
    return null;
  }
};

const getMethod = async (url, endpoint) => {
  try{
    console.log("url", url, "endpoint", endpoint);
    const response = await axios.get(`${url}/${endpoint}`)
    return response.status
  }catch(error){
    console.error("Something went wrong in post request");
    return null;
  }
}

export { postMethod, getMethod };
