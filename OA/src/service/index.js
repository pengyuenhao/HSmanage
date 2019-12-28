import fetch from 'utils/fetch';

export function getUserList(token, pageSize, current, community_id) {
  return fetch({
    headers: {
      'Authorization': token
    },
    url: "/token/user/list",
    method: "get",
    params: {
      limit: pageSize,
      current: current,
      community_id: community_id
    }
  });
}

/**获取用户数据 */
export function getUserData(token) {
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token
    },
    url: '/token/user/data',
    method: 'get',
  });
}

/**更新Token */
export function updateToken(token) {
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token
    },
    url: '/token/update',
    method: 'get',
  });
}
/**提交表单 */
export function submitForm(token, form) {
  console.log("[提交表单]", form);
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token
    },
    url: '/token/submit',
    method: 'post',
    data: { form }
  });
}

/**更新Token */
export function cacheRoomData(token, room) {
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token
    },
    url: '/token/cache',
    method: 'post',
    data: room
  });
}


/**上传表单 */
export function uploadFormData(token,formdata) {
  //console.log("[上传表单]",formdata)
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token,
      'Content-Type': 'multipart/form-data'
      //'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`
    },
    url: 'token/formdata/upload',
    method: 'post',
    data: formdata
  });
}

/**上传文档 */
export function uploadDocData(token,doc) {
  //console.log("[上传表单]",formdata)
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token,
    },
    url: 'token/doc/upload',
    method: 'post',
    data: doc
  });
}

/**获取用户数据 */
export function getDocList(token,limit,offset) {
  //向服务器请求用户数据
  return fetch({
    headers: {
      'Authorization': token
    },
    url: '/token/doc/list',
    method: 'post',
    data:{limit,offset}
  });
}
