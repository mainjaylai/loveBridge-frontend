import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";
import { getPostsByUserId } from "../../api/post";
import { formatTime12, formatTime3 } from "../../utils/util";
import { getUserInfoById, toggleFollow } from "../../api/user";
import { DEFAULT_USER_AVATAR, DEFAULT_USER_NICKNAME } from "../../const/user";

Page({
  data: {
    isMe: true,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    userInfo: {} as User,
    posts: [] as Post[],
    DEFAULT_USER_AVATAR: DEFAULT_USER_AVATAR,
    DEFAULT_USER_NICKNAME: DEFAULT_USER_NICKNAME,
    statusBarHeight: 0, // 状态栏高度
    navBarHeight: 0, // 导航栏高度（状态栏高度 + 导航栏内容高度）
    navBg: "transparent",
  },
  onLoad(options: { userId?: string }) {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight; // 状态栏高度
    const navBarHeight = statusBarHeight + 44; // 导航栏总高度（状态栏高度 + 44px）
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    const app = getApp<IAppOption>();
    const userInfo = JSON.parse(JSON.stringify(app.globalData.userInfo));
    // 如果用户是自己的个人主页，也需要获取
    let userId = options.userId;
    if (userId === undefined) {
      userId = userInfo.id;
    }
    this.setData({
      isMe: Number(userId) === userInfo.id,
    });
    getUserInfoById(Number(userId)).then((res: any) => {
      this.setData({
        userInfo: {
          ...res.data.data,
          birthday: res.data.data.birthday
            ? formatTime12(Number(res.data.data.birthday))
            : "**年",
        },
      });
    });
    this.fetchPosts(Number(userId));
  },
  fetchPosts(userId?: number) {
    return getPostsByUserId(userId).then((res: any) => {
      const formattedPosts = res.data.data.map((post: Post) => {
        // 格式化 createdAt
        const formattedCreatedAt = formatTime3(post.createdAt);

        let content = post.content.slice(0, 100);
        if (content.length < post.content.length) {
          content += "...";
        }

        // 返回新的对象
        return {
          ...post,
          createdAt: formattedCreatedAt,
          images: JSON.parse(post.images as unknown as string),
          content: content,
        };
      });
      this.setData({
        posts: formattedPosts,
      });
    });
  },
  navToDetail(e: any) {
    wx.navigateTo({
      url: `/pages/postDetail/index?id=${e.currentTarget.dataset.id}`,
    });
  },
  navBack() {
    wx.navigateBack();
  },

  // 切换关注状态
  toggleFollowStatus() {
    const { userInfo } = this.data;
    if (!userInfo.id) return;

    toggleFollow(userInfo.id)
      .then((res: any) => {
        // 获取当前关系类型
        const currentRelationType = userInfo.relationType;
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

        this.setData({
          "userInfo.relationType": newRelationType,
        });
      })
      .catch(() => {
        wx.showToast({
          title: "网络错误",
          icon: "none",
        });
      });
  },

  // 监听页面滚动事件
  onPageScroll(e) {
    if (e.scrollTop > 0 && this.data.navBg !== "white") {
      this.setData({ navBg: "white" });
    } else if (e.scrollTop <= 0 && this.data.navBg !== "transparent") {
      this.setData({ navBg: "transparent" });
    }
  },
});
