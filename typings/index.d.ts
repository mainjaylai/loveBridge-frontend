/// <reference path="./types/user.d.ts" />
/// <reference path="./types/activity.d.ts" />
/// <reference path="./types/payment.d.ts" />

interface IAppOption {
  globalData: {
    newUserStatus: number,
    userInfo: User;
  };
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
}
