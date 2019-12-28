import { loginByEmail, verifyToken, logout, getInfo } from 'api/login';
import { updateToken,getDocList, getUserList,uploadFormData, uploadDocData, submitForm, cacheRoomData } from 'service/index';
import Cookies from 'js-cookie';

const ClientToken = 'Session-Token';
const ClientUserData = 'UserData-Token';

const user = {
  state: {
    user: '',
    status: '',
    email: '',
    code: '',
    uid: undefined,
    auth_type: '',
    /**自动获取存储在Cookies中的Token数据*/
    token: Cookies.get(ClientToken),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    userData: Cookies.get(ClientUserData),
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_AUTH_TYPE: (state, type) => {
      state.auth_type = type;
    },
    SET_CODE: (state, code) => {
      state.code = code;
    },
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_UID: (state, uid) => {
      state.uid = uid;
    },
    SET_EMAIL: (state, email) => {
      state.email = email;
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction;
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting;
    },
    SET_STATUS: (state, status) => {
      state.status = status;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    LOGIN_SUCCESS: () => {
      console.log('login success')
    },
    LOGOUT_USER: state => {
      state.user = '';
    }
  },

  actions: {
    GetDocList({ commit, state },{limit,offset}) {
      return new Promise((resolve, reject) => {
        getDocList(state.token,limit,offset).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },
    UploadFormData({ commit, state }, formdata) {
      return new Promise((resolve, reject) => {
        uploadFormData(state.token, formdata).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },
    UploadDocData({ commit, state }, doc) {
      return new Promise((resolve, reject) => {
        uploadDocData(state.token, doc).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },
    CacheRoomData({ commit, state }, room) {
      return new Promise((resolve, reject) => {
        cacheRoomData(state.token, room).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },
    SubmitForm({ commit, state }, form) {
      return new Promise((resolve, reject) => {
        submitForm(state.token, form).then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },
    UpdateToken({ commit, state }) {
      return new Promise((resolve, reject) => {
        //console.log("[检查Token]", state.token);
        if (!state.token) resolve(5 * 60 * 60); else {
          updateToken(state.token).then(res => {
            let data = res.data;
            if (state.token != data.token) {
              console.log("[更新Token]" + state.token + "[新值]" + data.token);
            }
            //更新Token值
            Cookies.set(ClientToken, data.token);
            commit('SET_TOKEN', data.token);
            resolve(data.expiresIn)
          }).catch(err => {
            reject(err);
          })
        };
      })
    },
    /**验证Token有效性 */
    VerifyToken({ commit, state }) {
      return new Promise((resolve, reject) => {
        console.log("[验证Token有效性]", state.token);
        //直接返回无效
        if (state.token == null) resolve(false);
        else {
          verifyToken(state.token).then(res => {
            //console.log("[结果]",res);
            if (res.data.status == "ok") {
              resolve(true);
            } else {
              Cookies.remove(ClientToken);
              resolve(false);
            }
          }).catch(err => {
            reject(err);
          });
        }
      });
    },
    // 邮箱登录
    LoginByEmail({ commit }, userInfo) {
      console.log("[验证邮箱登录]", userInfo);
      //删除头尾空白字符串
      const email = userInfo.email.trim();
      return new Promise((resolve, reject) => {
        loginByEmail(email, userInfo.password).then(response => {
          const token = response.data;
          console.log("[获取服务端验证]", token);
          Cookies.set(ClientToken, token);
          commit('SET_TOKEN', token);
          commit('SET_EMAIL', email);
          resolve(token);
        }).catch(error => {
          reject(error);
        });
      });
    },
    GetUserList({ commit, state }, { pageSize = 5, current = 1, community_id = null }) {
      return new Promise((resolve, reject) => {
        //console.log("[获取列表]",pageSize,current);
        getUserList(state.token, pageSize, current, community_id).then(res => {
          //console.log("[获取用户列表]", res);
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        //console.log("[尝试获取用户信息]" + state.token);
        getInfo(state.token).then(response => {
          const data = response.data;
          commit('SET_ROLES', data.role);
          commit('SET_NAME', data.name);
          commit('SET_AVATAR', data.avatar);
          commit('SET_UID', data.uid);
          commit('SET_INTRODUCTION', data.introduction);
          resolve(response);
        }).catch(error => {
          reject(error);
        });
      });
    },

    // 第三方验证登录
    LoginByThirdparty({ commit, state }, code) {
      return new Promise((resolve, reject) => {
        commit('SET_CODE', code);
        loginByThirdparty(state.status, state.email, state.code, state.auth_type).then(response => {
          commit('SET_TOKEN', response.data.token);
          Cookies.set(ClientToken, response.data.token);
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    },


    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          console.log("[登出成功]");
          commit('SET_TOKEN', '');
          commit('SET_ROLES', []);
          Cookies.remove(ClientToken);
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '');
        Cookies.remove(ClientToken);
        alert("has logout");
        resolve();
      });
    },

    // 动态修改权限
    ChangeRole({ commit }, role) {
      return new Promise(resolve => {
        commit('SET_ROLES', [role]);
        commit('SET_TOKEN', role);
        Cookies.set(ClientToken, role);
        resolve();
      })
    }
  }
};

export default user;
