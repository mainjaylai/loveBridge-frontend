import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { uploadUserImage } from "../../api/user";
import { createPost } from "../../api/post";
import { LOCATION_KEY, LOCATION_REFERER } from "../../utils/const";
import { DEFAULT_TOPIC } from "../../const/posts";
const chooseLocation = requirePlugin("chooseLocation");

Page({
  data: {
    fileList: [] as Array<any>,
    content: "",
    tags: [] as string[],
    location: {} as TxLocation,
    showPopup: false,
    customTag: "",
    DEFAULT_TOPIC: DEFAULT_TOPIC,
  },
  onShow(){
    const app = getApp();
    if (
      !app.globalData.userInfo.nickname ||
      !app.globalData.userInfo.avatar
    ) {
      Toast({
        message: "请先完善基本信息",
        duration: 1000,
        type: "info",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }

    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (!location) {
      return;
    }
    this.setData({ location });
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

  // 输入
  onInputChange(e: any) {
    this.setData({
      content: e.detail,
    });
  },

  // 话题操作
  showPopupPannel() {
    this.setData({
      showPopup: true,
    });
  },
  onTagInputChange(e: any) {
    this.setData({
      customTag: e.detail,
    });
  },
  publishCustomTag() {
    this.addTopic(this.data.customTag);
    this.setData({
      showPopup: false,
      customTag: "",
    });
  },
  chooseTag(e: any) {
    const tag = e.currentTarget.dataset.id;
    this.onPopupClose();
    this.addTopic(tag);
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
  addTopic(t: string) {
    this.setData({
      tags: [...this.data.tags, t],
    });
  },
  // switchTopic(t: string, index: number) {
  //   this.setData({
  //     tags: this.data.tags.map((item, i) => (i === index ? t : item)),
  //   });
  // },
  delTopic(e: any) {
    const index = e.currentTarget.dataset.id;
    this.setData({
      tags: this.data.tags.filter((_, i) => i !== index),
    });
  },

  // 地点操作
  onSelectLocation() {
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${LOCATION_KEY}&referer=${LOCATION_REFERER}`,
    });
  },
  delLocation() {
    this.setData({ location: {} as TxLocation });
  },

  // 传图
  uploadImgs() {
    const uploadPromises = this.data.fileList.map((file) =>
      uploadUserImage(file.url)
    );
    // 使用 Promise.all 等待所有任务完成
    return Promise.all(uploadPromises);
  },

  // 发布
  publish() {
    wx.showLoading({
      title: "发布中...",
    });
    this.uploadImgs()
      .then((res) => {
        const imgs = res.map((r: any) => JSON.parse(r.data).data[0]);
        const data = {
          content: this.data.content,
          images: JSON.stringify(imgs),
          tags: this.data.tags,
        } as any;
        if (this.data.location.name) {
          data.location = this.data.location;
        }

        createPost(data)
          .then((res) => {
            wx.hideLoading();
            Toast({
              message: "发布成功",
              type: "success",
              duration: 2000,
              onClose: () => {
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 2];
                prevPage.setData({ needRefresh: true });
                wx.navigateBack();
              },
            });
          })
          .catch((err) => {
            wx.hideLoading();
          });
      })
      .catch((err) => {
        wx.hideLoading();
      });
  },
});
