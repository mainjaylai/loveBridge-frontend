import {
  DEFAULT_USER_INFO,
  DEFAULT_USER_AVATAR,
  DEFAULT_USER_NICKNAME,
} from "../../const/user";
import { getTestUserList, getUserInfo, switchTestUser } from "../../api/user";

Page({
  data: {
    userInfo: DEFAULT_USER_INFO,
    account: 0,
    DEFAULT_USER_AVATAR: DEFAULT_USER_AVATAR,
    DEFAULT_USER_NICKNAME: DEFAULT_USER_NICKNAME,
    currentTestUser: 1,
    orderTypes: [
      {
        id: 1,
        name: "待付款",
        iconUrl: "/images/order/pending.svg",
      },
      {
        id: 2,
        name: "已付款",
        iconUrl: "/images/order/paid.svg",
      },
      // 不要删，3个排列在这不好看
      {
        id: 3,
        name: "待评价",
        iconUrl: "/images/order/waiting-comment.svg",
      },
      {
        id: 4,
        name: "售后",
        iconUrl: "/images/order/after-sales.svg",
      },
    ],
  },

  // onShow 是为了在edit编辑之后回到主页能够显示更新后的数据，其实最好用needRefresh但是懒得做了
  onShow() {
    const app = getApp<IAppOption>();
    if (app.globalData && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        account: app.globalData.userInfo.money / 100,
      });
    } else {
      console.error("User info or money data is missing in globalData");
    }
  },

  onPullDownRefresh() {
    const app = getApp<IAppOption>();
    if (app.globalData && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        account: app.globalData.userInfo.money / 100,
      });
    } else {
      console.error("User info or money data is missing in globalData");
    }
    wx.stopPullDownRefresh();
  },
  
  // 切换测试用户 - 显示选择菜单
  switchTestUser() {
    // 仅允许ID为1的用户使用此功能
    if (this.data.userInfo.role !== 3) {
      return;
    }

    getTestUserList().then((res: any) => {
      const data = res.data.data;
      const itemList = data.map((item: any) => {
        return `切换到用户——${item.nickname}`;
      });

      wx.showActionSheet({
        itemList: itemList,
        success: (res) => {
          const userId = data[res.tapIndex].id;
          switchTestUser(userId).then((res: any) => {
            const token = res.data.data;
            wx.setStorageSync("token", token);
            return getUserInfo(); 
          }).then((res: any) => {
            const userInfo = res.data.data;
            const app = getApp<IAppOption>();
            app.globalData.userInfo = userInfo;
            this.setData({
              userInfo: userInfo,
            });
          });
        }
      });
    });
  },

  navigateToMyTrip() {
    wx.navigateTo({
      url: "/pages/myTrip/index",
    });
  },

  navigateToEditProfile() {
    wx.navigateTo({
      url: "/pages/edit/index",
    });
  },
  navigateToWallet() {
    wx.navigateTo({
      url: "/pages/wallet/index",
    });
  },
  navigateToOrders(event: any) {
    const id = event.currentTarget.dataset?.id || "0";
    wx.navigateTo({
      url: "/pages/orders/index?id=" + id,
    });
  },
  navigateToFriends() {
    wx.navigateTo({
      url: "/pages/friends/index",
    });
  },
  navigateToMyPosts() {
    wx.navigateTo({
      url: "/pages/myPosts/index",
    });
  },
  navigateToMyActivities() {
    wx.navigateTo({
      url: "/pages/myActivities/index",
    });
  },
  navigateToAbout() {
    wx.navigateTo({
      url: "/pages/about/index",
    });
  },
  navigateToFeedback() {
    wx.navigateTo({
      url: "/pages/feedback/index",
    });
  },
  navigateToCoupons() {
    wx.navigateTo({
      url: "/pages/coupons/index",
    });
  },
  navigateToSettings() {
    wx.navigateTo({
      url: "/pages/settings/index",
    });
  },
  navigateToSingleInfo() {
    wx.navigateTo({
      url: '/pages/singleInfo/index',
    });
  },
  navigateToCPpool() {
    wx.navigateTo({
      url: '/pages/cpPool/index',
    });
  },
});
