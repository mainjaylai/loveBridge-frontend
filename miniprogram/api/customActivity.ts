import { post, del } from "./request";

export function createCustomActivity(data: object) {
  return post("/custom-activity/create", data);
}

export function editCustomActivity(data: object) {
  return post("/custom-activity/edit", data);
}

export function deleteCustomActivity(id: number) {
  return del(`/custom-activity/delete?activityId=${id}`);
}