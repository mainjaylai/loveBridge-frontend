import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";
import { getSingleUser, getSingleUserContactInfomation } from "../../api/matchmaker";
import { DEFAULT_USER_AVATAR, DEFAULT_USER_NICKNAME } from "../../const/user";

Page({
  data: {
    userId: "0",
    navBarHeight: 0,
    statusBarHeight: 0,
    navBg: 'transparent',
    DEFAULT_USER_AVATAR: DEFAULT_USER_AVATAR,
    DEFAULT_USER_NICKNAME: DEFAULT_USER_NICKNAME,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL, 
    loading: false,
    userInfo: {} as SingleUserInfo,
    myUser: {} as User,
  },

  onLoad(options: { userId?: string }) {
    const that = this;
    // 获取状态栏高度
    wx.getSystemInfo({
      success(res) {
        const statusBarHeight = res.statusBarHeight;
        const navBarHeight = statusBarHeight + 44; // 44是导航栏的标准高度
        that.setData({ statusBarHeight, navBarHeight });
      }
    });

    const app = getApp<IAppOption>();
    this.setData({
      myUser: app.globalData.userInfo,
    });

    if (options.userId) {
      this.setData({ userId:options.userId });
      // Using mock data now, but can still fetch if needed
      this.fetchUserInfo(options.userId);
    } 
  },

  onPageScroll(e) {
    // 监听页面滚动，当滚动距离超过200时，导航栏背景色变为白色
    if (e.scrollTop > 200 && this.data.navBg === 'transparent') {
      this.setData({
        navBg: '#FFFFFF'
      });
    } else if (e.scrollTop <= 200 && this.data.navBg === '#FFFFFF') {
      this.setData({
        navBg: 'transparent'
      });
    }
  },

  // 添加分享功能
  onShareAppMessage() {
    const { userInfo } = this.data;
    return {
      title: userInfo.nickName ? `${userInfo.nickName}的互选池资料` : '互选池用户详情',
      path: `/pages/cpUserDetail/index?userId=${this.data.userId}`,
      imageUrl: userInfo?.photos?.[0] || this.data.DEFAULT_USER_AVATAR
    };
  },

  // 返回上一页
  navBack() {
    wx.navigateBack();
  },

  async fetchUserInfo(userId: string) {
    try {
      wx.showLoading({
        title: '加载中',
      });
      
      const response:any = await getSingleUser(userId);
      
      let data = response.data.data;

      this.setData({
        userInfo: data,
      });
      
      wx.hideLoading();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      wx.hideLoading();
    }
  },

  // 获取联系方式
  getContactInfo() {
    wx.showModal({
      title: '提示',
      content: '确认获取该用户联系方式吗？',
      success: (res) => {
        if (res.confirm) {
          this.requestContactInfo();
        }
      }
    });
  },

  // 请求联系方式API
  async requestContactInfo() {
    try {
      wx.showLoading({
        title: '请求中',
      });
      
      const response:any = await getSingleUserContactInfomation(this.data.userId);
      let data = response.data.data;
      console.log(data);
      wx.setClipboardData({
        data: data,
        success: () => {
          wx.showModal({
            title: '操作成功',
            content: '微信号：' + data + '，已复制到剪贴板\n\n你可以通过以下方式添加好友：\n1. 打开微信 -> 点击"添加朋友"\n2. 粘贴微信号搜索并发送申请',
            showCancel: false,
            confirmText: '知道了'
          });
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('获取联系方式失败:', error);
      wx.hideLoading();
    }
  },

  // 预览图片
  previewImage(e: WechatMiniprogram.TouchEvent) {
    const currentUrl = e.currentTarget.dataset.url;
    const urls = this.data.userInfo.photos || [];
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
  },
});