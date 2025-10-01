import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { createOrder, failPayment, queryOrderInterval } from "../../api/pay";
import { formatTime1 } from "../../utils/util";
import {
  GENDER_NUMBER_TO_LABEL,
  PROTOCOL_KEY_TO_LABEL,
} from "../../utils/const";
import { uploadUserImage } from "../../api/user";

Page({
  data: {
    user: {} as User,
    options: {} as any,
    selectProtocol: "0",
    showTooltip: false,
    total: 0,
    remark: "",
    coupon: {} as Coupon,
    captain: "",
    discountImage: "",
    fileList: [] as Array<object>,
    showPopup: false,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    PROTOCOL_KEY_TO_LABEL: PROTOCOL_KEY_TO_LABEL,
    needIdCard: false,
  },

  afterRead(e: any) {
    const { file } = e.detail;
    const { fileList = [] } = this.data;
    fileList.push({ ...file });
    uploadUserImage(file.url).then((res: any) => {
      const data = JSON.parse(res.data);
      this.setData({ fileList });
      this.setData({ discountImage: data.data[0] });
    });
  },

  afterDelete(e: any) {
    const delIndex = e.detail.index;
    const { fileList = [] } = this.data;
    fileList.splice(delIndex, 1);
    this.setData({ fileList, discountImage: "" });
  },

  onInputChange(e: any) {
    const curProperty = e.currentTarget.dataset.id;
    const value = e.detail.value || e.detail;
    this.setData({
      [curProperty]: value,
    });
  },

  onRadioChange(e: any) {
    this.setData({
      selectProtocol: e.detail,
      showTooltip: false,
    });
  },

  navigateToCoupons() {
    wx.navigateTo({
      url: "/pages/coupons/index?from=relay",
    });
  },
  clearCoupon() {
    this.setData({
      coupon: {} as Coupon,
    });
  },

  onShow() {
    const app = getApp();
    this.setData({ user: app.globalData.userInfo });
    if (!this.data.user.realName || !this.data.user.phone) {
      Toast({
        message: "请先完善真实姓名和手机号",
        duration:2500,
        type: "info",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }
    if (this.data.needIdCard && !this.data.user.idCard) {
      Toast({
        message: "请先完善身份证号",
        duration: 2500,
        type: "info",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }
  },

  onLoad(options: any) {
    const formatOptions = {
      ...options,
      price: Number(options.price),
      startDate: formatTime1(options.startDate),
      endDate: formatTime1(options.endDate),
    };
    this.setData({
      options: formatOptions,
      total: Number(options.price),
      needIdCard: options.needIdCard === "true",
    });
  },

  confirmOrder() {
    if (this.data.selectProtocol === "0") {
      this.setData({
        showTooltip: true,
      });
      wx.pageScrollTo({
        scrollTop: 99999, // 设置一个足够大的值确保滚动到底部
        duration: 300, // 滚动动画时间（ms）
      });
      return;
    }
    createOrder({
      description: "活动报名费",
      fee: this.data.total,
      tourScheduleId: Number(this.data.options.tourScheduleId),
      activityId: Number(this.data.options.activityId),
      meetingPoint: this.data.options.meetingPoint,
      remark: this.data.remark,
      ...(this.data.coupon.id ? { couponId: this.data.coupon.id } : {}),
      leaderName: this.data.captain || "",
      discountImage: this.data.discountImage || "",
    })
      .then((res: any) => {
        if (res.statusCode === 202) {
          // 0 元支付
          this.showPopupPannel();
          return;
        }
        const payment = res.data.data;
        wx.requestPayment({
          timeStamp: payment.timeStamp,
          nonceStr: payment.nonceStr,
          package: payment.package,
          signType: payment.signType,
          paySign: payment.paySign,
          success: (res: any) => {
            const queryTimer = setInterval(() => {
              queryOrderInterval(payment.outTradeNo)
                .then((res: any) => {
                  this.showPopupPannel();
                  clearInterval(queryTimer);
                })
                .catch(() => {});
            }, 1000);
          },
          fail: (err: any) => {
            failPayment(payment.paymentId).then((res: any) => {
              Toast({
                message: "支付失败，请稍后再试",
                duration: 2000,
                type: "fail",
              });
            });
          },
        });
      })
      .catch((err: any) => {
        console.log(err);
      });
  },

  showPopupPannel() {
    this.setData({ showPopup: true });
  },

  onPopupClose() {
    this.setData({ showPopup: false });
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.setData({ needRefresh: true });
    wx.navigateBack();
  },

  navToManuel(e: any) {
    wx.navigateTo({
      url: `/pages/manuel/index?policyId=${e.currentTarget.dataset.id}`,
    });
  },
});
