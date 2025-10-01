import { confirmRefund, reApplyRefund } from "../../api/pay";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

Page({
  data: {
    price: 0,
    paymentId: 0,
    activityId: 0,
    tourScheduleId: 0,
    reason: "",
    isReApply: false,
  },

  onLoad(options: {
    paymentId: string;
    price: string;
    activityId: string;
    tourScheduleId: string;
    isReApply: string;
  }) {
    this.setData({
      price: Number(options.price),
      paymentId: Number(options.paymentId),
      activityId: Number(options.activityId),
      tourScheduleId: Number(options.tourScheduleId),
      isReApply: options.isReApply === "true",
    });
  },
  onInputChange(e: any) {
    this.setData({
      reason: e.detail,
    });
  },
  navigateToOrder() {
    wx.navigateBack();
  },
  confirmRefund() {
    if (!this.data.reason) {
      Toast({
        message: "请填写原因",
        type: "fail",
        duration: 1000,
      });
      return;
    }
    if (this.data.isReApply) {
      reApplyRefund({
        paymentId: this.data.paymentId,
        price: this.data.price,
        activityId: this.data.activityId,
        tourScheduleId: this.data.tourScheduleId,
        reason: this.data.reason,
      }).then((res: any) => {
        wx.showToast({
          title: "申请成功，等待审核",
          icon: "success",
          duration: 2000,
        });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.setData({ needRefresh: true });
        this.navigateToOrder();
      });
    } else {
      confirmRefund({
        paymentId: this.data.paymentId,
        price: this.data.price,
        activityId: this.data.activityId,
        tourScheduleId: this.data.tourScheduleId,
        reason: this.data.reason,
      }).then((res: any) => {
        wx.showToast({
          title: "申请成功，等待审核",
          icon: "success",
          duration: 2000,
        });
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.setData({ needRefresh: true });
        this.navigateToOrder();
      });
    }
  },
});
