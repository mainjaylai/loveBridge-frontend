import { getHotPosts } from "../../api/post";
import { formatTime10 } from "../../utils/util";

interface Post {
  id: number;
  content: string;
  images: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  user: {
    id: number;
    nickname: string;
    avatarUrl: string;
    gender: number;
    birthday: string;
  };
}

Page({
  data: {
    posts: [] as Post[],
    isLoading: true,
  },

  onLoad() {
    this.fetchHotPosts();
  },

  onPullDownRefresh() {
    this.fetchHotPosts();
    wx.stopPullDownRefresh();
  },

  fetchHotPosts() {
    this.setData({ isLoading: true });

    getHotPosts()
      .then((res: any) => {
        // 处理返回的热门帖子数据
        const hotPosts = res.data.data || [];

        // 格式化时间并处理数据
        const formattedPosts = hotPosts.map((post: any) => {
          // 处理图片数据
          let images = [];
          try {
            if (post.images && typeof post.images === "string") {
              images = JSON.parse(post.images);
            } else if (Array.isArray(post.images)) {
              images = post.images;
            }
          } catch (error) {
            console.error("解析图片数据错误:", error);
            images = [];
          }

          return {
            ...post,
            createdAt: formatTime10(post.createdAt),
            images: images,
          };
        });

        this.setData({
          posts: formattedPosts,
          isLoading: false,
        });
      })
      .catch((err: any) => {
        console.error("获取热门帖子失败:", err);
        this.setData({ isLoading: false });
        wx.showToast({
          title: "获取热门帖子失败",
          icon: "none",
        });
      });
  },

  // 跳转到帖子详情
  navigateToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/postDetail/index?id=${id}`,
    });
  },

  // 图片预览
  previewImage(e: any) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current,
    });
    // 阻止冒泡，避免触发navigateToDetail
    return false;
  },
});
