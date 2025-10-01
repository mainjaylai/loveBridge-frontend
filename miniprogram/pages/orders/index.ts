import { getAllOrders } from "../../api/pay";
import {
  ORDER_STATUS_TO_LABEL,
  ORDER_STATUS_TO_ORDERTYPEID,
} from "../../utils/const";
import { formatTime2 } from "../../utils/util";

Page({
  data: {
    orderTypeId: 0,
    payments: [] as Payment[],
    refunds: [] as Refund[],
    ORDER_STATUS_TO_LABEL: ORDER_STATUS_TO_LABEL,
    ORDER_STATUS_TO_ORDERTYPEID: ORDER_STATUS_TO_ORDERTYPEID,
  },

  onLoad(options: { id: string }) {
    this.setData({
      orderTypeId: Number(options.id),
    });
  },

  onShow() {
    this.fetchData();
  },

  fetchData() {
    wx.showLoading({
      title: "加载中",
    });
    return getAllOrders()
      .then((res: any) => {
        if (res.data && res.data.data) {
          const formatPayments = res.data.data.payments
            .reverse()
            .map((p: Payment) => {
              return {
                ...p,
                orderTypeId: ORDER_STATUS_TO_ORDERTYPEID[p.status],
                tourSchedule: {
                  ...p.tourSchedule,
                  startDate: formatTime2(p.tourSchedule.startDate),
                  endDate: formatTime2(p.tourSchedule.endDate),
                },
              };
            });
          this.setData({
            payments: formatPayments,
            refunds: res.data.data.refunds,
          });
        } else {
          console.error("Invalid response structure", res);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch orders", error);
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onTabClick(e: any) {
    const index = e.detail.index;
    this.setData({ orderTypeId: index });
  },

  navigateToOrder(event: any) {
    const paymentId = event.currentTarget.dataset.id;
    const orderTypeId = event.currentTarget.dataset.ordertypeid;
    if (orderTypeId === 4) {
      const refundId = this.data.refunds
        ? this.data.refunds.find((r) => r.paymentId === paymentId)?.id
        : null;
      wx.navigateTo({
        url: `/pages/order/index?paymentId=${paymentId}&refundId=${refundId}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/index?paymentId=${paymentId}`,
      });
    }
  },
});
