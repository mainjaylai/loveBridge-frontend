import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";
import { getFollowList, toggleFollow } from "../../api/user";
import { formatTime12 } from "../../utils/util";

Page({
  data: {
    curTabIndex: 0,
    followings: [] as User[],
    followers: [] as User[],
    curUsers: [] as User[],
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
  },
  onLoad() {
    this.fetchFollowList();
  },

  onShow() {
    // 页面显示时重新获取数据，确保数据及时更新
    this.fetchFollowList();
  },

  fetchFollowList() {
    wx.showLoading({
      title: "加载中",
    });

    getFollowList()
      .then((res: any) => {
        const { followings, followers } = res.data.data;

        // 格式化数据，确保显示正确的生日格式
        const formattedFollowings = followings.map((user: User) => ({
          ...user,
          birthday: user.birthday
            ? formatTime12(Number(user.birthday))
            : "**年",
        }));

        const formattedFollowers = followers.map((user: User) => ({
          ...user,
          birthday: user.birthday
            ? formatTime12(Number(user.birthday))
            : "**年",
        }));
        this.setData({
          followings: formattedFollowings,
          followers: formattedFollowers,
          curUsers:
            this.data.curTabIndex === 0
              ? formattedFollowings
              : formattedFollowers,
        });

        wx.hideLoading();
      })
      .catch((err) => {
        console.error("获取关注列表失败:", err);
        wx.hideLoading();
        wx.showToast({
          title: "获取数据失败",
          icon: "none",
        });
      });
  },

  onTabClick(e: any) {
    const index = e.detail.index;
    this.setData({
      curTabIndex: index,
      curUsers: index === 0 ? this.data.followings : this.data.followers,
    });
  },

  onUserClick(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/publicProfile/index?userId=${id}`,
    });
  },

  // 切换关注状态
  toggleFollowStatus(e: any) {
    const userId = e.currentTarget.dataset.id;
    if (!userId) return;

    toggleFollow(userId)
      .then((res: any) => {
        // 获取当前关系类型
        const currentUserIndex = this.data.curUsers.findIndex((u) => u.id === userId);
        const currentRelationType = this.data.curUsers[currentUserIndex].relationType;
        let newRelationType = 0;
        let toastTitle = "";

        // 根据当前关系类型切换状态
        if (currentRelationType === 0) {
          // 未关注 -> 已关注
          newRelationType = 1;
          toastTitle = "关注成功";
        } else if (currentRelationType === 1) {
          // 已关注 -> 未关注
          newRelationType = 0;
          toastTitle = "已取消关注";
        } else if (currentRelationType === 2) {
          // 我的粉丝 -> 互相关注
          newRelationType = 3;
          toastTitle = "关注成功";
        } else if (currentRelationType === 3) {
          // 互相关注 -> 我的粉丝
          newRelationType = 2;
          toastTitle = "已取消关注";
        }

        wx.showToast({
          title: toastTitle,
          icon: "success",
        });

        // this.setData({
        //   "userInfo.relationType": newRelationType,
        // });
      })
      .catch(() => {
        wx.showToast({
          title: "网络错误",
          icon: "none",
        });
      });
  },
});
