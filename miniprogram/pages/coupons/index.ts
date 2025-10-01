import { judgeIsValid, formatTime4 } from "../../utils/util";
import { COUPON_DESCRIPTION } from "../../utils/const";
import { getAllCoupons } from "../../api/pay";

Page({
  data: {
    fromRelay: false,
    curTabIndex: 0,
    showPopup: false,
    coupons: [] as Coupon[],
    COUPON_DESCRIPTION: COUPON_DESCRIPTION,
  },
  onLoad(options: { from?: "relay" }) {
    getAllCoupons().then((res: any) => {
      const formatCoupons = res.data.data.map((c: Coupon) => {
        return {
          ...c,
          status: c.status === 0 && !judgeIsValid(c.deadline) ? 2 : c.status,
          deadlineLabel: formatTime4(c.deadline),
          amount: c.amount / 100,
        };
      });
      this.setData({
        coupons: formatCoupons,
        fromRelay: options.from === "relay",
      });
    });
  },

  onTabClick(e: any) {
    const index = e.detail.index;
    this.setData({ curTabIndex: index });
  },
  onCouponClick(e: any) {
    if (!this.data.fromRelay) {
      return;
    }
    const curCoupon = this.data.coupons.find(
      (c) => c.id === e.currentTarget.dataset.id
    );
    if (curCoupon?.status !== 0) {
      return;
    }
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.setData({ coupon: curCoupon });
    wx.navigateBack();
  },

  showPopupPannel() {
    this.setData({ showPopup: true });
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
});
