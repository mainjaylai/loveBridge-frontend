import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import { searchPosts } from "../../api/post";
import { formatTime10 } from "../../utils/util";

Page({
  data: {
    keyword: "",
    posts: [] as any[],
    loading: false,
  },

  // 搜索框内容变化
  onSearchChange(e: WechatMiniprogram.CustomEvent) {
    const value = typeof e.detail === "object" ? e.detail.value : e.detail;
    this.setData({
      keyword: value,
    });
  },

  // 执行搜索
  onSearch() {
    if (!this.data.keyword.trim()) {
      Toast({
        type: "fail",
        message: "请输入搜索关键词",
        duration: 1500,
      });
      return;
    }

    // 重置分页，开始新的搜索
    this.setData({
      posts: [],
      loading: true,
    });

    this.fetchSearchResults();
  },

  // 处理点击搜索按钮（实际是cancel事件）
  handleCancel() {
    // 保存当前关键词，因为vant会在cancel事件中清空关键词
    const currentKeyword = this.data.keyword;

    // 如果有关键词，执行搜索
    if (currentKeyword && currentKeyword.trim()) {
      // 重置分页，开始新的搜索
      this.setData({
        posts: [],
        loading: true,
        // 恢复关键词，因为vant会清空它
        keyword: currentKeyword,
      });

      //   this.fetchSearchResults();
    }
  },

  // 获取搜索结果
  fetchSearchResults(isLoadMore = false) {
    const { keyword } = this.data;
    return searchPosts(keyword)
      .then((res: any) => {
        // 处理搜索结果
        const postsData = res.data.data || [];

        // 格式化搜索结果并高亮关键词
        const formattedPosts = postsData.map((post: any) => {
          // 高亮处理content中的关键词
          const highlightedContent = this.highlightKeyword(
            post.content,
            keyword
          );

          return {
            ...post,
            createdAt: formatTime10(post.createdAt),
            highlightedContent,
          };
        });

        // 按照commentCounts + likeCounts排序
        const sortedPosts = [
          ...(isLoadMore ? this.data.posts : []),
          ...formattedPosts,
        ].sort((a, b) => {
          const scoreA = a.commentsCount + a.likesCount;
          const scoreB = b.commentsCount + b.likesCount;
          return scoreB - scoreA; // 降序排列
        });

        // 更新数据
        this.setData({
          posts: sortedPosts,
          loading: false,
        });
      })
      .catch((error) => {
        console.error("搜索失败:", error);
        this.setData({
          loading: false,
        });

        Toast({
          type: "fail",
          message: "搜索失败，请重试",
          duration: 1500,
        });
      });
  },

  // 高亮关键词
  highlightKeyword(content: string, keyword: string): string {
    if (!content || !keyword) return content;

    // 转义特殊字符，避免在正则表达式中出现问题
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 使用正则表达式进行替换，添加高亮标签
    return content.replace(new RegExp(escapedKeyword, "gi"), (match) => {
      return `<span style="color: #ff5500; font-weight: bold;">${match}</span>`;
    });
  },

  // 跳转到帖子详情
  navToDetail(e: any) {
    wx.navigateTo({
      url: `/pages/postDetail/index?id=${e.currentTarget.dataset.id}`,
    });
  },
});
