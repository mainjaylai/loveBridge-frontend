import Toast from "../../miniprogram_npm/@vant/weapp/toast/toast";
import {
  getPostDetail,
  createComment,
  togglePostStatus,
  toggleCommentStatus,
} from "../../api/post";
import { uploadUserImage } from "../../api/user";
import { formatTime10, formatTime12 } from "../../utils/util";
import { GENDER_NUMBER_TO_LABEL } from "../../utils/const";

Page({
  data: {
    post: {} as Post,
    comment: "", // 评论内容
    GENDER_NUMBER_TO_LABEL: GENDER_NUMBER_TO_LABEL,
    user: {} as User,
    replyTo: null as {
      commentId: number;
      nickname: string;
      userId: number;
    } | null,
    isReplying: false, // 为true表示聚焦评论框并唤起键盘
    commentImage: "",
    expandedComments: {} as Record<number, boolean>, // 记录已展开的评论ID
    showSubscribePopup: false, // 控制公众号关注弹窗的显示
  },
  onLoad(options: { id: string }) {
    this.fetchPost(Number(options.id));
    const app = getApp();
    this.setData({
      user: app.globalData.userInfo,
    });
  },
  onPullDownRefresh() {
    const postId = this.data.post.id;
    if (postId) {
      this.fetchPost(postId);
    }
    wx.stopPullDownRefresh();
  },
  onShareAppMessage() {
    const postId = this.data.post.id;
    const postTitle = this.data.post.content
      ? this.data.post.content.substring(0, 20) + "..."
      : "分享帖子";
    return {
      title: postTitle,
      path: `/pages/postDetail/index?id=${postId}`,
      imageUrl:
        this.data.post.images && this.data.post.images.length > 0
          ? this.data.post.images[0]
          : "/images/logo-green.png",
    };
  },
  onShareTimeline() {
    const postId = this.data.post.id;
    const postTitle = this.data.post.content
      ? this.data.post.content.substring(0, 20) + "..."
      : "分享帖子";
    return {
      title: postTitle,
      query: `id=${postId}`,
      imageUrl:
        this.data.post.images && this.data.post.images.length > 0
          ? this.data.post.images[0]
          : "",
    };
  },
  fetchPost(postId: number) {
    getPostDetail(postId).then((res: any) => {
      const post = res.data.data;
      let images = [];
      try {
        if (post.images && typeof post.images === "string") {
          images = JSON.parse(post.images);
        }
      } catch (error) {
        console.error("解析图片数据错误:", error);
        images = [];
      }

      const formattedCreatedAt = formatTime10(post.createdAt);

      const tags = Array.isArray(post.tags) ? post.tags : [];

      let birthYear = "";
      if (post.user && post.user.birthday) {
        try {
          const birthDate = new Date(Number(post.user.birthday));
          birthYear = String(birthDate.getFullYear()).slice(2) + "年";
        } catch (error) {
          console.error("解析出生日期错误:", error);
          birthYear = "**年";
        }
      }

      let comments = Array.isArray(post.comments) ? post.comments : [];

      if (comments.length > 0) {
        comments = comments.map((comment: Comment) => {
          const formattedSubComments = Array.isArray(comment.subComments)
            ? comment.subComments
                .map((subComment: Comment) => {
                  return {
                    ...subComment,
                    createdAt: formatTime10(subComment.createdAt),
                    user: {
                      ...subComment.user,
                      birthYear: formatTime12(
                        Number(subComment.user.birthday || "0")
                      ),
                    },
                    replyUser: {
                      id: subComment.replyUser?.id,
                      nickname: subComment.replyUser?.nickname,
                    },
                  };
                })
                .sort((a, b) => {
                  return (
                    new Date(a.updatedAt).getTime() -
                    new Date(b.updatedAt).getTime()
                  );
                })
            : [];

          return {
            ...comment,
            createdAt: formatTime10(comment.createdAt),
            user: {
              ...comment.user,
              birthYear: formatTime12(Number(comment.user.birthday || "0")),
            },
            subComments: formattedSubComments,
          };
        });

        const hotComments = comments
          .filter((comment: Comment) => comment.likesCount > 10)
          .sort((a: Comment, b: Comment) => b.likesCount - a.likesCount)
          .slice(0, 3);

        const remainingComments = comments
          .filter(
            (comment: Comment) =>
              comment.likesCount <= 10 || !hotComments.includes(comment)
          )
          .sort((a: Comment, b: Comment) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          });

        comments = [...hotComments, ...remainingComments];

        comments = comments.map((comment: Comment, index: number) => {
          return {
            ...comment,
            isHot: index < hotComments.length && hotComments.includes(comment),
          };
        });
      }

      this.setData({
        post: {
          ...post,
          tags: tags,
          createdAt: formattedCreatedAt,
          images: images,
          comments: comments,
          user: {
            ...post.user,
            birthYear: birthYear,
          },
        },
      });
    });
  },
  onInputChange(e: any) {
    this.setData({
      comment: e.detail.value || e.detail,
    });
  },
  likePost() {
    const id = this.data.post.id;
    const post = this.data.post;
    this.setData({
      post: {
        ...post,
        isLiked: !post.isLiked,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
      },
    });
    togglePostStatus(id);
  },
  likeComment(e: any) {
    const id = e.currentTarget.dataset.id;

    let isUpdated = false;

    const newComments = [...this.data.post.comments];

    const commentIndex = newComments.findIndex((c) => c.id === id);
    if (commentIndex !== -1) {
      const comment = { ...newComments[commentIndex] };
      comment.isLiked = !comment.isLiked;
      comment.likesCount = comment.isLiked
        ? comment.likesCount + 1
        : comment.likesCount - 1;
      newComments[commentIndex] = comment;
      isUpdated = true;
    } else {
      for (let i = 0; i < newComments.length; i++) {
        if (!newComments[i].subComments || !newComments[i].subComments.length)
          continue;

        const subCommentIndex = newComments[i].subComments.findIndex(
          (sc) => sc.id === id
        );
        if (subCommentIndex !== -1) {
          const parentComment = { ...newComments[i] };
          const subComment = { ...parentComment.subComments[subCommentIndex] };

          subComment.isLiked = !subComment.isLiked;
          subComment.likesCount = subComment.isLiked
            ? (subComment.likesCount || 0) + 1
            : (subComment.likesCount || 1) - 1;

          parentComment.subComments = [...parentComment.subComments];
          parentComment.subComments[subCommentIndex] = subComment;

          newComments[i] = parentComment;
          isUpdated = true;
          break;
        }
      }
    }

    if (isUpdated) {
      this.setData({
        post: {
          ...this.data.post,
          comments: newComments,
        },
      });
      toggleCommentStatus(id);
    }
  },
  uploadImage() {
    return new Promise((resolve, reject) => {
      if (!this.data.commentImage) {
        resolve("");
        return;
      }

      wx.showLoading({
        title: "上传图片中...",
      });

      uploadUserImage(this.data.commentImage)
        .then((res: any) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              resolve(data.data[0]);
            } catch (error) {
              // 如果返回数据格式不是JSON，尝试直接使用
              resolve(res.data?.url || "");
            }
          } else {
            reject(new Error("上传失败"));
          }
        })
        .catch((error) => {
          wx.hideLoading();
          reject(error);
        });
    });
  },
  publish() {
    if (!this.data.comment && !this.data.commentImage) {
      wx.showToast({
        title: "请输入评论内容或上传图片",
        icon: "none",
      });
      return;
    }

    const that = this;
    wx.showLoading({
      title: "发表中...",
    });

    const commentData: any = {
      postId: this.data.post.id,
      content: this.data.comment || "",
    };

    if (this.data.isReplying && this.data.replyTo) {
      commentData.replyCommentId = this.data.replyTo.commentId;
    }

    Promise.all([this.uploadImage()])
      .then(([imageUrl]) => {
        if (imageUrl) {
          commentData.image = imageUrl;
        }

        return createComment(commentData);
      })
      .then((res: any) => {
        wx.hideLoading();

        wx.showToast({
          title: "发表成功",
          icon: "success",
          duration: 1000,
        });

        const newComment = {
          ...res.data.data,
          createdAt: formatTime10(res.data.data.createdAt),
          user: {
            ...this.data.user,
            birthYear: formatTime12(Number(this.data.user.birthday || "0")),
          },
          replyUser: {
            id: this.data.replyTo?.userId,
            nickname: this.data.replyTo?.nickname,
          },
        };

        let updatedComments = [...that.data.post.comments];

        if (that.data.isReplying && this.data.replyTo) {
          const parentIndex = updatedComments.findIndex(
            (c) => c.id === newComment.parentCommentId
          );

          if (parentIndex !== -1) {
            const updatedParentComment = { ...updatedComments[parentIndex] };

            if (!updatedParentComment.subComments) {
              updatedParentComment.subComments = [];
            }

            updatedParentComment.subComments = [
              ...updatedParentComment.subComments,
              newComment,
            ];

            updatedComments[parentIndex] = updatedParentComment;
          } else {
            updatedComments = [newComment, ...updatedComments];
          }
        } else {
          updatedComments = [newComment, ...updatedComments];
        }

        that.setData({
          post: {
            ...that.data.post,
            comments: updatedComments,
            commentsCount: that.data.post.commentsCount + 1,
          },
          isReplying: false,
          replyTo: null,
          comment: "",
          commentImage: "",
        });
      })
      .catch((error) => {
        wx.hideLoading();
        Toast({
          message: "评论失败",
          duration: 1000,
        });
        console.error("发表评论失败:", error);
      });
  },
  onUserClick(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/publicProfile/index?userId=${id}`,
    });
  },
  onReply(e: any) {
    if (
      !this.data.user.nickname ||
      !this.data.user.avatar
    ) {
      Toast({
        message: "请先完善基本信息",
        duration: 1000,
        type: "info",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }
    const commentId = e.currentTarget.dataset.id;
    const nickname = e.currentTarget.dataset.nickname;
    const userId = e.currentTarget.dataset.userid;

    this.setData({
      replyTo: {
        commentId,
        nickname,
        userId,
      },
      isReplying: true,
    });
  },
  onReplyPost() {
    if (
      !this.data.user.nickname ||
      !this.data.user.avatar
    ) {
      Toast({
        message: "请先完善基本信息",
        duration: 1000,
        type: "info",
        onClose: () => {
          wx.navigateTo({
            url: "/pages/edit/index",
          });
        },
      });
      return;
    }
    this.setData({
      isReplying: true,
    });
  },
  cancelReply() {
    this.setData({
      isReplying: false,
      replyTo: null,
    });
  },
  // 预览图片
  previewImage(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url],
    });
  },
  // 预览帖子图
  previewPostImages(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.post.images,
    });
  },
  // 实现分享功能
  onShare() {
    // 显示分享面板
    wx.showActionSheet({
      itemList: ["分享给朋友", "分享到朋友圈"],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给朋友 - 使用小程序原生能力
          wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage"],
          });
        } else if (res.tapIndex === 1) {
          // 分享到朋友圈 - 使用小程序原生能力
          wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareTimeline"],
          });
        }
      },
    });
  },

  // 切换评论展开折叠状态
  toggleCommentExpand(e: any) {
    const commentId = e.currentTarget.dataset.id;
    const expandedComments = { ...this.data.expandedComments };

    // 切换展开状态
    if (expandedComments[commentId]) {
      delete expandedComments[commentId];
    } else {
      expandedComments[commentId] = true;
    }

    this.setData({
      expandedComments,
    });
  },

  openLocation(e: any) {
    const location = e.currentTarget.dataset.location;
    if (location && location.latitude && location.longitude) {
      wx.openLocation({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        name: location.name || "",
        address: location.address || "",
        scale: 18,
        success() {},
        fail(err) {
          console.error("打开位置失败", err);
          Toast("打开位置失败");
        },
      });
    } else {
      Toast("位置信息不完整，无法打开地图");
    }
  },
  // 选择图片方法
  chooseImage() {
    const that = this;
    if (this.data.commentImage) {
      wx.showToast({
        title: "只能上传一张图片",
        icon: "none",
      });
      return;
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success(res) {
        // 检查文件大小是否超过15MB
        const tempFile = res.tempFiles[0];
        const maxSize = 15 * 1024 * 1024; // 15MB

        if (tempFile.size > maxSize) {
          wx.showToast({
            title: "图片大小不能超过15MB",
            icon: "none",
            duration: 2000,
          });
          return;
        }

        that.setData({
          commentImage: tempFile.tempFilePath,
        });
      },
    });
  },

  // 删除选择的图片
  removeImage() {
    this.setData({
      commentImage: "",
    });
  },

  // 显示公众号关注弹窗
  showSubscribePopup() {
    this.setData({
      showSubscribePopup: true,
    });
  },

  // 隐藏公众号关注弹窗
  hideSubscribePopup() {
    this.setData({
      showSubscribePopup: false,
    });
  },
});
