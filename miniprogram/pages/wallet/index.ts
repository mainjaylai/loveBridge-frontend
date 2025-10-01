import { DEFAULT_USER_INFO } from "../../const/user";
import { getInviteImage, getInviteInfo } from "../../api/user";
import { cancelWithdraw, queryWithdraw, withdraw } from "../../api/pay";
Page({
  data: {
    showPopup: false,
    userInfo: DEFAULT_USER_INFO,
    managerCounts: 0,
    inviteUserCounts: 0,
    money: "",
    totalProfit: 0,
    // 提现相关数据
    showWithdrawDialog: false,
    withdrawAmount: "",
    withdrawAmountError: "",
    description: `A(主理人)-B(直接发展用户)-C(间接发展用户)-D
    B通过小程序邀请C注册，则C为间接发展用户

    1.主理人会获取B类用户实际支付费用的10%
    2.主理人会获取C类用户实际支付费用的5%
    3.C类用户发展的D类用户主理人不进行分成

    主理人会获得B类和C类用户的永久分成`,
  },

  onShow() {
    const app = getApp<IAppOption>();
    this.setData({
      userInfo: app.globalData.userInfo,
      money: Number(app.globalData.userInfo.money / 100).toFixed(2),
      totalProfit: Number(app.globalData.userInfo.totalProfit / 100),
    });
    getInviteInfo().then((res: any) => {
      this.setData({
        managerCounts: res.data.data.managerCounts,
        inviteUserCounts: res.data.data.inviteUserCounts,
      });
    });
  },

  navigateToAccountDetail() {
    wx.navigateTo({
      url: '/pages/moneyRecord/index'
    });
  },

  // 打开提现对话框
  navigateToWithdrawal() {
    this.setData({
      showWithdrawDialog: true,
      withdrawAmount: "",
      withdrawAmountError: "",
    });
  },

  // 处理提现金额输入
  onWithdrawAmountInput(e: WechatMiniprogram.Input) {
    const amount = e.detail.value;
    let error = "";

    if (amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        error = "请输入有效的金额";
      } else if (numAmount < 1) {
        error = "提现金额不能小于1元";
      } else if (numAmount > 100) {
        error = "提现金额不能超过100元";
      }
    }

    this.setData({
      withdrawAmount: amount,
      withdrawAmountError: error,
    });
  },

  // 关闭提现对话框
  onWithdrawDialogClose() {
    this.setData({
      showWithdrawDialog: false,
    });
  },

  // 确认提现
  onWithdrawConfirm() {
    const { withdrawAmount, withdrawAmountError } = this.data;

    if (!withdrawAmount) {
      this.setData({
        withdrawAmountError: "请输入提现金额",
      });
      return;
    }

    if (withdrawAmountError) {
      return;
    }

    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 100) {
      this.setData({
        withdrawAmountError: "提现金额必须在1-100元之间",
      });
      return;
    }

    // 转换为分为单位
    const amountInCents = Math.floor(numAmount * 100).toString();

    // 关闭对话框
    this.setData({
      showWithdrawDialog: false,
    });

    // 调用提现API
    withdraw(amountInCents)
      .then((res: any) => {
        const { data } = res.data;

        if (wx.canIUse("requestMerchantTransfer")) {
          (wx as any).requestMerchantTransfer({
            mchId: data.mch_id,
            appId: wx.getAccountInfoSync().miniProgram.appId,
            package: data.package_info,
            success: (r: any) => {
              // res.err_msg将在页面展示成功后返回应用时返回ok，并不代表付款成功
              const queryTimer = setInterval(() => {
                queryWithdraw(data.transfer_bill_no)
                  .then((res: any) => {
                    // 更新用户余额（提现金额已从后端直接扣除）
                    const app = getApp<IAppOption>();
                    // 减去提现金额
                    app.globalData.userInfo.money -= parseInt(amountInCents);
                    this.setData({
                      userInfo: app.globalData.userInfo,
                      money: Number(
                        app.globalData.userInfo.money / 100
                      ).toFixed(2),
                    });

                    clearInterval(queryTimer);
                  })
                  .catch(() => {});
              }, 1000);
            },
            fail: (r: any) => {
              cancelWithdraw(data.out_bill_no);
            },
          });
        } else {
          wx.showModal({
            content: "你的微信版本过低，请更新至最新版本。",
            showCancel: false,
          });
        }
      })
      .catch((error) => {
        console.error("提现失败", error);
      });
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: "邀请好友注册赚分成", // 分享标题
      path: `/pages/index/index?inviteCode=${this.data.userInfo.id}`, // 分享路径，默认是当前页面路径
      imageUrl: "", // 分享图片（可选）
    };
  },

  onDownloadInviteCodeImg() {
    this.onPopupClose();
    const that = this;
    wx.showLoading({
      title: "生成中",
    });
    getInviteImage()
      .then((res: any) => {
        const fs = wx.getFileSystemManager();
        const filePath = wx.env.USER_DATA_PATH + "/temp_image.png"; // 生成临时文件路径
        fs.writeFile({
          filePath,
          data: res.data.data,
          encoding: "base64",
          success: () => {
            wx.hideLoading();
            wx.showShareImageMenu({
              path: filePath,
              success: () => {},
              fail: (res) => {
                if (res.errMsg.includes("fail auth deny")) {
                  wx.showModal({
                    title: "提示",
                    content: "需要您授权保存相册",
                    showCancel: false,
                    success: (res) => {
                      wx.openSetting({
                        success(settingdata) {
                          that.onPopupClose();
                          if (
                            settingdata.authSetting["scope.writePhotosAlbum"]
                          ) {
                            wx.showModal({
                              title: "提示",
                              content: "获取权限成功,请重试",
                              showCancel: false,
                            });
                          } else {
                            wx.showModal({
                              title: "提示",
                              content: "获取权限失败，无法保存到相册",
                              showCancel: false,
                            });
                          }
                        },
                      });
                    },
                  });
                }
              },
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showModal({
              title: "错误",
              content: "图片加载失败，请重试",
              showCancel: false,
            });
            console.error("图片加载失败", err);
          },
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showModal({
          title: "错误",
          content: "获取邀请图片失败，请重试",
          showCancel: false,
        });
        console.error("获取邀请图片失败", error);
      });
  },

  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.userInfo.id.toString(),
    });
  },

  showPopupPannel() {
    this.setData({ showPopup: true });
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
});
