import { getOwnSingleInformation, saveSingleInformation } from '../../api/matchmaker';
import { uploadUserImage } from '../../api/user';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const SEXUAL_ORIENTATION_OPTIONS = ['异性恋', '同性恋', '双性恋', '无性恋'];
const RELATIONSHIP_VIEW_OPTIONS = ['打算结婚生子', '打算丁克', '不婚主义者'];
const MARITAL_STATUS_OPTIONS = ['未婚未育', '离异无孩', '离异有孩', '未婚有孩'];
const EDUCATION_OPTIONS = ['本科', '硕士', '博士'];
const STATUS_OPTIONS = ['在读', '已工作', '其他'];
const JOB_TYPE_OPTIONS = ['私企', '国央企', '事业单位', '外企', '公务员/军官等公职人员', '个人创业', '其他'];

Page({
  data: {
    formData: {
      id: '',
      realName: '',
      phone: '',
      wechat: '',
      gender: 0,
      genderLabel: '',
      hometown: '',
      preferredCity: '',
      orientation: '',
      orientationLabel: '',
      relationshipView: '',
      relationshipViewLabel: '',
      maritalStatus: '',
      maritalStatusLabel: '',
      birthday: '',
      birthdayLabel: '',
      height: '',
      weight: '',
      education: '',
      educationLabel: '',
      university: '',
      currentStatus: '',
      currentStatusLabel: '',
      major: '',
      majorLabel: '',
      jobType: '',
      jobTypeLabel: '',
      otherJobType: false,
      jobTitle: '',
      annualIncome: '',
      otherStatusDesc: '',
      aboutMe: '',
      partnerRequirements: '',
      isVerified: false,
      photos: [] as string[],
    },
    fileList: [] as Array<{ url: string }>,
    showPickerPopup: false,
    pickerTitle: '',
    pickerColumns: [] as string[],
    pickerValueKey: 'label',
    pickerField: '',
  },

  async onLoad() {
    const app = getApp<IAppOption>();
    const userInfo = app.globalData.userInfo;

    // 判断用户是否完善了真实姓名、性别、手机号
    if (!userInfo.realName || !userInfo.gender || !userInfo.phone) {
      Toast({
        message: '请先完善真实姓名、性别、手机号',
        duration: 2000,
        onClose: () => {
          wx.navigateTo({
            url: '/pages/edit/index',
          });
        },
      });
      return;
    }

    wx.showLoading({ title: '加载中...' });
    try {
      const res: any = await getOwnSingleInformation();
      if (res.data && res.data.data) {
        this.initForm(res.data.data);
      } else {
        // 新用户无数据，使用全局用户信息填充
        this.setData({
          'formData.realName': userInfo.realName,
          'formData.phone': userInfo.phone,
        });
      }
    } catch (e) {
      // 新用户无数据，使用全局用户信息填充
      this.setData({
        'formData.realName': userInfo.realName,
        'formData.phone': userInfo.phone,
      });
    }
    wx.hideLoading();
  },

  initForm(data: any) {
    if (!data) {
      return;
    }

    const formData = { ...this.data.formData, ...data } as { [key: string]: any };

    // 处理label
    formData.orientationLabel = data.orientation || '';
    formData.relationshipViewLabel = data.relationshipView || '';
    formData.maritalStatusLabel = data.maritalStatus || '';
    formData.educationLabel = data.education || '';
    formData.currentStatusLabel = data.currentStatus || '';
    formData.majorLabel = data.major || '';
    formData.jobTypeLabel = data.jobType || '';
    formData.birthdayLabel = data.birthday ? `${data.birthday}` : '';
    formData.otherJobType = data.jobType === '其他';

    // 处理其他字段
    formData.weight = data.weight ? String(data.weight) : '';
    formData.height = data.height ? String(data.height) : '';
    formData.birthday = data.birthday ? String(data.birthday) : '';
    formData.isVerified = String(data.isVerified);

    const fileList = data.photos?.map((p: string) => ({ url: p, isImage: true })) || [];

    this.setData({
      'formData': formData as typeof this.data.formData,
      fileList,
    });
  },

  onInputChange(e: any) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail || '';

    this.setData({
      [`formData.${field}`]: value,
    });

    if (field === 'jobTitle' && this.data.formData.jobType === '其他') {
      this.setData({
        'formData.otherJobType': true,
      });
    }
  },

  showPopup(e: any) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) {
      console.error('showPopup: Invalid event object');
      return;
    }

    const field = e.currentTarget.dataset.field;
    let columns: any[] = [];
    let title = '';

    switch (field) {
      case 'orientation':
        columns = SEXUAL_ORIENTATION_OPTIONS;
        title = '请选择性取向';
        break;
      case 'relationshipView':
        columns = RELATIONSHIP_VIEW_OPTIONS;
        title = '请选择婚恋观';
        break;
      case 'maritalStatus':
        columns = MARITAL_STATUS_OPTIONS;
        title = '请选择当前婚姻状态';
        break;
      case 'education':
        columns = EDUCATION_OPTIONS;
        title = '请选择学历';
        break;
      case 'currentStatus':
        columns = STATUS_OPTIONS;
        title = '请选择目前状态';
        break;
      case 'jobType':
        columns = JOB_TYPE_OPTIONS;
        title = '请选择工作类型';
        break;
      case 'birthday':
        columns = this.getYearColumns();
        title = '请选择出生年份';
        break;
      default:
        break;
    }

    this.setData({
      showPickerPopup: true,
      pickerTitle: title,
      pickerColumns: columns,
      pickerField: field,
      pickerValueKey: typeof columns[0] === 'object' ? 'label' : '',
    });
  },

  closePopup() {
    this.setData({ showPickerPopup: false });
  },

  onPickerConfirm(e: any) {
    // 添加空值检查
    if (!e || !e.detail) {
      console.error('onPickerConfirm: Invalid event object');
      return;
    }

    const value = e.detail.value;
    const field = this.data.pickerField;

    if (!value || !field) {
      console.error('onPickerConfirm: Missing value or field');
      return;
    }

    let label = value;
    let update: any = {};

    switch (field) {
      case 'orientation':
        update.orientation = label;
        update.orientationLabel = label;
        break;
      case 'relationshipView':
        update.relationshipView = label;
        update.relationshipViewLabel = label;
        break;
      case 'maritalStatus':
        update.maritalStatus = label;
        update.maritalStatusLabel = label;
        break;
      case 'education':
        update.education = label;
        update.educationLabel = label;
        break;
      case 'currentStatus':
        update.currentStatus = label;
        update.currentStatusLabel = label;
        break;
      case 'jobType':
        update.jobType = label;
        update.jobTypeLabel = label;
        update.otherJobType = label === '其他';
        break;
      case 'birthday':
        update.birthday = label;
        update.birthdayLabel = label;
        break;
      default:
        break;
    }

    this.setData({
      [`formData.${field}`]: update[field],
      [`formData.${field}Label`]: update[`${field}Label`],
      ...(field === 'jobType' ? { 'formData.otherJobType': update.otherJobType } : {}),
      showPickerPopup: false,
    });
  },

  getYearColumns() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 60; i <= currentYear - 18; i++) {
      years.push(i + '');
    }
    return years.reverse();
  },

  onShareOptionChange(e: any) {
    if (!e || !e.detail) {
      console.error('onShareOptionChange: Invalid event object');
      return;
    }

    this.setData({
      'formData.isVerified': e.detail,
    });
  },

  afterRead(e: any) {
    // 添加空值检查
    if (!e || !e.detail || !e.detail.file) {
      console.error('afterRead: Invalid event object or missing file');
      return;
    }

    const file = e.detail.file;
    const currentFileList = this.data.fileList || [];

    // 确保 file 是数组格式
    const fileArray = Array.isArray(file) ? file : [file];
    const fileList = currentFileList.concat(fileArray);

    this.setData({ fileList });
  },

  onDeleteImage(e: any) {
    // 添加空值检查
    if (!e || !e.detail || typeof e.detail.index !== 'number') {
      console.error('onDeleteImage: Invalid event object or missing index');
      return;
    }

    const index = e.detail.index;
    const fileList = [...this.data.fileList];

    if (index >= 0 && index < fileList.length) {
      fileList.splice(index, 1);
      this.setData({ fileList });
    }
  },

  uploadImgs() {
    const fileList = this.data.fileList || [];

    const uploadPromises = fileList.map((file: any) =>
      new Promise((resolve, reject) => {
        if (file && file.tempFilePath) {
          uploadUserImage(file.tempFilePath).then(resolve).catch(reject);
        } else if (file && file.url) {
          resolve(file.url);
        } else {
          reject(new Error('Invalid file object'));
        }
      })
    );

    return Promise.all(uploadPromises);
  },

  async onSubmit() {
    const formData = { ...this.data.formData } as { [key: string]: any };

    // 校验
    const requiredFields = [
      'realName', 'phone', 'wechat', 'gender', 'hometown', 'preferredCity',
      'orientation', 'relationshipView', 'maritalStatus', 'birthday',
      'height', 'weight', 'education', 'university', 'currentStatus', 'major',
      'aboutMe', 'partnerRequirements'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        Toast.fail('请完整填写所有必填项');
        return;
      }
    }

    if ((formData.aboutMe || '').length < 30) {
      Toast.fail('关于我需不少于30字');
      return;
    }

    if (!this.data.fileList || this.data.fileList.length === 0) {
      Toast.fail('请上传至少一张照片');
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const uploadResults = await this.uploadImgs();
      const imgs = uploadResults.map((r: any) => {
        if (r && r.data) {
          try {
            const parsed = JSON.parse(r.data);
            return parsed.data && parsed.data[0] ? parsed.data[0] : r;
          } catch (parseError) {
            console.error('Failed to parse upload result:', parseError);
            return r;
          }
        }
        return r;
      });

      // 构造符合后端UpdateOwnSingleInformationRequest结构的数据
      const submitData = {
        ...formData,
        birthday: parseInt(formData.birthday || "0"),
        height: parseInt(formData.height || "0"),
        weight: parseInt(formData.weight || "0"),
        isVerified: formData.isVerified === 'true',
        photos: imgs
      };

      await saveSingleInformation(submitData as any);
      // wx.showToast({
      //   title: '保存成功',
      //   icon: 'success',
      //   duration: 1200,
      // });
      Toast.success('保存成功');
    } catch (error) {
      console.error('Submit error:', error);
      Toast.fail('保存失败，请重试');
    } finally {
      wx.hideLoading();
    }
  }
});