import { getAllActivities } from "../../api/activity";
import { judgeIsValid, formatTime6 } from "../../utils/util";
import { FAKE_TOP_IMAGES, FAKE_CUSTOM_ACTIVITYS } from "../../const/activity";

Page({
  data: {
    slideShow: FAKE_TOP_IMAGES,
    officialActivities: [] as Activity[],
    customActivities: [] as Activity[],
  },
  onShow() {
    // TODO: 初始化置顶活动轮播图数据
    this.fetchActivities();
  },

  onPullDownRefresh() {
    this.fetchActivities().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchCustomActivities() {
    // TODO: 初始化找搭子活动数据
    const formatActivities = FAKE_CUSTOM_ACTIVITYS.map((a) => {
      const valid = a.tourSchedules?.some((t) => judgeIsValid(t.deadline));
      const formatTourSchedules = a.tourSchedules.map((s) => {
        return {
          ...s,
          startDate: formatTime6(a.tourSchedules[0].startDate),
        };
      });
      return {
        ...a,
        valid,
        tourSchedules: formatTourSchedules,
      };
    });
    this.setData({ activities: formatActivities });
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
          return {
            ...a,
            valid,
            // TODO:
            meetingPoint: ["六道口地铁站C口"],
          };
        });
      this.setData({ officialActivities: formatActivities });
      const formatCustomActivities = res.data.data
        .filter((a: Activity) => a.publisherId !== null)
        .map((a: Activity) => {
          const valid = a.tourSchedules?.some((t: TourSchedule) =>
            judgeIsValid(t.deadline)
          );
          return {
            ...a,
            valid,
            // TODO:
            meetingPoint: ["六道口地铁站C口"],
          };
        });
      this.setData({ customActivities: formatCustomActivities });
    });
  },

  navigateToDetail(event: any) {
    const activityId = event.currentTarget.dataset.id;
    const tourScheduleId = event.currentTarget.dataset.tourScheduleId;
    wx.navigateTo({
      url: `/pages/customDetail/index?activityId=${activityId}&tourScheduleId=${tourScheduleId}`,
    });
  },
  navigateToOfficialActivities() {
    wx.reLaunch({
      url: `/pages/index/index`,
    });
  },
  navigateToOfficialActivity(event: any) {
    const activityId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/index?activityId=${activityId}`,
    });
  },
  navigateToPublish() {
    wx.navigateTo({
      url: `/pages/publish/index`,
    });
  },
});
