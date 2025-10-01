import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { uploadUserImage } from "../../api/user";
import { createCustomActivity } from "../../api/customActivity";
import { LOCATION_KEY, LOCATION_REFERER } from "../../utils/const";
import { formatTime6 } from "../../utils/util";
const chooseLocation = requirePlugin("chooseLocation");

Page({
  data: {
    fileList: [] as Array<object>,
    groupCode: [] as Array<object>,
    activity: {
      title: "",
      introduce: "",
    },
    schedule: {
      maxPeople: "",
      startDate: "",
      endDate: "",
      deadline: "",
      price: "",
    },
    meetingPoint: {} as ActivityLocation,

    // 状态管理
    curProperty: "",
    currentDate: new Date().getTime() as string | number,
    scheduleFormat: {
      startDate: "",
      endDate: "",
      deadline: "",
    },
    minDate: new Date().getTime(),
    maxDate: new Date().getTime(),
    showPopup: false,
    filter(type: string, options: number[]) {
      if (type === "minute") {
        return options.filter((option) => option % 10 === 0);
      }
      return options;
    },
  },

  onLoad() {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 2);
    const maxDate = currentDate.getTime();
    this.setData({ maxDate });
  },

  onShow() {
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (!location) {
      return;
    }
    this.setData({ meetingPoint: location });
  },

  // 处理图片大小超出限制
  onOversize() {
    Toast({
      type: "fail",
      message: "图片大小不能超过15MB",
      duration: 2000,
    });
  },

  // 活动图
  afterRead(e: any) {
    const { file } = e.detail;
    const fileList = [...this.data.fileList, ...file];
    this.setData({ fileList });
  },
  afterDelete(e: any) {
    const delIndex = e.detail.index;
    const { fileList = [] } = this.data;
    fileList.splice(delIndex, 1);
    this.setData({ fileList });
  },

  // 群二维码
  setGroupCode(e: any) {
    const { file } = e.detail;
    const { groupCode = [] } = this.data;
    groupCode.push({ ...file });
    this.setData({ groupCode });
  },
  delGroupCode(e: any) {
    const delIndex = e.detail.index;
    const { groupCode = [] } = this.data;
    groupCode.splice(delIndex, 1);
    this.setData({ groupCode });
  },

  onActivityInputChange(e: any) {
    const curProperty = e.currentTarget.dataset.id;
    const value = e.detail;
    this.setData({
      [`activity.${curProperty}`]: value,
    });
  },
  onScheduleInputChange(e: any) {
    const curProperty = e.currentTarget.dataset.id;
    const value = e.detail;
    this.setData({
      [`schedule.${curProperty}`]: value,
    });
  },

  // popup
  showPopupPannel(e: any) {
    const that = this;
    const curProperty = e.currentTarget.dataset
      .id as keyof typeof that.data.schedule;
    const curTime = this.data.schedule[curProperty];
    this.setData({
      curProperty: curProperty,
      currentDate: curTime === "" ? new Date().getTime() : curTime,
      showPopup: true,
    });
  },
  onPopupClose() {
    this.setData({ showPopup: false, currentDate: new Date().getTime() });
  },

  // TODO: 直接选时间会有问题，要%10。(换不换时间选择器决定了这个怎么写)
  onPickerConfirm(e: any) {
    const that = this;
    const schedule = this.data.schedule;
    schedule[this.data.curProperty as keyof typeof that.data.schedule] =
      e.detail;
    const scheduleFormat = this.data.scheduleFormat;
    scheduleFormat[
      this.data.curProperty as keyof typeof that.data.scheduleFormat
    ] = formatTime6(e.detail);
    this.setData({ schedule, scheduleFormat });
    this.onPopupClose();
  },

  onSelectLocation() {
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${LOCATION_KEY}&referer=${LOCATION_REFERER}`,
    });
  },

  check() {
    let message = "校验通过";
    let isValid = true;

    if (this.data.fileList.length === 0) {
      message = "请上传活动图片";
      isValid = false;
    } else if (this.data.activity.title === "") {
      message = "请填写活动标题";
      isValid = false;
    } else if (this.data.activity.introduce === "") {
      message = "请填写活动介绍";
      isValid = false;
    } else if (this.data.schedule.maxPeople === "") {
      message = "请填写活动人数";
      isValid = false;
    } else if (this.data.schedule.startDate === "") {
      message = "请填写活动开始时间";
      isValid = false;
    } else if (this.data.schedule.endDate === "") {
      message = "请填写活动结束时间";
      isValid = false;
    } else if (this.data.schedule.deadline === "") {
      message = "请填写报名截止时间";
      isValid = false;
    } else if (this.data.schedule.price === "") {
      message = "请填写活动价格";
      isValid = false;
    } else if (!this.data.meetingPoint) {
      message = "请选择活动地点";
      isValid = false;
    } else if (this.data.groupCode.length === 0) {
      message = "请上传群二维码";
      isValid = false;
    }

    if (!isValid) {
      Toast({
        message: message,
        type: "fail",
        duration: 2000,
      });
    }
    return isValid;
  },

  dataPackaging() {
    // TODO: 时间格式转换(换不换时间选择器决定了这个怎么写)，调传图，
    const images = [
      "https://mmbiz.qpic.cn/mmbiz_jpg/cBNNH55ySxbSKNFKJUiaZvSDIH3YFiaIcI67b2lSGKBiawO658IjApQ4oYKbn5hHtSnvibPUXN0gRjrZicqfShOLic8g/640?wx_fmt=jpeg&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1",
    ];
    const groupCodeStr =
      "https://mmbiz.qpic.cn/mmbiz_jpg/cBNNH55ySxbSKNFKJUiaZvSDIH3YFiaIcI67b2lSGKBiawO658IjApQ4oYKbn5hHtSnvibPUXN0gRjrZicqfShOLic8g/640?wx_fmt=jpeg&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1";
    const tourSchedule = this.data.schedule;
    return {
      ...this.data.activity,
      images,
      duration: 1,
      tourSchedules: [
        {
          ...tourSchedule,
          price: Number(tourSchedule.price) * 100,
          groupCodeImage: groupCodeStr,
        },
      ],
      meetingPoint: [
        {
          ...this.data.meetingPoint,
          meetingTime: tourSchedule.startDate,
        },
      ],
    };
  },

  publish() {
    const activity = this.dataPackaging();
    createCustomActivity({
      title: activity.title,
      content: activity.introduce,
      images: activity.images,
      startDate: "2025-03-21T18:42:00+08:00",
      endDate: "2025-03-22T18:42:00+08:00",
      deadline: "2025-03-22T18:42:00+08:00",
      meetingPoint: "六道口地铁站C口",
      price: 1,
      maxPeople: 10,
      groupCodeImage:
        "https://mmbiz.qpic.cn/mmbiz_jpg/cBNNH55ySxbSKNFKJUiaZvSDIH3YFiaIcI67b2lSGKBiawO658IjApQ4oYKbn5hHtSnvibPUXN0gRjrZicqfShOLic8g/640?wx_fmt=jpeg&from=appmsg&tp=wxpic&wxfrom=5&wx_lazy=1&wx_co=1",
    }).then((res) => {
      wx.showToast({
        title: "发布成功",
        icon: "success",
        duration: 2000,
      });
    });
  },
});
