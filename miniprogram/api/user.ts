import { get, put, post, uploadFile } from "./request";

export function login(code: string) {
  return get(`/user/login-or-register?code=${code}`);
}

export function getUserInfo() {
  return get("/user/info");
}

export function updateUserInfo(data: any) {
  return put("/user/update-info", data);
}

export function submitFeedback(data: any) {
  return post("/user/submit-question", data);
}

export function uploadUserImage(filePath: string) {
  return uploadFile("/user/upload-images", filePath);
}

export function getInviteImage(activityId?: number) {
  if (activityId) {
    return get(`/user/invite-image?activityId=${activityId}`);
  } else {
    return get(`/user/invite-image`);
  }
}

export function getInviteInfo() {
  return get("/user/invite-info");
}

export function getUserInfoById(userId: number) {
  return get(`/user/other-info?userId=${userId}`);
}

// 切换关注状态（关注/取消关注）
export function toggleFollow(userId: number) {
  return post(`/user/toggle-follow?userId=${userId}`);
}

export function getFollowList() {
  return get(`/user/follow-lists`);
}


export function getTestUserList() {
  return get(`/user/all-test-users`);
}

export function switchTestUser(userId: number) {
  return get(`/user/switch-user?userId=${userId}`);
}

export function getMoneyRecord() {
  return get(`/manager/detail-money-record`);
}