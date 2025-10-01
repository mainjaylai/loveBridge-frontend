import { get } from "./request";

export function getAllActivities() {
  return get("/activity/public");
}

export function getActivityDetail(id: string) {
  return get(`/activity/detail?activityId=${id}`);
}

export function getMyTrip() {
  return get("/user/joined-activities");
}
