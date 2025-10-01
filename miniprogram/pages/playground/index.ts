import { DEFAULT_USER_INFO } from "../../const/user";
import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";
import { formatTime10, formatTime12 } from "../../utils/util";
import { getAllPostList, togglePostStatus } from "../../api/post";

Page({
  data: {
    posts: [] as Post[],
    userInfo: DEFAULT_USER_INFO,
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    page: 1,
    pageSize: 15,
    hasMore: true,
    loading: false,
    total: 0,
    currentSharePost: null as Post | null,
    needRefresh: false
  },
  onLoad() {
    const app = getApp<IAppOption>();
    this.setData({
      userInfo: app.globalData.userInfo,
    });
    // 重置分页，重新加载第一页
    this.setData({
      page: 1,
      posts: [],
      hasMore: true,
    });
    this.fetchPosts();
  },
  onShow() {
    if (this.data.needRefresh) {
      this.setData({
        page: 1,
        posts: [],
        hasMore: true,
        needRefresh: false
      });
      this.fetchPosts();
    }
  },
  onPullDownRefresh() {
    // 下拉刷新：重置到第一页并重新加载
    this.setData({
      page: 1,
      posts: [],
      hasMore: true,
    });
    this.fetchPosts().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    // 上拉加载更多：检查是否还有更多数据，如果有则加载下一页
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreData();
    }
  },
  loadMoreData() {
    // 加载下一页数据
    this.setData({
      page: this.data.page + 1,
      loading: true,
    });
    this.fetchPosts(true);
  },
  fetchPosts(isLoadMore = false) {
    return getAllPostList(this.data.page, this.data.pageSize)
      .then((res: any) => {
        // 处理新格式的数据结构
        const posts = res.data.data.posts || [];
        const total = res.data.data.total || 0;

        // 判断是否还有更多数据
        const hasMore = this.data.posts.length + posts.length < total;

        // 格式化每个帖子
        const formattedPosts = posts.map((post: any) => {
          // 处理图片数据，确保是数组格式
          let images = [];
          try {
            if (post.images && typeof post.images === "string") {
              images = JSON.parse(post.images);
            }
          } catch (error) {
            console.error("解析图片数据错误:", error);
            images = [];
          }

          // 格式化创建时间
          const formattedCreatedAt = formatTime10(post.createdAt);

          // 确保标签是数组
          const tags = Array.isArray(post.tags) ? post.tags : [];

          let content = post.content.slice(0, 100);

          if (content.length < post.content.length) {
            content += "...";
          }

          // 返回格式化后的帖子对象
          return {
            ...post,
            tags: tags,
            createdAt: formattedCreatedAt,
            images: images,
            content: content,
            user: {
              ...post.user,
              birthYear: formatTime12(Number(post.user.birthday)),
            },
          };
        });

        // 更新数据
        this.setData({
          posts: isLoadMore
            ? [...this.data.posts, ...formattedPosts]
            : formattedPosts,
          hasMore: hasMore,
          loading: false,
          total: total,
        });
      })
      .catch((error) => {
        console.error("获取帖子列表失败:", error);
        this.setData({
          loading: false,
        });

        wx.showToast({
          title: "加载失败",
          icon: "none",
        });
      });
  },
  publishPost() {
    wx.navigateTo({
      url: "/pages/publishPost/index",
    });
  },
  navigateToHotPosts() {
    wx.navigateTo({
      url: "/pages/hotPosts/index",
    });
  },
  navigateToSearchPosts() {
    wx.navigateTo({
      url: "/pages/searchPosts/index",
    });
  },
  likePost(e: any) {
    const id = e.currentTarget.dataset.id;
    togglePostStatus(id).then((res) => {
      const newPosts = this.data.posts.map((p) => {
        if (p.id !== id) {
          return p;
        } else {
          return {
            ...p,
            isLiked: !p.isLiked,
            likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
      });
      this.setData({ posts: newPosts });
    });
  },
  navToDetail(e: any) {
    wx.navigateTo({
      url: `/pages/postDetail/index?id=${e.currentTarget.dataset.id}`,
    });
  },
  onUserClick(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/publicProfile/index?userId=${id}`,
    });
  },
  // 添加分享功能
  onShareAppMessage(e?: any) {
    // 从分享按钮获取帖子ID
    let postId: number | undefined;
    let post: Post | undefined;

    if (e && e.target && e.target.dataset && e.target.dataset.id) {
      postId = Number(e.target.dataset.id);
      post = this.data.posts.find((p) => p.id === postId);
    } else if (this.data.currentSharePost) {
      post = this.data.currentSharePost;
    }

    // 如果找到了要分享的帖子
    if (post) {
      const postTitle = post.content
        ? post.content.length > 20
          ? post.content.substring(0, 20) + "..."
          : post.content
        : "分享帖子";

      return {
        title: postTitle,
        path: `/pages/postDetail/index?id=${post.id}`,
        imageUrl: post.images && post.images.length > 0 ? post.images[0] : "/images/logo-green.png",
      };
    }

    // 默认分享整个广场页面
    return {
      title: "青衫爱旅行 - 广场",
      path: "/pages/playground/index",
    };
  },
  onShareTimeline() {
    // 分享到朋友圈
    // 如果有选中的帖子，分享该帖子
    if (this.data.currentSharePost) {
      const post = this.data.currentSharePost;
      const postTitle = post.content
        ? post.content.length > 20
          ? post.content.substring(0, 20) + "..."
          : post.content
        : "分享帖子";

      return {
        title: postTitle,
        query: `id=${post.id}`,
        imageUrl: post.images && post.images.length > 0 ? post.images[0] : "",
      };
    }

    // 默认分享广场
    const title = "青衫爱旅行 - 广场";
    return {
      title: title,
      query: "",
    };
  },
});
