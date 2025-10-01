import {
  failPayment,
  getPaymentDetail,
  getRefundDetail,
  payUnpaidOrder,
  queryOrderInterval,
} from "../../api/pay";
import { formatTime1, formatTime3, judgeIsValid } from "../../utils/util";
import {
  GENDER_NUMBER_TO_LABEL,
  ORDER_STATUS_TO_ORDERTYPEID,
  ORDER_STATUS_TO_LABEL,
} from "../../utils/const";
import { DEFAULT_USER_INFO } from "../../const/user";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

Page({
  data: {
    needRefresh: false,
    user: DEFAULT_USER_INFO,
    tourScheduleMember: {} as TourScheduleMember,
    payment: {} as Payment,
    refund: {} as Refund,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    ORDER_STATUS_TO_LABEL: ORDER_STATUS_TO_LABEL,
    ORDER_STATUS_TO_ORDERTYPEID: ORDER_STATUS_TO_ORDERTYPEID,
  },

  onLoad(options: { paymentId: string; refundId?: string }) {
    this.fetchData(options);
    // 获取用户信息
    const app = getApp();
    this.setData({
      user: app.globalData.userInfo,
    });
  },

  onShow() {
    if (this.data.needRefresh) {
      this.fetchData({
        paymentId: this.data.payment.id.toString(),
      });
      this.setData({ needRefresh: false });
    }
  },

  fetchData(options: { paymentId: string; refundId?: string }) {
    // 如果是paymentId，则获取paymentDetail
    wx.showLoading({
      title: "加载中",
    });
    if (options.paymentId) {
      getPaymentDetail(options.paymentId).then((res: any) => {
        const curData = res.data.data;
        this.setData({
          payment: {
            ...curData.payment,
            showOutTradeNo:
              curData.payment.outTradeNo.slice(0, 4) +
              "****" +
              curData.payment.outTradeNo.slice(-4),
            createdAt: formatTime3(curData.payment.createdAt),
            tourSchedule: {
              ...curData.payment.tourSchedule,
              startDate: formatTime1(curData.payment.tourSchedule.startDate),
              endDate: formatTime1(curData.payment.tourSchedule.endDate),
            },
          },
        });
        wx.hideLoading();
        if (curData.tourScheduleMember) {
          this.setData({
            tourScheduleMember: curData.tourScheduleMember,
          });
        }
      });
    }
    if (options.refundId) {
      //  如果是refundId，则获取refundDetail
      getRefundDetail(options.refundId).then((res: any) => {
        this.setData({
          refund: res.data.data,
        });
      });
    }
  },

  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.payment.outTradeNo,
      fail: (error) => {
        console.error("Failed to copy order number:", error);
        Toast.fail("复制订单号失败");
      },
    });
  },

  applyRefund(e: any) {
    if (!judgeIsValid(this.data.payment.tourSchedule.deadline)) {
      Toast({
        message: "抱歉，您已错过申请时效，如需售后可联系在线客服处理!",
        duration: 2000,
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/refundDetail/index?paymentId=${this.data.payment.id}&price=${
        this.data.payment.finalAmount
      }&activityId=${this.data.payment.activityId}&tourScheduleId=${
        this.data.payment.tourScheduleId
      }&isReApply=${this.data.payment.status === 4}`,
    });
  },

  cancelOrder() {
    failPayment(this.data.payment.id).then((res: any) => {
      Toast({
        message: "订单已取消",
        duration: 2000,
        type: "success",
        onClose: () => {
          wx.navigateBack();
        },
      });
    });
  },

  payUnpaid() {
    payUnpaidOrder(this.data.payment.id).then((res: any) => {
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
                clearInterval(queryTimer);
                Toast({
                  message: "支付成功",
                  duration: 2000,
                  type: "success",
                  onClose: () => {
                    wx.navigateBack();
                  },
                });
              })
              .catch(() => {});
          }, 1000);
        },
        fail: (err: any) => {
          Toast({
            message: "支付失败，请稍后再试",
            duration: 2000,
            type: "fail",
          });
        },
      });
    });
  },
});
