import { getPostsByUserId, deletePost } from "../../api/post";
import { formatTime3 } from "../../utils/util";
import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";

Page({
  data: {
    posts: [] as Post[],
    userId: 0 as number,
  },
  onLoad() {
    const app = getApp();
    this.setData({
      userId: app.globalData.userInfo.id,
    });
    this.fetchPosts();
  },

  fetchPosts() {
    return getPostsByUserId(this.data.userId).then((res: any) => {
      const formattedPosts = res.data.data.map((post: Post) => {
        // 格式化 createdAt
        const formattedCreatedAt = formatTime3(post.createdAt);

        let content = post.content.slice(0, 80);
        if (content.length < post.content.length) {
          content += "...";
        }

        // 返回新的对象
        return {
          ...post,
          content: content,
          createdAt: formattedCreatedAt,
          images: JSON.parse(post.images as unknown as string),
        };
      });
      this.setData({
        posts: formattedPosts,
      });
    });
  },

  showPopup(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["删除"],
      success: (res) => {
        if (res.tapIndex === 0) {
          deletePost(id).then(() => {
            Toast({
              type: "success",
              message: "已删除",
              duration: 1000,
            });
            this.setData({
              posts: this.data.posts.filter((p) => p.id !== id),
            });
          });
        }
      },
    });
  },
  navToDetail(e: any) {
    wx.navigateTo({
      url: `/pages/postDetail/index?id=${e.currentTarget.dataset.id}`,
    });
  },
});
