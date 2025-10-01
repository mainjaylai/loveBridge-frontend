import { updateUserInfo, uploadUserImage } from "../../api/user";
import {
  DEFAULT_USER_AVATAR,
  GRADUATION_YEAR,
  EDUCATION,
  GENDER_FEMALE,
  GENDER_MALE,
  UNIVERSITY,
  USER_BIRTHDAY_PLACEHOLDER,
  MBTI,
  STAR_SIGN,
  PROFESSION
} from "../../const/user";
import { TAGS, HEIGHT, WEIGHT, BIRTHYEAR_CP, HEIGHT_CP, UNIVERSITY_CP, EDUCATION_CP, STUDY_STATUS_CP } from '../../const/cpOthers'
import {
  validatePhoneNumber,
  formatTime11,
} from "../../utils/util";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { areaList } from '@vant/area-data';

const app = getApp<IAppOption>();
const DEFAULT_CP_INFO: CPInfo = {
  // 基本信息
  avatar: "",
  realName: "",
  gender: 0,
  height: "",
  weight: "",
  birthday: "",
  phone: "",
  wechat: "",
  university: "",
  education: "",
  graduationYear: "",
  nickname: "",
  tags: [],

  // 个人特征
  starSign: "",
  mbti: "",
  profession: "",
  hometown: "",
  liveIn: "",

  // CP 相关
  birthYearCP: "",
  heightCP: "",
  universityCP: "",
  educationCP: "",
  studyStatusCP: "",
};

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

Page({
  data: {
    edited: false, // 是否修改了本地userInfo
    showPopup: false,
    showTagsPopup: false,
    cpInfo: DEFAULT_CP_INFO,
    userGender: "", // 性别展示和picker的数据绑定的值：男/女
    userHomeTownLabel: "",
    userLiveInLabel: "",
    userBirthYearCPLabel: "",
    userHeightCPLabel: "",
    userBirthday: USER_BIRTHDAY_PLACEHOLDER,  // 生日，picker数据绑定
    userBirthdayLabel: "",  // 生日，展示
    birthdayPickerMinDate: new Date(1990, 0, 1).getTime(),  
    birthdayPickerMaxDate: new Date(2007, 11, 31).getTime(),
    userTags: "",
    pickerColumn: {
      gender: [
        { value: GENDER_MALE, label: "男" },
        { value: GENDER_FEMALE, label: "女" },
      ],
      height: HEIGHT,
      weight: WEIGHT,
      education: EDUCATION,
      university: FLATTENED_UNIVERSITIES,
      starSign: STAR_SIGN,
      mbti: MBTI,
      graduationYear: GRADUATION_YEAR,
      profession: PROFESSION,
      birthYearCP: BIRTHYEAR_CP,
      heightCP: HEIGHT_CP,
      universityCP: UNIVERSITY_CP,
      educationCP: EDUCATION_CP,
      studyStatusCP: STUDY_STATUS_CP,
    },
    curProperty: "",
    currentPickerOptions: [] as string[],
    searchKeyword: "",
    filteredUniversities: [] as Array<{ value: string; label: string }>,
    areaList: areaList,
    TAGS: TAGS,
    DEFAULT_USER_AVATAR: DEFAULT_USER_AVATAR
  },

  onLoad() {
    // TODO 是否已报名
    const res = false;
    if (res) {
      this.setData({
        // cpInfo: ,
        // userGender:
        //   userInfo.gender === GENDER_MALE
        //     ? "男"
        //     : userInfo.gender === GENDER_FEMALE
        //     ? "女"
        //     : "",
        // userBirthday: userInfo.birthday
        //   ? parseInt(userInfo.birthday)
        //   : USER_BIRTHDAY_PLACEHOLDER,
        // userBirthdayLabel: userInfo.birthday
        //   ? formatTime11(parseInt(userInfo.birthday))
        //   : "",
      });
    } else {
      this.setData({
        userTags: this.data.cpInfo.tags.join(';')
      })
    }
  },

  editLocalUserInfo(key: string, value: any) {
    this.setData({
      [`cpInfo.${key}`]: value,
      edited: true,
    });
  },

  // popup
  showPopupPannel(e: any) {
    const that = this;
    const curProperty = e.currentTarget.dataset.id as
      | keyof typeof that.data.pickerColumn
      | "birthday"
      | "hometown"
      | "liveIn";

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
    } else if (curProperty === "hometown" || curProperty === "liveIn") {
      this.setData({
        showPopup: true,
        curProperty: curProperty,
      });
    }  else if (curProperty === "birthYearCP" || curProperty === "heightCP") {
      this.setData({
        showPopup: true,
        curProperty: curProperty,
        currentPickerOptions: that.data.pickerColumn[curProperty] as any[]
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

  showTagsPopupPannel() {
    this.setData({ showTagsPopup: true });
  },
  onPopupClose() {
    this.setData({ showPopup: false });
  },
  onTagsPopupClose() {
    this.setData({ showTagsPopup: false });
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
    } else if (curProperty === "birthYearCP" || curProperty === "heightCP") {
      if (curProperty === 'birthYearCP') {
        this.setData({
          userBirthYearCPLabel: e.detail.value.join('-'),
        });
      } else {
        this.setData({
          userHeightCPLabel: e.detail.value.join('-'),
        });
      }
      this.editLocalUserInfo(curProperty, e.detail.value);
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

  // hometown or liveIn
  onAreaConfirm(e: any) {
    const res = e.detail.values as any[];
    const key = this.data.curProperty;
    if (key === 'hometown') {
      this.setData({
        userHomeTownLabel: res.map(item => item.name).join(' '),
      });
    } else {
      this.setData({
        userLiveInLabel: res.map(item => item.name).join(' '),
      });
    }
    this.editLocalUserInfo(key, res[2].code);
    this.onPopupClose();
  },

  onInputChange(e: any) {
    const curProperty = e.currentTarget.dataset.id;
    this.editLocalUserInfo(
      curProperty,
      e.detail.value !== undefined ? e.detail.value : e.detail
    );
  },

  onClickLabelPool(e: any) {
    const curLabel = e.currentTarget.dataset.id;
    let newTags;
    if (this.data.cpInfo.tags.includes(curLabel)) {
      newTags = this.data.cpInfo.tags.filter((l) => l !== curLabel)
    } else {
      newTags = [...this.data.cpInfo.tags, curLabel]
    }
    this.setData({
      userTags: newTags.join(';')
    })
    this.editLocalUserInfo(
      'tags',
      newTags
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
    if (!this.data.cpInfo.avatar) {
      errMessage = "请上传【头像】";
    } else if (!this.data.cpInfo.realName) {
      errMessage = "请输入【姓名】";
    } else if (!this.data.cpInfo.gender) {
      errMessage = "请选择【性别】";
    } else if (!this.data.cpInfo.height) {
      errMessage = "请输入【身高】";
    } else if (!this.data.cpInfo.weight) {
      errMessage = "请输入【体重】";
    } else if (!this.data.cpInfo.birthday) {
      errMessage = "请填写【生日】";
    } else if (!validatePhoneNumber(this.data.cpInfo.phone)) {
      errMessage = "【手机号码】格式错误";
    } else if (!this.data.cpInfo.wechat) {
      errMessage = "请填写【微信号】";
    } else if (!this.data.cpInfo.university) {
      errMessage = "请选择【学校】";
    } else if (!this.data.cpInfo.education) {
      errMessage = "请选择【学历】";
    } else if (!this.data.cpInfo.graduationYear) {
      errMessage = "请选择【毕业年份】";
    } else if (!this.data.cpInfo.nickname) {
      errMessage = "请填写【昵称】";
    } else if (this.data.cpInfo.tags.length === 0) {
      errMessage = "请选择至少一个【兴趣爱好】";
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
  },
});
