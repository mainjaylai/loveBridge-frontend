/**
 * get, post, delete 方法的封装
 *
 * 本项目 API 文档：
 * -- https://app.swaggerhub.com/apis/imageslr/weapp/1.0.1
 */

/**
 * 服务器根路径
 */
// export const BASE_URL = "https://backend.qingshanoutdoor.top/test";
export const BASE_URL = "http://localhost:8080";
export const IS_TEST = true;

export const PROD_URL = "https://backend.qingshanoutdoor.top/outdoor"; // 不要改他，测试和生产环境都用这个

/**
 * get 方法
 * @param relativeUrl 相对路径 必填
 * @param param 参数 可选
 * @param header 请求头参数 可选
 * @returns {Promise}
 */
export function get(
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  return requestWithModal("GET", relativeUrl, param, header);
}

/**
 * post 方法
 */
export function post(
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  return requestWithModal("POST", relativeUrl, param, header);
}

/**
 * del 方法
 */
export function del(
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  return requestWithModal("DELETE", relativeUrl, param, header);
}

/**
 * put 方法
 */
export function put(
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  return requestWithModal("PUT", relativeUrl, param, header);
}

/**
 * 请求失败时，显示服务器的错误信息(data.message)或微信的错误信息(errMsg)
 */
export function requestWithModal(
  method: "GET" | "POST" | "DELETE" | "PUT",
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  return request(method, relativeUrl, param, header).catch((res: any) => {
    let errMsg;
    if (res.data && res.data.message) {
      errMsg = res.data.message;
    } else {
      errMsg = res.statusCode ? "发生未知错误，请联系开发者" : res.errMsg;
    }
    wx.showModal({
      content: errMsg,
      showCancel: false,
    });
    return Promise.reject(res);
  });
}

/**
 * request 基类方法
 * 状态码 ≥ 400 时，返回 rejected 状态的 promise
 * @param method 请求方式 必填
 * @param relativeUrl 相对路径 必填
 * @param param 参数 可选
 * @param header 请求头参数 可选
 * @returns {Promise} 返回响应完整内容
 */
export function request(
  method: "GET" | "POST" | "DELETE" | "PUT",
  relativeUrl: string,
  param?: { [key: string]: any },
  header?: object
) {
  // 删除所有为 null 的参数
  if (param) {
    for (var key in param) {
      if (param[key] === null) {
        delete param[key];
      }
    }
  }

  let response: any, error: any;
  const useWxRequest = IS_TEST || relativeUrl.startsWith("/pay/withdraw");
  const url = useWxRequest
    ? relativeUrl.startsWith("/pay/withdraw")
      ? PROD_URL + relativeUrl
      : BASE_URL + relativeUrl
    : relativeUrl;

  // 通用的请求头处理
  const baseHeader = useWxRequest
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${wx.getStorageSync("token")}`,
      }
    : {
        "X-WX-SERVICE": "app",
        "content-type": "application/json",
        Authorization: `Bearer ${wx.getStorageSync("token")}`,
      };

  // 通用的响应处理
  const handleSuccess = (res: any, resolve: any, reject: any) => {
    response = res.data;
    if (res.statusCode < 400) {
      resolve(res);
    } else if (res.statusCode === 401) {
      wx.removeStorageSync("token");
      wx.reLaunch({
        url: "/pages/index/index",
      });
    } else {
      reject(res);
    }
  };

  const handleFail = (err: any, reject: any) => {
    error = err;
    reject(err);
  };

  const handleComplete = () => {
    console.info("==============>请求开始<==============");
    console.warn(method, relativeUrl);
    if (param) console.warn("参数：", param);
    if (response) {
      console.warn("请求成功：", response);
    } else {
      console.warn("请求失败：", error);
    }
    console.info("==============>请求结束<==============");
  };

  return new Promise((resolve: any, reject: any) => {
    if (useWxRequest) {
      wx.request({
        url,
        method,
        header: Object.assign(baseHeader, header),
        data: param || {},
        success: (res) => handleSuccess(res, resolve, reject),
        fail: (err) => handleFail(err, reject),
        complete: handleComplete,
      });
    } else {
      (wx.cloud as any).callContainer({
        config: {
          env: "prod-3gl7kxoab1799744",
        },
        path: url,
        header: Object.assign(baseHeader, header),
        method,
        data: param || {},
        success: (res: any) => handleSuccess(res, resolve, reject),
        fail: (err: any) => handleFail(err, reject),
        complete: handleComplete,
      });
    }
  });
}

export function uploadFile(relativeUrl: string, filePath: string) {
  let response: any, error: any;
  const url = IS_TEST ? BASE_URL + relativeUrl : PROD_URL + relativeUrl;
  return new Promise((resolve: any, reject: any) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: "images",
      header: {
        Authorization: `Bearer ${wx.getStorageSync("token")}`,
        "Content-Type": "multipart/form-data",
      },
      success(res) {
        response = res.data;
        if (res.statusCode < 400) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail(err) {
        err = err;
        reject(err);
      },
      complete() {
        console.info("==============>请求开始<==============");
        if (response) {
          console.warn("请求成功：", response);
        } else {
          console.warn("请求失败：", error);
        }
        console.info("==============>请求结束<==============");
      },
    });
  });
}
