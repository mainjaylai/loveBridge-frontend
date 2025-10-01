import { updateUserInfo } from "../../api/user";
import { DEFAULT_USER_INFO } from "../../const/user";

Page({
  data: {
    userInfo: DEFAULT_USER_INFO,
    genderShow: false,
    universityShow: false,
    birthdayShow: false,
    professionShow: false,
  },

  initVisibility(visibilitySettings: string) {
    this.setData({
      genderShow: !visibilitySettings.includes("gender"),
      universityShow: !visibilitySettings.includes("university"),
      birthdayShow: !visibilitySettings.includes("birthday"),
      professionShow: !visibilitySettings.includes("profession"),
    });
  },

  updateVisibility() {
    let visibilityParts = [];
    if (!this.data.genderShow) visibilityParts.push("gender");
    if (!this.data.universityShow) visibilityParts.push("university");
    if (!this.data.birthdayShow) visibilityParts.push("birthday");
    if (!this.data.professionShow) visibilityParts.push("profession");

    const newVisibility = visibilityParts.join(";");

    const newUserInfo = {
      ...this.data.userInfo,
      visibilitySettings: newVisibility,
    };
    updateUserInfo(newUserInfo).then((res: any) => {
      const app = getApp<IAppOption>();
      app.globalData.userInfo = newUserInfo;
      this.initVisibility(newVisibility);
    });
  },

  onGenderShowChange(e: any) {
    this.setData({ genderShow: e.detail });
    this.updateVisibility();
  },
  onUniversityShowChange(e: any) {
    this.setData({ universityShow: e.detail });
    this.updateVisibility();
  },
  onBirthdayShowChange(e: any) {
    this.setData({ birthdayShow: e.detail });
    this.updateVisibility();
  },
  onProfessionShowChange(e: any) {
    this.setData({ professionShow: e.detail });
    this.updateVisibility();
  },

  onLoad() {
    const app = getApp<IAppOption>();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
    this.initVisibility(app.globalData.userInfo.visibilitySettings || "");
  },
});
