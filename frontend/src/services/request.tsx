import { Modal } from "antd";
import axios from "axios";
import i18next from 'i18next';
import { history } from 'ice';
import { ErrorComp } from './exception';

function getBaseURL() {
  const publicPath = (process.env.ICE_PUBLIC_PATH || './').replace(/^['"]|['"]$/g, '');

  return publicPath;
}
const request = axios.create({
  timeout: 5 * 1000,
  baseURL: process.env.ICE_CORE_MODE === 'development'
    ? '/api'
    : getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = token;
  }
  if (config.method && config.method.toUpperCase() === 'GET' && config.url) {
    config.url = `${config.url}${config.url.indexOf('?') === -1 ? '?' : '&'}ts=${Date.now()}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const { status, data } = response;

    // console.log("response====", response);
    const statusCategory = Math.floor(status / 100);
    if (statusCategory === 2) {
      if (data && data.data) {
        return Promise.resolve(data.data);
      }
      return Promise.resolve(data);
    }
    return Promise.resolve(response);
  },
  (error) => {
    // console.log("error====", error);
    let { message, config, code } = error;
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        if (config.url.indexOf('/login') !== -1) {
          // Unauthorized response is allowed for a login request.
          Promise.resolve(error.response);
          return;
        }
        // Unauthorized. Jump to the login page.
        Promise.reject(error);
        const currentLocation = window.location.href;
        if (currentLocation.indexOf('/init') === -1 && currentLocation.indexOf('/login') === -1) {
          // 获取当前的路由路径（hash 路由模式下从 hash 中获取）
          const currentPath = window.location.hash ? window.location.hash.slice(1) : '/';
          // 使用 Ice.js 的 history 进行路由跳转
          history?.push({
            pathname: '/login',
            search: currentPath !== '/' ? `redirect=${encodeURIComponent(currentPath)}` : '',
          });
        }
        return;
      }
      const messageKeys = [`request.error.${status}_${config.method}`, `request.error.${status}`];
      for (const key of messageKeys) {
        const localizedMessage = i18next.t(key);
        if (localizedMessage !== key) {
          message = localizedMessage;
          break;
        }
      }
      code = status;
      if (data) {
        config.data = typeof data === 'string' ? data : JSON.stringify(data);
      }
    }
    showErrorModal(message, config, code);
    return Promise.reject(error);
  },
);

function showErrorModal(message: string, config: object, code?: number) {
  Modal.warning({
    title: i18next.t('misc.error'),
    content: <ErrorComp content={message} options={config} code={code} />,
    okText: i18next.t('misc.close'),
    width: 560,
  });
}

export default request;
