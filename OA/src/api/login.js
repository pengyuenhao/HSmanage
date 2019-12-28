import fetch from 'utils/fetch';

/**通过Email信息换取登录凭证 */
export function loginByEmail(email, password) {
  const data = {
    email,
    password
  };
  return fetch({
    url: '/login/loginbyemail',
    method: 'post',
    data
  });
}
/**验证Token有效性 */
export function verifyToken(token){
  return fetch({
    headers:{
      'Authorization': token
    },
    url: '/token/verify',
    method: 'get',
  });
}

export function logout(token) {
  return fetch({
    headers:{
      'Authorization': token
    },
    url: '/token/logout',
    method: 'get'
  });
}
/**获取用户信息 */
export function getInfo(token) {
  //向服务器请求用户信息
  return fetch({
    headers:{
      'Authorization': token
    },
    url: '/token/info',
    method: 'get',
  });
}