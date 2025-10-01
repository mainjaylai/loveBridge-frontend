import { del, post, get } from "./request";

// 获取所有帖子列表
export function getAllPostList(page?: number, pageSize?: number) {
  return get(`/post/all?page=${page || 1}&pageSize=${pageSize || 15}`);
}

// 获取帖子详情
export function getPostDetail(postId: number) {
  return get(`/post/detail?postId=${postId}`);
}

// 创建帖子
export function createPost(data: any) {
  return post("/post/create", data);
}

// 删除帖子
export function deletePost(postId: number) {
  return del(`/post/delete?postId=${postId}`);
}

// 切换帖子状态
export function togglePostStatus(postId: number) {
  return post(`/post/toggle-like?postId=${postId}`);
}

// 不传userId时，默认获取自己的帖子
export function getPostsByUserId(userId?: number) {
  return get(`/post/user-posts?userId=${userId ? userId : "0"}`);
}

// 创建评论
export function createComment(data: any) {
  return post("/comment/create", data);
}

// 切换评论状态
export function toggleCommentStatus(commentId: number) {
  return post(`/comment/toggle-like?commentId=${commentId}`);
}

// 获取48小时热帖榜
export function getHotPosts() {
  return get("/post/hot");
}

// 搜索帖子
export function searchPosts(keyword: string) {
  return get(`/post/search?keyword=${keyword}`);
}
