import { getUserInfo, login } from "./api/user";
import { DEFAULT_USER_INFO } from "./const/user";

// app.ts
App<IAppOption>({
  globalData: {
    newUserStatus: 0,
    userInfo: DEFAULT_USER_INFO,
  },
  onLaunch(options: any) {
    let inviteCode = "";
    let activityId = "";
    if (options.query.inviteCode) {
      // 链接里的参数可以通过options.query读取，适用于分享给微信好友
      inviteCode = options.query.inviteCode;
    } else if (options.query.scene) {
      // 二维码里的参数可以通过options.query.scene读取
      const scene = decodeURIComponent(options.query.scene);
      console.log("scene", scene);
      const sceneData = scene.split(",");
      inviteCode = sceneData[0];
      if (sceneData.length > 1) {
        activityId = sceneData[1];
      }
    }
    console.log("inviteCode", inviteCode);
    console.log("activityId", activityId);
    wx.cloud.init({
      env: "prod-3gl7kxoab1799744",
    });

    wx.showLoading({ title: "加载中..." }); // 显示加载中
    wx.login({
      success: (res) => {
        login(res.code, inviteCode)
          .then((res: any) => {
            wx.setStorageSync("token", res.data.data.token);
            this.globalData.newUserStatus = res.data.data.status;
            return getUserInfo(); // 确保返回 Promise
          })
          .then((r: any) => {
            const userInfo = r.data.data;
            this.globalData.userInfo = userInfo;
            wx.hideLoading();
            if (activityId) {
              wx.redirectTo({
                url: `/pages/detail/index?activityId=${activityId}`,
              });
            }
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
