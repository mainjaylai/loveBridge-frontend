import { getAllSingleUser, geteveryData, getFilteredSingleUsers, searchSingleUser } from "../../api/matchmaker";
import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";

Page({
  data: {
    myUser: {},
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    curTabIndex: 0,
    searchKeyword: '',
    users: [] as any[],
    totalCount: 0,
    showFilterPopup: false,
    currentCategory: 'gender', // 默认显示性别筛选
    filters: {
      gender: 0, // 0: 全部, 1: 男, 2: 女
      minAge: 18,
      maxAge: 50,
      minHeight: 150,
      maxHeight: 200,
      status: 0, // 0: 不限, 1: 在读, 2: 已工作
      education: 0, // 0: 不限, 1: 本科及以上, 2: 硕士及以上, 3: 博士及以上
      location: '', // 常住地筛选
      hometown: '' // 家乡筛选
    },
    // 年龄选择器配置
    ageColumns: [...Array.from({ length: 33 }, (_, i) => `${i + 18}岁`)],
    defaultMinAgeIndex: 0,  // 默认选中项索引
    defaultMaxAgeIndex: 32, // 默认选中项索引

    // 身高选择器配置
    heightColumns: [...Array.from({ length: 101 }, (_, i) => `${i + 150}cm`)],
    defaultMinHeightIndex: 0,  // 默认选中项索引
    defaultMaxHeightIndex: 100, // 默认选中项索引

    // 状态选项
    statusOptions: ['不限', '在读', '已工作'],

    // 学历选项
    educationOptions: ['不限', '本科及以上', '硕士及以上', '博士及以上'],
  },

  onLoad() {
    this.fetchUsers();
    const app = getApp<IAppOption>();
    this.setData({
      myUser: app.globalData.userInfo,
    });
  },

  onPullDownRefresh() {
    this.fetchUsers().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchUsers() {
    wx.showLoading({
      title: '加载中...',
    });

    // 根据是否有筛选条件来决定调用哪个接口
    const keyword = this.data.searchKeyword;
    const hasFilters = this.hasActiveFilters();

    const apiCall = keyword ? searchSingleUser(keyword) : hasFilters
      ? getFilteredSingleUsers(this.data.filters)
      : geteveryData();

    return apiCall.then((res: any) => {
      // Process user data
      const userData = res.data.data || [];
      const processedUsers = userData.map((user: any) => {
        return {
          ...user,
          aboutMe: user.aboutMe && user.aboutMe.length > 15
            ? user.aboutMe.substring(0, 15) + '...'
            : (user.aboutMe || '暂无简介'),
        };
      });

      this.setData({
        users: processedUsers,
        totalCount: userData.length || 0
      });
      wx.hideLoading();
    }).catch((err) => {
      console.error('获取CP池数据失败', err);
      wx.hideLoading();
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    });
  },

  // 检查是否有筛选条件
  hasActiveFilters() {
    const { gender, minAge, maxAge, minHeight, maxHeight, status, education, location, hometown } = this.data.filters;
    return gender !== 0 ||
      minAge !== 18 ||
      maxAge !== 50 ||
      minHeight !== 150 ||
      maxHeight !== 200 ||
      status !== 0 ||
      education !== 0 ||
      location !== '' ||
      hometown !== '';
  },

  onSearchChange(e: any) {
    this.setData({ searchKeyword: e.detail });
  },

  onSearch() {
    this.fetchUsers();
  },

  onUserClick(e: any) {
    const id = e.currentTarget.dataset.id;
    // 跳转到CP用户详情页
    wx.navigateTo({
      url: `/pages/cpUserDetail/index?userId=${id}`
    });
  },

  showFilter() {
    this.setData({ showFilterPopup: true });

    // 初始化picker的默认选中项
    this.initPickerDefaultValues();
  },

  // 初始化picker的默认选中项
  initPickerDefaultValues() {
    const { minAge, maxAge, minHeight, maxHeight } = this.data.filters;

    this.setData({
      defaultMinAgeIndex: minAge - 18,
      defaultMaxAgeIndex: maxAge - 18,
      defaultMinHeightIndex: minHeight - 150,
      defaultMaxHeightIndex: maxHeight - 150
    });
  },

  onFilterClose() {
    // 应用当前筛选条件，无需额外操作，因为切换时已保存
    this.setData({ showFilterPopup: false });
    this.fetchUsers();
  },

  // 切换筛选类别
  switchCategory(e: any) {
    // 切换前保存当前类别的选择
    // 这里无需额外处理，因为选择器的更改会直接更新filters

    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
  },

  // 选择性别
  selectGender(e: any) {
    const gender = Number(e.currentTarget.dataset.gender);

    this.setData({
      'filters.gender': gender
    });
  },

  // 选择状态
  selectStatus(e: any) {
    const status = Number(e.currentTarget.dataset.status);

    this.setData({
      'filters.status': status
    });
  },

  // 选择学历
  selectEducation(e: any) {
    const education = Number(e.currentTarget.dataset.education);

    this.setData({
      'filters.education': education
    });
  },

  // 常住地输入
  onLocationInput(e: any) {
    this.setData({
      'filters.location': e.detail.value.trim()
    });
  },

  // 家乡输入
  onHometownInput(e: any) {
    this.setData({
      'filters.hometown': e.detail.value.trim()
    });
  },

  // 年龄选择器change事件 - 最小年龄
  onMinAgeChange(e: any) {
    const index = e.detail.index;
    const minAge = index + 18;
    let maxAge = this.data.filters.maxAge;
    if (minAge > maxAge) {
      maxAge = minAge;
    }

    this.setData({
      'filters.minAge': minAge,
      'filters.maxAge': maxAge,
      defaultMaxAgeIndex: maxAge - 18,
      defaultMinAgeIndex: index
    });
  },

  // 年龄选择器change事件 - 最大年龄
  onMaxAgeChange(e: any) {

    const index = e.detail.index;
    const maxAge = index + 18;
    let minAge = this.data.filters.minAge;
    if (maxAge < minAge) {
      minAge = maxAge;
    }

    this.setData({
      'filters.maxAge': maxAge,
      'filters.minAge': minAge,
      defaultMinAgeIndex: minAge - 18,
      defaultMaxAgeIndex: maxAge - 18,
    });
  },

  // 身高选择器change事件 - 最小身高
  onMinHeightChange(e: any) {
    const index = e.detail.index;
    const minHeight = index + 150;
    let maxHeight = this.data.filters.maxHeight;

    if (minHeight > maxHeight) {
      maxHeight = minHeight;
    }

    this.setData({
      'filters.minHeight': minHeight,
      'filters.maxHeight': maxHeight,
      defaultMinHeightIndex: minHeight - 150,
      defaultMaxHeightIndex: maxHeight - 150,
    });
  },

  // 身高选择器change事件 - 最大身高
  onMaxHeightChange(e: any) {
    const index = e.detail.index;
    const maxHeight = index + 150;
    let minHeight = this.data.filters.minHeight;
    if (maxHeight < minHeight) {
      minHeight = maxHeight;
    }

    this.setData({
      'filters.maxHeight': maxHeight,
      'filters.minHeight': minHeight,
      defaultMinHeightIndex: minHeight - 150,
      defaultMaxHeightIndex: maxHeight - 150,
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      filters: {
        gender: 0,
        minAge: 18,
        maxAge: 50,
        minHeight: 150,
        maxHeight: 200,
        status: 0,
        education: 0,
        location: '',
        hometown: ''
      },
      defaultMinAgeIndex: 0,
      defaultMaxAgeIndex: 32,
      defaultMinHeightIndex: 0,
      defaultMaxHeightIndex: 100,
    });
  },

  // 应用筛选
  applyFilter() {
    this.setData({ showFilterPopup: false });
    this.fetchUsers();
  }
}); 