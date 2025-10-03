import { getUserInfo, login } from "./api/user";
import { DEFAULT_USER_INFO } from "./const/user";

// app.ts
App<IAppOption>({
  globalData: {
    newUserStatus: 0,
    userInfo: DEFAULT_USER_INFO,
  },
  onLaunch(options: any) {
    wx.cloud.init({
      env: "prod-3gl7kxoab1799744",
    });

    wx.showLoading({ title: "加载中..." }); // 显示加载中
    wx.login({
      success: (res) => {
        login(res.code)
          .then((res: any) => {
            wx.setStorageSync("token", res.data.data.token);
            return getUserInfo(); // 确保返回 Promise
          })
          .then((r: any) => {
            const userInfo = r.data.data;
            this.globalData.userInfo = userInfo;
            wx.hideLoading();
          })
          .catch((error) => {
            console.error("Error during login or fetching user info:", error);
            wx.removeStorageSync("token");
            wx.reLaunch({
              url: "/pages/index/index",
            });
          });
      },
      fail: (error) => {
        console.error("wx.login failed:", error);
        wx.hideLoading();
        wx.reLaunch({
          url: "/pages/index/index",
        });
      },
    });
  },
});
