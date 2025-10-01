import { updateUserInfo, uploadUserImage } from "../../api/user";
import {
  DEFAULT_USER_INFO,
  DEFAULT_USER_AVATAR,
  EDUCATION,
  GENDER_FEMALE,
  GENDER_MALE,
  UNIVERSITY,
  USER_BIRTHDAY_PLACEHOLDER,
  MBTI,
  STAR_SIGN,
} from "../../const/user";
import {
  validatePhoneNumber,
  validateIdCard,
  validatePassport,
  checkCredentialType,
  formatTime4,
  formatTime11,
} from "../../utils/util";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
const app = getApp<IAppOption>();

// 将省份+大学数组转换为统一的value/label格式
const flattenUniversities = () => {
  const result: Array<{ value: string; label: string }> = [];
  UNIVERSITY.forEach((province) => {
    province.universities.forEach((uniName) => {
      result.push({
        value: uniName,
        label: uniName,
      });
    });
  });
  return result;
};

// 扁平化大学列表，用于搜索和选择
const FLATTENED_UNIVERSITIES = flattenUniversities();

// 证件类型常量
const CREDENTIAL_TYPE_IDCARD = "idcard";
const CREDENTIAL_TYPE_PASSPORT = "passport";

Page({
  data: {
    edited: false, // 是否修改了本地userInfo
    showPopup: false,
    showPopupCenter: false,
    userInfo: DEFAULT_USER_INFO,
    userGender: "", // 性别展示和picker的数据绑定的值：男/女
    userBirthday: USER_BIRTHDAY_PLACEHOLDER, // 生日，picker数据绑定
    userBirthdayLabel: "", // 生日，展示
    birthdayPickerMinDate: new Date(1985, 0, 1).getTime(),
    birthdayPickerMaxDate: new Date(2010, 12, 31).getTime(),
    selectedCredentialType: CREDENTIAL_TYPE_IDCARD, // 临时存储当前选择的证件类型，不会存储到数据库
    userCredentialType: "中国居民身份证",
    pickerColumn: {
      gender: [
        { value: GENDER_MALE, label: "男" },
        { value: GENDER_FEMALE, label: "女" },
      ],
      education: EDUCATION,
      university: FLATTENED_UNIVERSITIES,
      credentialType: [
        { value: CREDENTIAL_TYPE_IDCARD, label: "中国居民身份证" },
        { value: CREDENTIAL_TYPE_PASSPORT, label: "护照" },
      ],
      starSign: STAR_SIGN,
      mbti: MBTI,
    },
    curProperty: "",
    currentPickerOptions: [] as string[],
    searchKeyword: "",
    filteredUniversities: [] as Array<{ value: string; label: string }>,
    DEFAULT_USER_AVATAR: DEFAULT_USER_AVATAR,
    needRefresh: false
  },

  onLoad() {
    this.initData();
  },
  onShow() {
    if (this.data.needRefresh) {
      this.setData({ needRefresh: false });
      this.initData();
    }
  },

  initData() {
    const app = getApp<IAppOption>();
    const userInfo = JSON.parse(JSON.stringify(app.globalData.userInfo));

    // 根据idCard判断证件类型
    const credentialType = userInfo.idCard
      ? checkCredentialType(userInfo.idCard)
      : CREDENTIAL_TYPE_IDCARD;

    this.setData({
      userInfo: userInfo,
      userGender:
        userInfo.gender === GENDER_MALE
          ? "男"
          : userInfo.gender === GENDER_FEMALE
          ? "女"
          : "",
      selectedCredentialType: credentialType,
      userCredentialType:
        credentialType === CREDENTIAL_TYPE_PASSPORT ? "护照" : "中国居民身份证",
      userBirthday: userInfo.birthday
        ? parseInt(userInfo.birthday)
        : USER_BIRTHDAY_PLACEHOLDER,
      userBirthdayLabel: userInfo.birthday
        ? formatTime11(parseInt(userInfo.birthday))
        : "",
    });
  },

  editLocalUserInfo(key: string, value: any) {
    this.setData({
      [`userInfo.${key}`]: value,
      edited: true,
    });
  },

  // popup
  showPopupPannel(e: any) {
    const that = this;
    const curProperty = e.currentTarget.dataset.id as
      | keyof typeof that.data.pickerColumn
      | "birthday";

    if (curProperty === "university") {
      // 大学选择使用搜索方式
      this.setData({
        showPopup: true,
        curProperty: curProperty,
        searchKeyword: "",
        filteredUniversities: FLATTENED_UNIVERSITIES,
      });

      // 设置页面不自动调整位置
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      });

      // 确保焦点不自动聚焦到输入框
      wx.hideKeyboard();
    } else if (curProperty === "birthday") {
      this.setData({
        showPopup: true,
        curProperty: curProperty,
      });
    } else {
      const options = (that.data.pickerColumn[curProperty] as any[]).map(
        (item: { value: any; label: string }) => item.label
      );
      this.setData({
        showPopup: true,
        curProperty: curProperty,
        currentPickerOptions: options,
      });
    }
  },

  // 搜索大学
  onSearchChange(e: any) {
    const keyword = e.detail.trim().toLowerCase();
    this.setData({
      searchKeyword: e.detail,
      filteredUniversities: keyword
        ? FLATTENED_UNIVERSITIES.filter(
            (uni) =>
              uni.label.toLowerCase().indexOf(keyword) > -1 ||
              uni.value === "其他"
          )
        : FLATTENED_UNIVERSITIES,
    });

    // 确保列表保持在视图中固定位置
    wx.nextTick(() => {
      // 不执行任何滚动操作，保持当前位置
    });
  },

  // 搜索确认
  onSearchConfirm() {
    // 可选实现，如果需要在搜索确认时执行特定操作
  },

  // 搜索框失焦处理
  onSearchBlur() {
    // 阻止键盘收起导致布局变化
    wx.hideKeyboard();
  },

  // 处理键盘高度变化
  onKeyboardHeightChange(e: any) {
    // 不做任何处理，保持当前布局
  },

  // 选择大学
  onUniversitySelect(e: any) {
    const { value, label } = e.currentTarget.dataset;
    this.onPopupClose();
    this.editLocalUserInfo("university", value);
  },

  onPopupClose() {
    this.setData({ showPopup: false });
  },

  onPopupCenterClose() {
    this.setData({ showPopupCenter: false });
    Toast({
      type: "success",
      message: "保存成功",
      duration: 1000,
    });
  },

  // form
  onPickerConfirm(e: any) {
    const that = this;
    const curProperty = this.data.curProperty;
    if (curProperty === "gender") {
      this.setData({
        userGender: this.data.pickerColumn[curProperty][e.detail.index].label,
      });
      this.editLocalUserInfo(
        "gender",
        this.data.pickerColumn[curProperty][e.detail.index].value
      );
    } else if (curProperty === "credentialType") {
      const type = this.data.pickerColumn[curProperty][e.detail.index].value;
      this.setData({
        selectedCredentialType: type,
        userCredentialType:
          this.data.pickerColumn[curProperty][e.detail.index].label,
        // 当切换证件类型时，清空idCard字段
      });
      this.editLocalUserInfo("idCard", "");
    } else {
      this.editLocalUserInfo(
        curProperty,
        this.data.pickerColumn[
          curProperty as keyof typeof that.data.pickerColumn
        ][e.detail.index].value
      );
    }
    this.onPopupClose();
  },

  // birthday
  onBirthdayConfirm(e: any) {
    // 处理时间戳
    let timestamp = parseInt(e.detail);

    this.setData({
      userBirthday: timestamp,
      userBirthdayLabel: formatTime11(timestamp),
    });
    this.editLocalUserInfo("birthday", timestamp.toString());
    this.onPopupClose();
  },

  onInputChange(e: any) {
    const curProperty = e.currentTarget.dataset.id;
    this.editLocalUserInfo(
      curProperty,
      e.detail.value !== undefined ? e.detail.value : e.detail
    );
  },

  onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;

    // 检查文件大小
    wx.getFileInfo({
      filePath: avatarUrl,
      success: (res) => {
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (res.size > maxSize) {
          Toast({
            type: "fail",
            message: "图片大小不能超过15MB",
            duration: 2000,
          });
          return;
        }

        // 上传图片
        uploadUserImage(avatarUrl).then((res: any) => {
          try {
            const data = JSON.parse(res.data);
            this.editLocalUserInfo("avatar", data.data[0]);
          } catch (error) {
            console.error("Failed to parse response data:", error);
            Toast({
              type: "fail",
              message: "上传头像失败，请重试",
              duration: 1000,
            });
          }
        });
      },
      fail: () => {
        // 如果获取文件信息失败，仍然尝试上传
        uploadUserImage(avatarUrl).then((res: any) => {
          try {
            const data = JSON.parse(res.data);
            this.editLocalUserInfo("avatar", data.data[0]);
          } catch (error) {
            console.error("Failed to parse response data:", error);
            Toast({
              type: "fail",
              message: "上传头像失败，请重试",
              duration: 1000,
            });
          }
        });
      },
    });
  },

  check() {
    let errMessage = "";

    // 实名信息，只有填写了才会校验格式，可以不填
    if (
      this.data.userInfo.phone &&
      !validatePhoneNumber(this.data.userInfo.phone)
    ) {
      errMessage = "【手机号码】格式错误";
    } else if (
      this.data.selectedCredentialType === CREDENTIAL_TYPE_IDCARD &&
      this.data.userInfo.idCard &&
      !validateIdCard(this.data.userInfo.idCard)
    ) {
      errMessage = "【身份证号码】格式错误";
    } else if (
      this.data.selectedCredentialType === CREDENTIAL_TYPE_PASSPORT &&
      this.data.userInfo.idCard &&
      !validatePassport(this.data.userInfo.idCard)
    ) {
      errMessage = "【护照号码】格式错误";
    }
    // if (!this.data.userInfo.realName) {
    //   errMessage = "【真实姓名】不能为空";
    // } else

    // 必填信息
    else if (!this.data.userInfo.education) {
      errMessage = "请选择【学历】";
    } else if (!this.data.userInfo.university) {
      errMessage = "请选择【学校】";
    } else if (!this.data.userInfo.gender) {
      errMessage = "请选择【性别】";
    } else if (!this.data.userInfo.nickname) {
      errMessage = "请填写【昵称】";
    } else if (!this.data.userInfo.avatar) {
      errMessage = "请选择【头像】";
    } else if (!this.data.userInfo.birthday) {
      errMessage = "请填写【生日】";
    }
    // 返回
    if (errMessage !== "") {
      Toast({
        type: "fail",
        message: errMessage,
        duration: 1000,
      });
      return false;
    }
    return true;
  },

  onSave() {
    if (!this.check()) {
      return;
    }

    // 检查主理人是否尝试修改学校信息;
    if (app.globalData.userInfo.id === app.globalData.userInfo.managerId) {
      // 如果是主理人，且尝试修改学校信息，且初始university不为空
      if (
        app.globalData.userInfo.university !== this.data.userInfo.university &&
        app.globalData.userInfo.university !== ""
      ) {
        Toast({
          type: "fail",
          message: "主理人不能修改学校信息",
          duration: 1000,
        });
        this.setData({
          "userInfo.university": app.globalData.userInfo.university,
        });
        return;
      }
    }

    updateUserInfo(this.data.userInfo).then((res: any) => {
      const user = res.data.data;
      this.setData({ edited: false });
      if (
        user.isFirstCompleteInformation &&
        !app.globalData.userInfo.isFirstCompleteInformation
      ) {
        this.setData({ showPopupCenter: true });
        app.globalData.userInfo = user;
      } else {
        app.globalData.userInfo = user;
        Toast({
          type: "success",
          message: "保存成功",
          duration: 1000,
        });
      }
    });
  },

  editLabel() {
    if (this.data.edited) {
      Toast({
        message: "您有修改尚未保存，请点击保存后再编辑标签",
        duration: 2000,
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/label/index`,
    });
  },

  onPreview() {
    if (this.data.edited) {
      Toast({
        message: "您有修改尚未保存，请点击保存后再预览",
        duration: 2000,
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/publicProfile/index`,
    });
  },

  navigateToIndex() {
    wx.reLaunch({
      url: `/pages/index/index`,
    });
  },
});
