$(document).ready(function () {
    wrap_DmVideoVs();
});

function wrap_DmVideoVs() {
    DmVideoGl.setPreVals();// 设置准备值
    DmVideoVs.startMethod();// 开始方法
}

var mapViCanPlay = new Map();// 视频能否播放Map(Key为:视频Id,Value为:是否能播放和提示信息属性)
var mapViTimeUpdate = new Map();// 视频播放时间轴变化Map(Key为:视频Id,Value为:时间轴变化属性)
var isAddingPlViRecord = false;// 是否正在增加会员播放视频记录

var DmVideoGl = (function (DmVideoGl) {

    // 设置准备值
    DmVideoGl.setPreVals = function () {
        var hr = location.href;
        var secId = "id=";
        var secTi = "title=";
        var secPo = "poster=";
        var secUr = "videoUrl=";
        if (!(hr && hr.indexOf(secUr) != -1 && hr.indexOf(secTi) != -1 && hr.indexOf(secPo) != -1)) {
            return;
        }

        $("#pa_videoWi").val(document.body.clientWidth);
        $("#pa_videoHi").val(document.body.clientHeight);

        var tmp = DmVideoVs.getSubRiSec(hr, "?");
        $("#pa_id").val(tmp.substring((tmp.indexOf(secId) + secId.length), tmp.indexOf("&")));

        tmp = DmVideoVs.getSubRiSec(tmp, "&");
        $("#title").text("Yoo视频直连-" + tmp.substring((tmp.indexOf(secTi) + secTi.length), tmp.indexOf("&")));

        tmp = DmVideoVs.getSubRiSec(tmp, "&");
        $("#pa_poster").val(tmp.substring(tmp.indexOf(secPo) + secPo.length, tmp.indexOf("&")));

        tmp = DmVideoVs.getSubRiSec(tmp, "&");
        $("#pa_url").val(tmp.substring(tmp.indexOf(secUr) + secUr.length, tmp.length));
    };

    // 获取视频宽度
    DmVideoGl.getVideoWi = function () {
        var result = "";
        var dom = $("#pa_videoWi");
        if (dom && dom.length > 0 && dom.val()) {
            result = dom.val() * 1;
        }
        return result;
    };

    // 获取视频高度
    DmVideoGl.getVideoHi = function () {
        var result = "";
        var dom = $("#pa_videoHi");
        if (dom && dom.length > 0 && dom.val()) {
            result = dom.val() * 1;
        }
        return result;
    };

    // 删除QueryString?后面的片段包括?
    DmVideoGl.getCleanUrl = function (url) {
        var result = "";
        if (url.indexOf("?") != -1) {
            result = url.substring(0, url.indexOf("?"));
        } else {
            result = url;
        }
        return result;
    };

    return DmVideoGl;
})(window.DmVideoGl || {});

var DmVideoGlInp = (function (DmVideoGlInp) {

    // [inp]检查会员是否可播放该视频
    DmVideoGlInp.ckIsCanPlay = function (videoId, sucCallBk, failCallBk) {
        var url = getActionByHz("action/hySe/prHyUserVi/ckIsCanPlayAjax?id=" + videoId + "&daType=jsonp");

        // 开始请求视频数据
        $.ajax({
            url: url,
            type: "get",
            dataType: "jsonp",
            jsonpCallback: "jpc",
            success: function (result) {
                sucCallBk && sucCallBk(result);
            },
            error: function (e) {
                failCallBk && failCallBk(e);
            }
        });
    };

    // [inp]增加会员播放视频记录
    DmVideoGlInp.addHyPlayViRecord = function (videoId, sucCallBk, failCallBk) {
        var url = getActionByHz("action/hySe/prHyUserVi/addPlayViRecordAjax?id=" + videoId + "&daType=jsonp");

        // 开始请求视频数据
        $.ajax({
            url: url,
            type: "get",
            dataType: "jsonp",
            jsonpCallback: "jpc",
            success: function (result) {
                sucCallBk && sucCallBk(result);
            },
            error: function (e) {
                failCallBk && failCallBk(e, videoId);
            }
        });
    };

    return DmVideoGlInp;
})(window.DmVideoGlInp || {});

var DmVideoVs = (function (DmVideoVs) {

    // 开始方法
    DmVideoVs.startMethod = function () {

        // 处理单个视频
        DmVideoVs.startClSinVideo();
    };

    // 获取右侧片段(根据分割符截取)
    DmVideoVs.getSubRiSec = function (str, fg) {
        return str.substring(str.indexOf(fg) + 1, str.length);
    };

    // 处理单个视频
    DmVideoVs.startClSinVideo = function () {
        var id = $.trim($("#pa_id").val());// 视频Id
        var viUrl = $.trim($("#pa_url").val());// 视频Url
        var videoWi = $.trim($("#pa_videoWi").val());// 指定视频的宽度
        var videoHi = $.trim($("#pa_videoHi").val());// 指定视频的高度
        var imagePath = $.trim($("#pa_poster").val());// 视频预览图

        var isMobile = browser.platform.mobile;// 是否为移动设备
        var locStkey = DmVideoGl.getCleanUrl(viUrl);// 本地储存Key
        var locStPoster = Storage.getItem(locStkey + "_poster");// 本地储存的Poster
        var locStViHeight = Storage.getItem(locStkey + "_viHeight");// 本地储存的视频高度

        var videoCls = "";// 视频Cls
        var videoWiNum = (videoWi ? videoWi : (isMobile ? DmVideoVs.getMobileViWiSec() : 380));
        var videoWiSec = "width:" + ((videoWiNum + "").indexOf("%") != -1 ? videoWiNum + ";" : videoWiNum + "px;");
        var videoHiNum = (videoHi ? videoHi : (isMobile ? DmVideoVs.getMobileViHiSec(locStViHeight) : 492));
        var videoHiSec = "height:" + ((videoHiNum + "").indexOf("%") != -1 ? videoHiNum + ";" : videoHiNum + "px;");

        var html = "";
        var poster = locStPoster ? locStPoster : imagePath;
        var posterSec = poster ? ("poster=" + poster) : "";
        var videoYsId = "yooVideo";
        var autoplaySec = "";

        html += " <video " + posterSec + " id=\"" + videoYsId + "\" vi-id=\"" + id + "\" style=\"" + videoWiSec + videoHiSec + "\" class=\"" + videoCls + "\" playsinline " + autoplaySec + " loop controls>" + "\n";
        html += "  <source src=\"" + viUrl + "\" type=\"video/mp4\" />" + "\n";
        html += " </video>" + "\n";

        // 附加视频
        $("body").append(html);

        // 取得视频
        var videoDom = $("#" + videoYsId);

        // 开始绑定Mp插件
        var mlpObj = DmVideoVs.startBindMp(videoYsId, videoDom);

        // 若没有poster的话->加载视频
        if (!poster) {
            mlpObj.load();
        }
        return videoDom;
    };

    // 开始绑定Mp插件
    DmVideoVs.startBindMp = function (videoYsId, videoDom) {

        // 定义,初始化
        var isIPhone = browser.platform.iPhone;// 是否为IPhone
        var pauseOtherPlayers = isIPhone ? true : false;

        // 绑定Mp
        return videoDom.mediaelementplayer({
            playText: "点击进行播放",
            iceFullScreenMod: "wefs",// 全屏模式(wefs:webkitEnterFullscreen(大全屏),cont:container(容器内(默认方式)))(这个属性是ice修改源码添加的)
            pauseOtherPlayers: pauseOtherPlayers,// 当播放一个视频时是否停止其他视频(PC有效)
            success: function (media) {

                // 添加数据播放准备好了事件
                media.addEventListener("play", function (e) {
                    var mediaTar = e.target;

                    var viDom = $(mediaTar).find("video");// 视频元素
                    var videoId = viDom.attr("vi-id");// 视频Id
                    $(viDom).attr("autobuffer", "autobuffer");

                    // 若没有视频Id->直接返回
                    if (!videoId || videoId == "undefined") {
                        return;
                    }

                    var viIdInt = videoId * 1;
                    var mvcpValue = mapViCanPlay.get(viIdInt);

                    // 更新单个视频点击播放开始的时间
                    var viTimeUpProp = mapViTimeUpdate.get(viIdInt);
                    if (viTimeUpProp && viTimeUpProp.stTime) {
                        viTimeUpProp.stTime = new Date();// 开始的时间
                    }

                    // 检查会员是否可以播放该视频
                    // 若有值说明检查过->直接判断能否播放即可
                    if (mvcpValue != undefined) {

                        // 若不能播放->暂停
                        if (!mvcpValue.isSuccess) {
                            mediaTar.pause();
                            alertVipLiSmPop("立即充值", mvcpValue.msg);
                            return;
                        }
                        return;
                    }

                    // [inp]检查会员是否可播放该视频
                    DmVideoGlInp.ckIsCanPlay(videoId, function (data) {
                        var isSuccess = data.isSuccess;

                        var prop = {
                            msg: data.messageContent,
                            isSuccess: isSuccess
                        };
                        mapViCanPlay.put(data.prHyUserViId, prop);

                        if (!isSuccess) {
                            mediaTar.pause();

                            var messageCode = data.messageCode;
                            if (messageCode == "mustCz") {
                                alertVipLiSmPop("立即充值", data.messageContent);
                            }
                        }
                    }, function () {
                    });
                }, false);

                // 添加时间轴变化事件
                media.addEventListener("timeupdate", function (e) {
                    var mediaTar = e.target;
                    var videoDom = $(mediaTar).find("video");
                    var videoDataId = videoDom.attr("vi-id");
                    var videoDataIdInt = videoDataId * 1;

                    var cuVideo = videoDom[0];
                    var cuPlTime = (cuVideo && cuVideo.currentTime);// 当前时间轴时间

                    if (!mapViTimeUpdate.get(videoDataIdInt)) {
                        var prop = {
                            stTime: new Date(),// 开始的时间
                            stPlTime: cuPlTime,// 开始的时间轴时间

                            // 是否已请求增加了会员播放视频记录
                            isRqAddedRecord: false
                        };
                        mapViTimeUpdate.put(videoDataIdInt, prop);
                    } else {
                        var value = mapViTimeUpdate.get(videoDataIdInt);
                        var stTime = value.stTime;// 开始的时间
                        var stPlTime = value.stPlTime;// 开始的时间轴时间

                        // 获取日期相差(秒数)
                        var cha = calcDateChaSeconds(stTime, new Date());

                        // console.info("[" + videoDataIdInt + "]cha:" + cha + ":cuPlTime != stPlTime:" + (cuPlTime != stPlTime) + "!isAddingPlViRecord:" + (!isAddingPlViRecord) + "!value.isRqAddedRecord:" + (!value.isRqAddedRecord));

                        // 若持续播放时间大于10秒,且当前时间轴时间和开始时的时间轴时间不同,且非正在增加会员播放视频记录,且未请求添加过会员播放视频记录->添加会员播放该视频的记录
                        if (cha > 10 && (cuPlTime != stPlTime) && !isAddingPlViRecord && !value.isRqAddedRecord) {
                            isAddingPlViRecord = true;

                            // [inp]增加会员播放视频记录
                            DmVideoGlInp.addHyPlayViRecord(videoDataIdInt, function (data) {

                                isAddingPlViRecord = false;

                                var isSuccess = data.isSuccess;

                                // 更新状态
                                var prHyUserViId = data.prHyUserViId;
                                var viTimeUpProp = mapViTimeUpdate.get(prHyUserViId);

                                if (!viTimeUpProp.isRqAddedRecord) {
                                    viTimeUpProp.isRqAddedRecord = true;
                                }

                                if (!isSuccess) {
                                    console.error(data.messageContent);
                                }
                            }, function (e, videoDataIdInt) {
                                isAddingPlViRecord = false;

                                // 更新状态
                                var viTimeUpProp = mapViTimeUpdate.get(videoDataIdInt);
                                if (!viTimeUpProp.isRqAddedRecord) {
                                    viTimeUpProp.isRqAddedRecord = true;
                                }
                            });
                        }
                    }
                }, false);
            },
            error: function (e) {
                console.error(e);
            }
        });
    };

    // 获取移动端视频宽度片段
    DmVideoVs.getMobileViWiSec = function () {
        var isMobile = browser.platform.mobile;// 是否为移动设备
        if (isMobile) {
            return "100%";
        }
    };

    // 获取移动端视频高度片段
    DmVideoVs.getMobileViHiSec = function (locStViHeight) {
        var isMobile = browser.platform.mobile;// 是否为移动设备
        if (isMobile) {
            if (locStViHeight) {
                return locStViHeight;
            } else {
                return document.body.clientHeight;
            }
        }
    };

    return DmVideoVs;
})(window.DmVideoVs || {});