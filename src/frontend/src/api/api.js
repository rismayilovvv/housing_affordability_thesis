import axios from "axios";

/*
 Uses:
 - local development fallback
 - deployed Netlify environment variable
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* Optional interceptor for debugging */
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
  try {
    const response = await API.get("/countries");
    return response.data.countries;
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    throw error;
  }
};

export const fetchCountryData = async (
  country,
  startYear,
  endYear
) => {
  try {
    const response = await API.get("/data", {
      params: {
        country,
        start_year: startYear,
        end_year: endYear,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      `Failed loading data for ${country}:`,
      error
    );
    throw error;
  }
};

export default API;