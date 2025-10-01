import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { LABEL_POOL } from "../../const/user";
import { updateUserInfo } from "../../api/user";

Page({
  data: {
    selectedLabels: [] as string[],
    customLabel: "",
    curTabIndex: 0,
    showPopup: false,
    LABEL_POOL: LABEL_POOL,
  },
  onLoad() {
    const app = getApp<IAppOption>();
    const userInfo = JSON.parse(JSON.stringify(app.globalData.userInfo));
    this.setData({
      selectedLabels: userInfo.tags ? userInfo.tags : [],
    });
  },
  onSave() {
    const app = getApp<IAppOption>();
    const userInfo = JSON.parse(JSON.stringify(app.globalData.userInfo));
    updateUserInfo({
      ...userInfo,
      tags: this.data.selectedLabels,
    }).then((res: any) => {
      const user = res.data.data;
      app.globalData.userInfo = user;
      Toast({
        type: "success",
        message: "保存成功",
        duration: 1000,
        onClose: () => {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          prevPage.setData({ needRefresh: true });
          wx.navigateBack();
        },
      });
    });
  },

  addLabel(label: string) {
    this.setData({
      selectedLabels: [...this.data.selectedLabels, label],
    });
  },
  delLabelByName(label: string) {
    this.setData({
      selectedLabels: this.data.selectedLabels.filter((l) => l !== label),
    });
  },
  onClickLabelPool(e: any) {
    const curLabel = e.currentTarget.dataset.id;
    if (this.data.selectedLabels.includes(curLabel)) {
      this.delLabelByName(curLabel);
    } else {
      this.addLabel(curLabel);
    }
  },
  onClickSelectedLabel(e: any) {
    this.delLabelByName(e.currentTarget.dataset.id);
  },
  onTagInputChange(e: any) {
    this.setData({
      customLabel: e.detail,
    });
  },
  onAddCustomLabel() {
    const curLabel = this.data.customLabel;
    if (curLabel === "") {
      Toast({
        message: "标签不能为空哦~",
        duration: 1000,
      });
      return;
    }
    if (this.data.selectedLabels.includes(curLabel)) {
      Toast({
        message: "已存在该标签",
        duration: 1000,
      });
    } else {
      this.addLabel(curLabel);
    }
    this.setData({
      customLabel: "",
    });
    this.onPopupClose();
  },
  showPopupPannel() {
    this.setData({ showPopup: true });
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
  onTabClick(e: any) {
    const index = e.detail.index;
    this.setData({ curTabIndex: index });
  },
});
