import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.status,
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const fetchCountries = async () => {
  const response = await API.get("/countries");
  return response.data.countries;
};

export const fetchCountryData = async (country, startYear, endYear) => {
  const response = await API.get("/data", {
    params: {
      country,
      start_year: startYear,
      end_year: endYear,
    },
  });

  return response.data;
};

export default API;