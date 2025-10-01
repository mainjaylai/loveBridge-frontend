import {
  numberToZh,
  JOURNEY_NOTE,
  CANCEL_POLICY,
  INSTRUCTION,
  DISCLAIMER,
  TYPE_TO_ICON,
  TYPE_TO_TITLE,
  DISCOUNT_POLICY,
  GENDER_NUMBER_TO_LABEL,
} from "../../utils/const";
import { judgeIsValid } from "../../utils/util";
import { getActivityDetail } from "../../api/activity";
import { DEFAULT_USER_INFO } from "../../const/user";
import { FAKE_CUSTOM_ACTIVITYS } from "../../const/activity";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

Page({
  data: {
    needRefresh: false,
    activity: FAKE_CUSTOM_ACTIVITYS[0],
    userInfo: DEFAULT_USER_INFO,
    showPopup: false,
    curTourIndex: 0,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    activityId: "",
    tourScheduleId: "",
  },

  onLoad(options: any) {
    this.setData({
      activityId: options.activityId,
      tourScheduleId: options.tourScheduleId,
    });
    const app = getApp<IAppOption>();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },

  onShow() {
    this.fetchActivityDetail(this.data.activityId);
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
              // tourScheduleLabel: this.getTourScheduleLabel(
              //   s.startDate,
              //   s.endDate
              // ),
              valid: judgeIsValid(s.deadline),
              hasMe: !!s.members.find((i) => i.id === this.data.userInfo.id),
            };
          })
          .sort((a: TourSchedule, b: TourSchedule) =>
            a.startDate.localeCompare(b.startDate)
          );
        activity.tourSchedules = formatTourSchedule;
        const initTourIndex = formatTourSchedule.findIndex(
          (f: TourSchedule) => f.valid
        );
        if (initTourIndex === -1) {
          Toast({
            message: "该活动已结束，即将返回首页",
            duration: 2000,
            type: "fail",
            onClose: () => {
              wx.reLaunch({
                url: "/pages/index/index",
              });
            },
          });
        }
        this.setData({ activity: activity, curTourIndex: initTourIndex });
      })
      .catch((error) => {
        console.error("Failed to fetch activity details:", error);
      });
  },

  joinActivity() {
    // 截取活动信息

    const title = this.data.activity.title;
    const duration = this.data.activity.duration;

    // 截取团期信息
    const startDate =
      this.data.activity.tourSchedules[this.data.curTourIndex].startDate;
    const endDate =
      this.data.activity.tourSchedules[this.data.curTourIndex].endDate;
    const price =
      this.data.activity.tourSchedules[this.data.curTourIndex].price;
    const groupImg =
      this.data.activity.tourSchedules[this.data.curTourIndex].groupCodeImage;

    // 截取上车点
    const meetingPoint = this.data.activity.meetingPoint[0];

    wx.navigateTo({
      url: `/pages/relay/index?activityId=${this.data.activityId}&tourScheduleId=${this.data.tourScheduleId}&startDate=${startDate}&endDate=${endDate}&title=${title}&duration=${duration}&meetingPoint=${meetingPoint}&price=${price}&groupImg=${groupImg}`,
    });
  },

  onSelectLocation() {
    const location = this.data.activity.meetingPoint[0];
    wx.navigateTo({
      url: `/pages/map/index?longitude=${location.longitude}&latitude=${location.latitude}&name=${location.name}`,
    });
  },

  showPopupPannel(e: any) {
    const key = e.currentTarget.dataset.id;
    if (key === "instruction") {
      this.setData({
        showPopup: true,
        popupContent: { title: "报名须知", content: INSTRUCTION },
      });
    } else {
      this.setData({
        showPopup: true,
        popupContent: { title: "免责条款", content: DISCLAIMER },
      });
    }
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
});
