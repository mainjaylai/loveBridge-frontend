import {
  JOURNEY_NOTE,
  CANCEL_POLICY,
  INSTRUCTION,
  DISCLAIMER,
  TYPE_TO_ICON,
  TYPE_TO_TITLE,
  DISCOUNT_POLICY,
  PROTOCOL_KEY_TO_LABEL,
  GENDER_NUMBER_TO_LABEL,
  BOOKING_TIPS,
} from "../../utils/const";
import { judgeIsValid, formatTime5 } from "../../utils/util";
import { getActivityDetail } from "../../api/activity";
import { DEFAULT_USER_INFO } from "../../const/user";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { getInviteImage } from "../../api/user";

Page({
  data: {
    statusBarHeight: 0, // 状态栏高度
    navBarHeight: 0, // 导航栏高度（状态栏高度 + 导航栏内容高度）
    scrolled: false, // 滚动后设置top-section不透明
    needRefresh: false,
    activity: {} as Activity,
    userInfo: DEFAULT_USER_INFO,
    curTourIndex: 0,
    curPointIndex: 0,
    curTabIndex: 0,
    showPopup: false,
    JOURNEY_NOTE: JOURNEY_NOTE,
    PROTOCOL_KEY_TO_LABEL: PROTOCOL_KEY_TO_LABEL,
    TYPE_TO_ICON: TYPE_TO_ICON,
    TYPE_TO_TITLE: TYPE_TO_TITLE,
    DISCOUNT_POLICY: DISCOUNT_POLICY,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    popupContent: {
      title: "",
      content: "",
    },
    activityId: "",
  },

  onLoad(options: any) {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight; // 状态栏高度
    const navBarHeight = statusBarHeight + 44; // 导航栏总高度（状态栏高度 + 44px）
    this.setData({
      statusBarHeight,
      navBarHeight,
    });
    this.setData({ activityId: options.activityId });
    this.fetchActivityDetail(options.activityId);
    const app = getApp<IAppOption>();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
    setTimeout(() => {
      if (app.globalData.newUserStatus !== 0) {
        wx.reLaunch({
          url: "/pages/index/index",
        });
      }
    }, 1200);
  },

  onShareAppMessage() {
    if (
      !this.data.userInfo.id ||
      !this.data.activity.id ||
      this.data.userInfo.id === 0
    ) {
      Toast({
        message: "请先完善个人信息",
        duration: 1000,
        type: "fail",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }
    return {
      title: this.data.activity.title,
      path: `/pages/detail/index?activityId=${this.data.activity.id}&inviteCode=${this.data.userInfo.id}`,
      imageUrl: this.data.activity.cover,
    };
  },

  onShow() {
    if (this.data.needRefresh) {
      this.fetchActivityDetail(this.data.activity.id.toString()).then(() => {
        this.setData({ needRefresh: false });
      });
    }
  },

  onShareTimeline() {
    return {
      title: this.data.activity.title,
      query: `activityId=${this.data.activity.id}&inviteCode=${this.data.userInfo.id}`,
      imageUrl: this.data.activity.cover,
    };
  },

  onPullDownRefresh() {
    const activityId = this.data.activity.id;
    this.fetchActivityDetail(activityId.toString()).then(() => {
      wx.stopPullDownRefresh(); // 停止下拉刷新
    });
  },

  fetchActivityDetail(activityId: string) {
    return getActivityDetail(activityId)
      .then((res: any) => {
        let activity = res.data.data;
        activity.highlights = JSON.parse(activity.highlights);
        activity.journey = JSON.parse(activity.journey);
        activity.meetingPoint = JSON.parse(activity.meetingPoint);
        activity.images = JSON.parse(activity.images);
        const formatTourSchedule = activity.tourSchedules
          .map((s: TourSchedule) => {
            return {
              ...s,
              tourScheduleLabel: formatTime5(s.startDate, s.endDate),
              valid: judgeIsValid(s.deadline),
              hasMe: !!s.members.find((i) => i.id === this.data.userInfo.id),
            };
          })
          .sort((a: TourSchedule, b: TourSchedule) =>
            a.startDate.localeCompare(b.startDate)
          );
        activity.tourSchedules = formatTourSchedule;
        
        // 查找第一个未截止的团期
        const initTourIndex = formatTourSchedule.findIndex(
          (f: TourSchedule) => f.valid
        );
        
        // 如果所有团期都已截止，选择最后一个团期
        const selectedIndex = initTourIndex === -1 
          ? formatTourSchedule.length - 1 
          : initTourIndex;

        this.setData({ 
          activity: activity, 
          curTourIndex: selectedIndex 
        });

        // 如果所有团期都截止，显示提示但不跳转
        // if (initTourIndex === -1 && formatTourSchedule.length > 0) {
        //   Toast({
        //     message: "该活动所有团期已结束，不可报名",
        //     duration: 2000,
        //     type: "fail"
        //   });
        // }
      })
      .catch((error) => {
        console.error("Failed to fetch activity details:", error);
      });
  },

  joinActivity() {
    // 截取活动信息
    const activityId = this.data.activity.id;
    const title = this.data.activity.title;
    const duration = this.data.activity.duration;

    // 截取团期信息
    const tourScheduleId =
      this.data.activity.tourSchedules[this.data.curTourIndex].id;
    const startDate =
      this.data.activity.tourSchedules[this.data.curTourIndex].startDate;
    const endDate =
      this.data.activity.tourSchedules[this.data.curTourIndex].endDate;
    const price =
      this.data.activity.tourSchedules[this.data.curTourIndex].price;
    const groupImg =
      this.data.activity.tourSchedules[this.data.curTourIndex].groupCodeImage;

    const needIdCard = this.data.activity.needIdCard

    // 截取上车点
    const meetingPoint =
      this.data.activity.meetingPoint[this.data.curPointIndex];

    if (!activityId || !tourScheduleId) {
      Toast({
        message: "活动信息不完整，无法报名",
        duration: 2000,
        type: "fail",
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/relay/index?activityId=${activityId}&tourScheduleId=${tourScheduleId}&startDate=${startDate}&endDate=${endDate}&title=${title}&duration=${duration}&meetingPoint=${meetingPoint}&price=${price}&groupImg=${groupImg}&needIdCard=${needIdCard}`,
    });
  },

  updateCurTourIndex(e: any) {
    const newIndex = e.currentTarget.dataset.index;
    if (this.data.activity.tourSchedules[newIndex].valid) {
      this.setData({ curTourIndex: newIndex });
    } else {
      Toast({
        message: "该团期已截止报名，请私聊客服尝试报名!",
        duration: 1000,
      });
    }
  },
  updateCurPointIndex(e: any) {
    this.setData({ curPointIndex: e.currentTarget.dataset.index });
  },
  // 解决点击后滚动高度突变问题
  onTabClick(e: any) {
    const index = e.detail.index;

    // 保持当前滚动位置不变，只更新索引
    this.setData({ curTabIndex: index });

    // 延迟执行滚动，避免与组件自身滚动冲突
    wx.createSelectorQuery()
      .select(".tab-container")
      .boundingClientRect((rect) => {
        if (rect) {
          const query = wx.createSelectorQuery();
          query
            .selectViewport()
            .scrollOffset((res) => {
              const currentScrollTop = res.scrollTop;
              const tabTop = rect.top + currentScrollTop;
              wx.pageScrollTo({
                scrollTop: tabTop,
                duration: 100,
              });
            })
            .exec();
        }
      })
      .exec();
  },
  showPopupPannel(e: any) {
    const key = e.currentTarget.dataset.id;
    if (key === "cancelPolicy") {
      this.setData({
        showPopup: true,
        popupContent: {
          title: PROTOCOL_KEY_TO_LABEL["cancelPolicy"],
          content: CANCEL_POLICY,
        },
      });
    } else if (key === "bookingTips") {
      this.setData({
        showPopup: true,
        popupContent: {
          title: PROTOCOL_KEY_TO_LABEL["bookingTips"],
          content: BOOKING_TIPS,
        },
      });
    }
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
  navToManuel(e: any) {
    wx.navigateTo({
      url: `/pages/manuel/index?policyId=${e.currentTarget.dataset.id}`,
    });
  },
  navToUserDetail(e: any) {
    wx.navigateTo({
      url: `/pages/publicProfile/index?userId=${e.currentTarget.dataset.id}`,
    });
  },
  previewHighlightImage(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url],
    });
  },
  // 预览帖子图
  previewSwiperImages(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.activity.images,
    });
  },

  shareActivity() {
    const that = this;
    wx.showLoading({
      title: "生成中",
    });
    getInviteImage(this.data.activity.id)
      .then((res: any) => {
        const fs = wx.getFileSystemManager();
        const filePath = wx.env.USER_DATA_PATH + "/temp_image_activity.png"; // 生成临时文件路径
        fs.writeFile({
          filePath,
          data: res.data.data,
          encoding: "base64",
          success: () => {
            wx.hideLoading();
            wx.showShareImageMenu({
              path: filePath,
              success: () => {},
              fail: (res) => {
                if (res.errMsg.includes("fail auth deny")) {
                  wx.showModal({
                    title: "提示",
                    content: "需要您授权保存相册",
                    showCancel: false,
                    success: (res) => {
                      wx.openSetting({
                        success(settingdata) {
                          if (
                            settingdata.authSetting["scope.writePhotosAlbum"]
                          ) {
                            wx.showModal({
                              title: "提示",
                              content: "获取权限成功,请重试",
                              showCancel: false,
                            });
                          } else {
                            wx.showModal({
                              title: "提示",
                              content: "获取权限失败，无法保存到相册",
                              showCancel: false,
                            });
                          }
                        },
                      });
                    },
                  });
                }
              },
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showModal({
              title: "错误",
              content: "图片加载失败，请重试",
              showCancel: false,
            });
            console.error("图片加载失败", err);
          },
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showModal({
          title: "错误",
          content: "获取邀请图片失败，请重试",
          showCancel: false,
        });
        console.error("获取邀请图片失败", error);
      });
  },
});
