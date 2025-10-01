// index.ts
// 获取应用实例
import { getAllActivities } from "../../api/activity";
import { findClosestToNow, judgeIsValid, sortEvents } from "../../utils/util";

// 确保 globalData 中有 newUserStatus 属性
const app = getApp<IAppOption>();
if (typeof app.globalData.newUserStatus === "undefined") {
  console.error("newUserStatus 未定义");
}

Page({
  data: {
    statusBarHeight: 0, // 状态栏高度
    navBarHeight: 0, // 导航栏高度（状态栏高度 + 导航栏内容高度）
    activities: [] as Activity[], // 用于存储活动数据
    newUserStatus: 0,
    showPopup: false,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight; // 状态栏高度
    const navBarHeight = statusBarHeight + 44; // 导航栏总高度（状态栏高度 + 44px）
    this.setData({
      statusBarHeight,
      navBarHeight,
    });
    this.fetchActivities();
    setTimeout(() => {
      this.setData({
        newUserStatus: app.globalData.newUserStatus,
        showPopup: app.globalData.newUserStatus !== 0,
      });
    }, 1200);
  },

  onShow() {
    this.onPopupClose();
  },

  fetchActivities() {
    // 模拟从API获取数据
    return getAllActivities().then((res: any) => {
      const formatActivities = res.data.data
        .filter((a: Activity) => a.publisherId === null)
        .map((a: Activity) => {
          const valid = a.tourSchedules?.some((t: TourSchedule) =>
            judgeIsValid(t.deadline)
          );
          const closestTourDDL = findClosestToNow(a.tourSchedules, 'deadline')?.deadline;
          return {
            ...a,
            valid,
            closestTourDDL
          };
        });
      const sortActivities = sortEvents(formatActivities);
      this.setData({ activities: sortActivities });
    });
  },

  onPullDownRefresh() {
    // 触发下拉刷新时重新获取活动数据
    this.fetchActivities().then(() => {
      wx.stopPullDownRefresh(); // 停止下拉刷新动画
    });
  },

  navigateToEdit() {
    wx.navigateTo({
      url: `/pages/edit/index`,
    });
  },
  navigateToDetail(event: any) {
    const activityId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/index?activityId=${activityId}`,
    });
  },
  navToCPDetail() {
    wx.navigateTo({
      url: `/pages/cpDetail/index`,
    });
  },

  onPopupClose() {
    this.setData({ showPopup: false });
    app.globalData.newUserStatus = 0;
  },

  onShareAppMessage() {
    return {
      title: '青衫爱旅行',
      path: `/pages/index/index`,
      imageUrl: '/images/logo-green.png',
    };
  },
  onShareTimeline() {
    return {
      title: '青衫爱旅行',
      imageUrl: '/images/logo-green.png',
    };
  },
});
