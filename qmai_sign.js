/*
软件名称: 霸王茶姬每日签到
更新时间：2024-04-01
脚本说明：每日签到，获得积分

圈X配置
[task_local]
# 霸王茶姬每日签到
00 09 * * * qmai_sign.js, tag=霸王茶姬每日签到, enabled=true

[rewrite_local]
# 霸王茶姬获取ck
https://webapi.qmai.cn/web/catering/points/rules/v2 url script-request-header qmai_sign.js

*/

let item = {};
let $ = new Env();
let name = `霸王茶姬签到`;
//ck的key
let ckKey = 'qmaiCk';
// let Qm_User_Token = 'YWNUPw1iR1X8qbh28BHnl3ECk4dPWacU9uTUgpq4O_Y51dNY1XTHtY8nMzRzPi5c';
let Qm_User_Token = null
// let Qm_User_Token = 'BB7dyjgVpf6N0xBWpKvkenlWBhtFSTRHOV9sUnH2BYAU2mthlHQO1qkC4scgsm8I'


function strTime(time = +new Date()) {
    let date = new Date(time + 8 * 3600 * 1000); // 增加8小时
    date = date.toJSON().substr(0, 19).replace('T', ' ');
    return date
}

// (async function () {
//     let old_points = await get_status()
//     console.log(`积分：${old_points}`)
// })()

//
(async function () {
    // await abc()

    try {
        if (typeof $request != 'undefined') {
            await getyxCK();
        } else {
            if ($.read(ckKey) === null && Qm_User_Token === null) {
                console.log(`没有Cookie ‼️`)
                console.log('请打开"霸王茶姬小程序"->"我的"->"积分"->"积分规则"\t获取Cookie')
                $.notify(`${name}`, ``, '请打开"积分规则"获取Cookie')
                $.done();
            } else {
                // await check_in();

                let old_points = await get_status();
                if(typeof old_points === 'number') {
                    await check_in();
                    let new_points = await get_status();
                    console.log(`积分变化：${old_points} -> ${new_points}`)
                    $.notify(`${name}`, `${old_points}分 -> ${new_points}分`)
                }else{
                    console.log(old_points)
                    $.notify(`${name}`, `${old_points}`)
                }
            }

        }
    } catch (e) {

    } finally {
        $.done();
    }

})()

//获取CK
function getyxCK() {
    try {
        if ($request.url.indexOf('v2') > -1) {
            // $.notify('here')
            // let cookie = $request.headers;
            Qm_User_Token = $request.headers['Qm-User-Token']
            if (Qm_User_Token != null) {
                $.write(Qm_User_Token, ckKey)
                $.notify(name, 'Qm-User-Token', Qm_User_Token)
            } else {
                $.notify(`${name}`, `未获取到Cookie`);
            }
        }
    } catch (e) {
        $.notify(`${name}`, '获取cookie错误', e);
    } finally {
        $.done();
    }
}

function check_in() {
    // console.log('--> 开始签到 <--');
    let url = 'https://webapi.qmai.cn/web/catering/integral/sign/signIn'
    if (Qm_User_Token == null) Qm_User_Token = $.read(ckKey)

    let headers = {
        // 'Qm_User_Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcXFfYXV0aCIsIm9wZW5JZCI6Im9xMDBSNVpnSFdtOG1vUEtmTTIxX2Z0MGQzTzAiLCJleHAiOjE2MzY4MDQyMTQsImlhdCI6MTYzNjE5OTQxNCwibWVtYmVySWQiOiIxMTAxODAzMDAxNDAxNTMifQ.uTNs2GZxhZVKHlVRHZFjpYHAfRDkDEiP9G79zETzhM0',
        'Qm-User-Token': Qm_User_Token,
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40(0x1800282c) NetType/4G Language/zh_CN',
        'Content-Type': 'application/json',
        'Qm-From': 'wechat',
    }
    let body = '{"activityId":"100820000000000686","mobilePhone":"13675112299","userName":"杨磊","appid":"wxafec6f8422cb357b"}'
    let myRequest = {
        url: url,
        headers: headers,
        body: body,
        gzip: true
    }
    return new Promise(resolve => {
        $.post(myRequest, (error, resp, data) => {
            try {
                if (error) {
                    throw new Error(error)
                } else {
                    let result = JSON.parse(data);
                    // console.log(result)
                    let message = result.message
                    if (result.status === true && result.code === 0) {
                        // console.log('签到成功！')

                        console.log(`签到成功，${message}`)
                        resolve(`签到成功，${message}`)
                        // $.notify(name, send_time, `获得${award_desc}`)
                    } else {
                        console.log(`签到不成功，${message}`)
                        resolve(`签到不成功，${message}`)
                        // $.notify(name, strTime(), `${result.msg}`)
                    }
                }
            } catch (e) {
                console.log(`错误！${e}`)
                // $.notify(`${name}`, `提交问卷错误`, e)(
                resolve(`错误！${e}`)
            } finally {
                resolve();
            }
        })
    })
}

function get_status() {
    let url = 'https://webapi.qmai.cn/web/cmk-center/common/getCrmAvailablePoints'
    if (Qm_User_Token == null) Qm_User_Token = $.read(ckKey)
    let headers = {
        'Qm-User-Token': Qm_User_Token,
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x1800302b) NetType/WIFI Language/zh_CN',
        'content-type': 'application/json',
        'Qm-From': 'wechat',
        // 'store-id':49006,
        // 'Qm-From-Type':'catering',
        // 'Accept':'v=1.0'
    }
    let time_str = /\d{4}-\d{2}/gm.exec(strTime())[0];

    let myRequest = {
        url: url,
        headers: headers,
        gzip: true
    }
    return new Promise(resolve => {
        $.get(myRequest, (error, resp, data) => {
            try {
                if (error) {
                    throw new Error(error)
                } else {
                    let result = JSON.parse(data);
                    if (result.status === true && result.code === 0) {
                        let points = result.data
                        // console.log(`积分 ${points} 分`)
                        resolve(points)
                    } else {
                        console.log(result.message)
                        resolve(result.message)
                    }

                }
            } catch (e) {
                console.log(`${name} 错误！`)
                $.notify(`${name}`, `获取积分错误`, e)
                resolve('获取积分错误')
            } finally {
                resolve();
            }
        })
    })
}

async function get_page_data(title = 'test visit', url = '', headers = '', method = 'get', form = {},) {
    let myRequest = {
        'url': url,
        'headers': headers
    }
    if (method === 'get') {
        return new Promise((resolve, reject) => {
            setTimeout(() => $.get(myRequest, (error, resp, data) => {
                try {
                    if (error) {
                        throw new Error(error)
                    } else {
                        if (resp.statusCode === 200 || resp.status === 200) {
                            resolve(JSON.parse(data))
                        } else {
                            resolve(`${title} failed`)
                        }
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    // console.log(`${title} - finished`)
                }
            }), 500)
        })
    } else if (method === 'post') {
        myRequest['body'] = form
        return new Promise((resolve, reject) => {
            setTimeout(() => $.post(myRequest, (error, resp, data) => {
                try {
                    if (error) {
                        throw new Error(error)
                    } else {
                        if (resp.statusCode === 200 || resp.status === 200) {
                            resolve(JSON.parse(data))
                        } else {
                            console.log(data)
                            resolve(`${title} failed`)
                        }
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    // console.log(`${title} - finished`)
                    // $.wait(1000)
                }
            }), 500)
        })
    }
}

function Env() {
    const start = Date.now()
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const isLoon = typeof $loon != "undefined"
    const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
    const isNode = typeof require == "function" && !isJSBox;
    const NodeSet = 'CookieSet.json'
    const node = (() => {
        if (isNode) {
            const request = require('request');
            const fs = require("fs");
            return ({
                request,
                fs
            })
        } else {
            return (null)
        }
    })()
    const notify = (title, subtitle, message, rawopts) => {
        const Opts = (rawopts) => { //Modified from https://github.com/chavyleung/scripts/blob/master/Env.js
            if (!rawopts) return rawopts
            if (typeof rawopts === 'string') {
                if (isLoon) return rawopts
                else if (isQuanX) return {
                    'open-url': rawopts
                }
                else if (isSurge) return {
                    url: rawopts
                }
                else return undefined
            } else if (typeof rawopts === 'object') {
                if (isLoon) {
                    let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                    let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                    return {
                        openUrl,
                        mediaUrl
                    }
                } else if (isQuanX) {
                    let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                    let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                    return {
                        'open-url': openUrl,
                        'media-url': mediaUrl
                    }
                } else if (isSurge) {
                    let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                    return {
                        url: openUrl
                    }
                }
            } else {
                return undefined
            }
        }
        // console.log(`${title}\n${subtitle}\n${message}`)
        if (isQuanX) $notify(title, subtitle, message, Opts(rawopts))
        if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts))
        if (isJSBox) $push.schedule({
            title: title,
            body: subtitle ? subtitle + "\n" + message : message
        })
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
        if (isNode) {
            try {
                if (!node.fs.existsSync(NodeSet)) node.fs.writeFileSync(NodeSet, JSON.stringify({}));
                const dataValue = JSON.parse(node.fs.readFileSync(NodeSet));
                if (value) dataValue[key] = value;
                if (!value) delete dataValue[key];
                return node.fs.writeFileSync(NodeSet, JSON.stringify(dataValue));
            } catch (er) {
                return AnError('Node.js持久化写入', null, er);
            }
        }
        if (isJSBox) {
            if (!value) return $file.delete(`shared://${key}.txt`);
            return $file.write({
                data: $data({
                    string: value
                }),
                path: `shared://${key}.txt`
            })
        }
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
        if (isNode) {
            try {
                if (!node.fs.existsSync(NodeSet)) return null;
                const dataValue = JSON.parse(node.fs.readFileSync(NodeSet))
                return dataValue[key]
            } catch (er) {
                return AnError('Node.js持久化读取', null, er)
            }
        }
        if (isJSBox) {
            if (!$file.exists(`shared://${key}.txt`)) return null;
            return $file.read(`shared://${key}.txt`).string
        }
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    const get = (options, callback) => {
        // options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
        if (isQuanX) {
            if (typeof options == "string") options = {
                url: options
            }
            options["method"] = "GET"
            //options["opts"] = {
            //  "hints": false
            //}
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) {
            options.headers['X-Surge-Skip-Scripting'] = false
            $httpClient.get(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (isNode) {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (isJSBox) {
            if (typeof options == "string") options = {
                url: options
            }
            options["header"] = options["headers"]
            options["handler"] = function (resp) {
                let error = resp.error;
                if (error) error = JSON.stringify(resp.error)
                let body = resp.data;
                if (typeof body == "object") body = JSON.stringify(resp.data);
                callback(error, adapterStatus(resp.response), body)
            };
            $http.get(options);
        }
    }
    const post = (options, callback) => {
        // options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
        // if (options.body) options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if (isQuanX) {
            if (typeof options == "string") options = {
                url: options
            }
            options["method"] = "POST"
            //options["opts"] = {
            //  "hints": false
            //}
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) {
            options.headers['X-Surge-Skip-Scripting'] = false
            $httpClient.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (isNode) {
            node.request.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (isJSBox) {
            if (typeof options == "string") options = {
                url: options
            }
            options["header"] = options["headers"]
            options["handler"] = function (resp) {
                let error = resp.error;
                if (error) error = JSON.stringify(resp.error)
                let body = resp.data;
                if (typeof body == "object") body = JSON.stringify(resp.data)
                callback(error, adapterStatus(resp.response), body)
            }
            $http.post(options);
        }
    }
    const AnError = (name, keyname, er, resp, body) => {
        if (typeof (merge) != "undefined" && keyname) {
            if (!merge[keyname].notify) {
                merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`
            } else {
                merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`
            }
            merge[keyname].error = 1
        }
        return console.log(`\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/\"line\"/) ? `\n‼️行列: ${JSON.stringify(er)}` : ``}${resp && resp.status ? `\n‼️状态: ${resp.status}` : ``}${body ? `\n‼️响应: ${resp && resp.status != 503 ? body : `Omit.`}` : ``}`)
    }
    const time = () => {
        const end = ((Date.now() - start) / 1000).toFixed(2)
        return console.log('\n签到用时: ' + end + ' 秒')
    }
    const done = (value = {}) => {
        if (isQuanX) return $done(value)
        if (isSurge) isRequest ? $done(value) : $done()
    }
    const wait = async (t) => {
        return new Promise(e => setTimeout(e, t))
    }

    return {
        AnError,
        isRequest,
        isJSBox,
        isSurge,
        isQuanX,
        isLoon,
        isNode,
        notify,
        write,
        read,
        get,
        post,
        time,
        done,
        wait
    }
};
