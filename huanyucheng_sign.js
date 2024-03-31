/*
软件名称: 环宇城每日签到
更新时间：2024-03-31
脚本说明：每日签到，获得积分，可交停车费

圈X配置
[task_local]
# 环宇城每日签到
10 11 * * * huanyucheng_sign.js, tag=环宇城每日签到, enabled=true

[rewrite_local]
# 环宇城获取ck
https://m.mallcoo.cn/api/user/Bonus/GetBonusHistoryList url script-request-header alldragon_sign.js
*/

let item = {};
let $ = new Env();
let name = `环宇城签到`
//ck的key
let ckKey = 'hycCk';


function strTime(time = +new Date()) {
    let date = new Date(time + 8 * 3600 * 1000); // 增加8小时
    date = date.toJSON().substr(0, 19).replace('T', ' ');
    return date
}

// async function abc() {
//     let url = 'https://api.alldragon.com/msite/loginByToken.json'
//     let headers = {
//         'content-type': 'application/x-www-form-urlencoded',
//         'Accept-Encoding': 'gzip,compress,br,deflate',
//         'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN',
//     }
//     let form = 'token=0ff0e5d71f4d4e69b2af1c412c0fdd9c&tenantId=4052&tenantCode=njhyc&clientType=3'
//     let result = await get_page_data('', url, headers, 'post', form)
//     console.log(result)
// }

//
(async function () {
    // await abc()

    try{
        if(typeof $request !='undefined'){
            await getyxCK();
        }else{
            if ($.read(ckKey)==null){
                console.log(`没有Cookie ‼️`)
                console.log('请打开"xxx"->"xx"->"xx"\t获取Cookie')
                $.notify(`${name}`, ``,'请打开"xxx"->"xx"->"xx"获取Cookie')
                $.done();
            }else{
                await check_in();
                // await get_status();
            }

        }
    }catch (e){

    }finally {
        $.done();
    }

})()

//获取CK
function getyxCK() {
    try {
        if ($request.url.indexOf('GetBonusHistoryList') > -1) {
            // let cookie = $request.headers;
            let request_body = $request.body
            if (request_body != null) {
                // $.write(authorization, ckKey)

                // console.log(`request body: \n${request_body}`)
                let request_body_json =JSON.parse(request_body)
                let token = request_body_json['Header']["Token"]
                $.write(token, ckKey)
                $.notify(name, 'Token', token)
                // console.log(request_body_json['Header']["Token"])
                // console.log(request_body.toJSON())

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
    let url = 'https://m.mallcoo.cn/api/user/User/CheckinV2'
    let token = $.read(ckKey)
    // let token ="AXIQDuTfFkWRzMBf6GrBUwlP1uJnR7iE,17411"

    let headers = {
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x1800302b) NetType/WIFI Language/zh_CN',
        'Content-Type': 'application/json'
    }
    let body_json = {
        "MallID": 12804,
        "Header": {
            "Token": token,
            "systemInfo": {
                "model": "iPhone 12 Pro<iPhone13,3>",
                "SDKVersion": "3.3.5",
                "system": "iOS 17.4.1",
                "version": "8.0.48",
                "miniVersion": "2.67.5"
            }
        }
    }
    let body = JSON.stringify(body_json)
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
                    // console.log(data)
                    if (result.m == 1) {
                        // console.log('签到成功！')
                        let award_desc = result.d.Msg
                        console.log(`签到成功，${award_desc}`)
                        $.notify(name, strTime(),award_desc)
                    }
                    else if (result.m == 2054) {
                        // console.log('签到成功！')
                        let award_desc = result.d.Msg
                        console.log(`签到成功，${award_desc}`)
                        $.notify(name, strTime(),award_desc)}
                    else {
                        console.log(`${result.e} - ${strTime()}`)
                        $.notify(name, strTime(), `${result.e}`)
                    }
                }
            } catch (e) {
                console.log(`${name} 错误！${e}`)
                $.notify(`${name}`, `提交问卷错误`, e)
            } finally {
                resolve();
            }
        })
    })
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
