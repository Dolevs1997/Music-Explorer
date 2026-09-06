import axios from "axios";

// Your existing config
axios.defaults.withCredentials = true;
// 1. Create flags for the waiting room
let isRefreshing = false;
let failedQueue = [];

// 2. Create a function to process the waiting room
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  // 3. Clear the waiting room after processing
  failedQueue = [];
};

// The Global Interceptor
axios.interceptors.response.use(
  (response) => {
    // If the request succeeds, just pass it through normally
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized and we haven't retried this specific request yet...
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true; // Mark as retried to prevent infinite loops
      isRefreshing = true; // Set the flag to indicate a refresh is in progress

      try {
        // 1. Attempt a silent refresh.
        // The browser automatically attaches the httpOnly refreshToken cookie here.
        const response = await axios.get("/auth/refresh");
        console.log("originalRequest:", originalRequest);
        console.log("Silent refresh successful:", response.data);
        // 4. Refresh succeeded! Release the waiting room and retry all queued requests
        processQueue(null, "success");
        return axios(originalRequest);
      } catch (refreshError) {
        // 5. Refresh completely failed. Kick everyone out.
        processQueue(refreshError, null);
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset the flag after processing
      }
    }

    // For all other errors (400, 404, 500, etc.), just reject normally
    return Promise.reject(error);
  },
);
