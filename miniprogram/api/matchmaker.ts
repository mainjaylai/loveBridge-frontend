import { get, put } from "./request";


export function getAllSingleUser(){
    return get("/matchmaker/single-users")
}

export function getSingleUser(id:string){
    return get(`/matchmaker/single-user-detail?id=${id}`)
}

export function getFilteredSingleUsers(filters: {
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    gender?: number;
    status?: number; // 0: 不限, 1: 在读, 2: 已工作
    education?: number; // 0: 不限, 1: 本科及以上, 2: 硕士及以上, 3: 博士及以上
    location?: string; // 现居地筛选，支持模糊匹配
    hometown?: string; // 家乡筛选，支持模糊匹配
}){
    let queryParams = [];
    
    if (filters.minAge) queryParams.push(`minAge=${filters.minAge}`);
    if (filters.maxAge) queryParams.push(`maxAge=${filters.maxAge}`);
    if (filters.minHeight) queryParams.push(`minHeight=${filters.minHeight}`);
    if (filters.maxHeight) queryParams.push(`maxHeight=${filters.maxHeight}`);
    if (filters.gender !== undefined) queryParams.push(`gender=${filters.gender}`);
    if (filters.status !== undefined && filters.status !== 0) queryParams.push(`status=${filters.status}`);
    if (filters.education !== undefined && filters.education !== 0) queryParams.push(`education=${filters.education}`);
    if (filters.location) queryParams.push(`location=${encodeURIComponent(filters.location)}`);
    if (filters.hometown) queryParams.push(`hometown=${encodeURIComponent(filters.hometown)}`);
    
    const queryString = queryParams.join('&');
    return get(`/matchmaker/single-users${queryString ? '?' + queryString : ''}`);
}

export function getSingleUserContactInfomation(id:string){
    return get(`/matchmaker/contact-information?id=${id}`)
}

export function getOwnSingleInformation(){
    return get('/matchmaker/own-single-information')
}

export function saveSingleInformation(data: any){
    return put('/matchmaker/own-single-information', data)
}

export function searchSingleUser(data: any){
    return get(`/matchmaker/search-single-users?keyword=${data}`)
}