
/*
var _gaq=[['_setAccount','UA-42485850-1'],['_trackPageview', '/our-contact']];
(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
s.parentNode.insertBefore(g,s)}(document,'script'));
//*/


var keyNavEnable = true;
var contentSliderOption = {mode:'horizontal', controls:false, pager:false, touchEnabled:false, infiniteLoop:false, startSlide:0};

var sectionContainerSlider;
var sectionContainerSliderOption;
var sectionPageSliders = [];
var sectionSlideHandles = [];
var sections;
var isRegistered = false;

var popupRegisterHtml;
var popupThankHtml;
var popupVideoHtml;
var popupThankCloseTimeout;

var delayHomeSliderStartAutoAfterPagerClick;
var homeSlider;
var homeSliderOption;
var showcase360panorama;



function Controller(selector, pathNames){
    this.sel = selector;
    this.pathNames = pathNames;
    return this;
}
Controller.prototype = {
    processPathNames : function(pathNames, value){
        var ret = false;
        ret = pathNames[0] == this.pathNames;
        var _this = this;
        if(ret){
            $.each(controllers, function(ind,ele){
                if(_this == ele){ 
                    if(!$(ele.sel).is(':visible')){
                        ele.show();
                    }
                }else{
                    if($(ele.sel).is(':visible')){
                        ele.hide();
                    }
                }   
            });
        }
        return ret;
    },
    onLoad : function() {
    },
    show : function(){ 
        this.onShow();
        $(this.sel).show();
        this.onShown();
        $(window).trigger('resize');
    },
    hide : function(){ 
        this.onHide();
        $(this.sel).hide();
        this.onHidden();
    },
    onShow : function() {
        $(window).on('resize', this, this._onResize);
    },
    onShown : function() {},
    onHide : function() { 
    },
    onHidden : function() {},
    onResize : function() {},
    _onResize : function(evt) {  evt.data.onResize(); }
};
  
function SliderContentController(sel, pathNames){
    this.sliderOption = $.extend({}, contentSliderOption);
}
SliderContentController.prototype = $.extend(Object.create(Controller.prototype), {
    _base_proto : Controller.prototype,
    
    processPathNames : function(pathNames, value){
        var ret = this._base_proto.processPathNames.call(this, pathNames, value);
        if(ret){
            var toslide = this.subadrs.indexOf(value);
            if(toslide >= 0) this.slider.goToSlide(toslide);   
        }
        return ret;
    },
    onSliderKeyDown : function onSliderKeyDown(evt){
        if(!keyNavEnable)return;
        var keys = {38:"up",40:"down",37:"left",39:"right"};
        switch(keys[evt.keyCode]){
            case "left":
                evt.data.slider.goToPrevSlide();
                return false;
                break;
            case "right":
                evt.data.slider.goToNextSlide();
                return false;
                break;
            default:
                break;
        }
    },
    onLoad : function() {
        var _this = this;
        this._base_proto.onLoad.call(this);  
        this.sliderOption.onSlideAfter =  function($slideElement, oldIndex, newIndex){ 
            $.address.value(_this.subadrs[newIndex]);
        };
        this.slider = $(this.slidersel).bxSlider(this.sliderOption);
        this.slider.goToSlide(0, 'reset');
    },
    onShow : function() {
        this._base_proto.onShow.call(this);  
    },
    onShown : function() {
        this._base_proto.onShown.call(this);  
        $(document).on('keydown', this, this.onSliderKeyDown);
    },
    onHide : function() {
        this._base_proto.onHide.call(this);   
        $(document).off('keydown', this.onSliderKeyDown);
    },
    onHidden : function() {
        this._base_proto.onHidden.call(this);
        this.slider.goToSlide(0, 'reset');
    },
    onResize : function() {
        this._base_proto.onResize.call(this); 
        this.slider.redrawSlider();
    }
});

function AboutController(sel, pathNames){
    this.sel = '#mainContainer #about';
    this.pathNames = 'about';
    this.slidersel = '#about .slider';
    this.subadrs = ['/about/what-define-us', '/about/what-we-do', '/about/how-we-work'];
    this.subsels = ['#what-define-us', '#what-we-do', '#how-we-work'];
    this.sliderOption = $.extend({}, contentSliderOption);
    return this;
}
AboutController.prototype = $.extend(Object.create(SliderContentController.prototype), {});

function PlatformController(sel, pathNames){
    this.sel = '#mainContainer #platform';
    this.pathNames = 'platform';
    this.slidersel = '#platform .slider';
    this.subadrs = ['/platform/branding', '/platform/web-development', '/platform/integrated-communication'];
    this.subsels = ['#platform-branding', '#platform-web-development', '#platform-integrated-communication'];
    this.sliderOption = $.extend({}, contentSliderOption);
    return this;
}
PlatformController.prototype = $.extend(Object.create(SliderContentController.prototype), {});

function FoliosController(sel, pathNames){
    this.sel = '#mainContainer #folios';
    this.pathNames = 'folios';
    return this;
}
FoliosController.prototype = $.extend(Object.create(Controller.prototype), {
    _base_proto : Controller.prototype,
    onLoad : function() {
        /*folios*/
        var foliosanim1delay = new TimelineMax({paused:true});
        var foliosanim1 = new TimelineMax({paused:true});
        var foliosanim2delay = new TimelineMax({paused:true});
        var foliosanim2 = new TimelineMax({paused:true});
        var total = $(".folios_page>div").length;
        var loaded = 0;

       function preloadFoliosImage() {
           if(total == loaded){
               startFoliosAnimation();
                return;   
           }

            var imgs = [];
            $(".folios_page>div").each(function(ind,ele){
                var backgroundimage = $(ele).css('background-image');
                var reg = /url\((.+?)\)/;
                var m = reg.exec(backgroundimage);
                var img = new Image();
                var _this = $(this);

                img.onload = function() {
                    loaded++;
                    imgs.push({'ele':_this, 'img':img});
                    if(loaded >= total){
                        onPreloadedFoliosImage(imgs);
                    }
                }
                img.src = m[1];
            });   
        }
        function onPreloadedFoliosImage(imgs) {

            $.each(imgs, function(ind,preloadobj){
                var obj = Filters.filterImage(Filters.grayscale, preloadobj.img);

                //preloadobj.ele.css('width', parseInt(preloadobj.ele.css('width')) + 1 + 'px');
                //preloadobj.ele.css('height', parseInt(preloadobj.ele.css('height')) + 1 + 'px');
                var style = "left:0px; top:0px; width:"+preloadobj.ele.css('width')+"; height:"+preloadobj.ele.css('height')+"; background-image:url("+obj.canvas.toDataURL("image/png")+")";
                preloadobj.ele.empty();
                preloadobj.ele.append($("<div class='grayscale' style='"+style+"';></div>"));
            });//*/
            startFoliosAnimation();
        }
        function startFoliosAnimation() {
            var isinitcycle = true;
            var pagedelay = 2;
            var pagedelay2 = 1.5;
            var alphatweendelay = 0.1;
            var randomdelayk = 0.3;
            var tweenduration = 0.7;
            var leftdelayk = 0.0040;
            var pagewidth = 320;


            TweenMax.to($(".folios_page"), 0, {perspective:2000});

            foliosanim1delay.insert(TweenMax.to({x:0}, pagedelay, {x:0}));
            foliosanim1delay.append(TweenMax.delayedCall(0, function(){
                console.log("foliosanim1.restart");
                foliosanim1.restart();
            }));

            foliosanim1.insert(TweenMax.delayedCall(0, function(){ 
                console.log("foliosanim1 started");
                $("#folios_page1").show(); 
                $("#folios_page1").css("pointer-events", "visible");
                $("#folios_page2").css("pointer-events", "none");
                if(isinitcycle){
                    TweenMax.set($("#folios_page2>div"), {alpha:0});
                    TweenMax.set($("#folios_page1>div"), {alpha:0});
                }
                $("#folios_page2>div").unbind('mouseover mouseout');
                $("#folios_page2").unbind('mouseover mouseout'); 
            }));
            $("#folios_page2>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:1}, {alpha:0}), (pagewidth-left)*leftdelayk + randomdelay + alphatweendelay);
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:0}, {rotationY:-180, transformOrigin:"center center"}), (pagewidth-left)*leftdelayk + randomdelay);
            });

            $("#folios_page1>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:0}, {alpha:1, ease:Quad.easeIn}), pagedelay2 + 0.5 + left*leftdelayk + randomdelay + alphatweendelay);
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:-200}, {rotationY:0, transformOrigin:"center center"}), pagedelay2 + 0.5 + left*leftdelayk + randomdelay);
            });
            foliosanim1.append(TweenMax.delayedCall(0, function(){
                console.log("foliosanim2delay restart");
                foliosanim2delay.restart();
                $("#folios_page1>div").hover(function(){
                        foliosanim2delay.pause();
                });
                $("#folios_page1").hover(
                    function(){
                        foliosanim2delay.pause();
                    }, 
                    function(){
                        foliosanim2delay.resume();
                    }
                );
            }));

            foliosanim2delay.insert(TweenMax.to({x:0}, pagedelay, {x:0}));
            foliosanim2delay.append(TweenMax.delayedCall(0, function(){
                console.log("foliosanim2 restart");
                foliosanim2.restart();
            }));

            foliosanim2.insert(TweenMax.delayedCall(0, function(){ 
                console.log("foliosanim2 started");
                $("#folios_page2").show(); 
                $("#folios_page1").css("pointer-events", "none");
                $("#folios_page2").css("pointer-events", "visible");
                $("#folios_page1>div").unbind('mouseover mouseout');
                $("#folios_page1").unbind('mouseover mouseout');
            }));
            $("#folios_page1>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:1}, {alpha:0}), left*leftdelayk + randomdelay + alphatweendelay);
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:0}, {rotationY:180, transformOrigin:"center center"}), left*leftdelayk + randomdelay);
            });

            $("#folios_page2>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:0}, {alpha:1, ease:Quad.easeIn}), pagedelay2 + (pagewidth-left)*leftdelayk + randomdelay + alphatweendelay);
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:200}, {rotationY:0, transformOrigin:"center center"}), pagedelay2 + (pagewidth-left)*leftdelayk + randomdelay);
            });

            foliosanim2.append(TweenMax.delayedCall(0, function(){
                console.log("foliosanim1delay restart");
                isinitcycle = false;
                foliosanim1delay.restart();
                $("#folios_page2>div").hover(function(){
                    foliosanim1delay.pause();
                });
                $("#folios_page2").hover(
                    function(){
                        console.log("folios_page2 hover");
                        foliosanim1delay.pause();
                    }, 
                    function(){
                        console.log("folios_page2 hover");
                        foliosanim1delay.resume();
                    }
                );
            }));

            foliosanim1.restart();
        }
        function stopFoliosAnimation() {
            foliosanim1delay.kill();
            foliosanim1.kill();
            foliosanim2delay.kill();
            foliosanim2.kill();
        }
        FoliosController.prototype.onShow = function(){
            this._base_proto.onShow.call(this);  
            preloadFoliosImage();
        };
        FoliosController.prototype.onHide = function(){
            stopFoliosAnimation();
        };
    }
});

function CrewController(sel, pathNames){
    this.sel = '#mainContainer #crew';
    this.pathNames = 'crew';
    return this;
};
CrewController.prototype = $.extend(Object.create(Controller.prototype), {
    _base_proto : Controller.prototype,
    onLoad : function() {
        var highlightCrewIndex = -1;
        var $crew = $('#crew1,#crew2,#crew3,#crew4,#crew5,#crew6');
        $crew.each(function(ind,ele){
            $detail = $(this).find('.crewDetail');
            if($detail.length == 0){
                $(this).click(function(){
                    setHighlightCrew(-1);
                });
            }else{
                $(this).click(function(){
                    var index = parseInt($(this).attr('id').substring(4));
                    var top = $(this).position().top;
                    setHighlightCrew(index-1);
                    //$('#crew').stop(true).animate({scrollTop:top},500);
                });
            }
        });

        function setHighlightCrew(index,a){
            highlightCrewIndex = index;
            $crew.each(function(ind,ele){
                if(index!=-1){
                    if(ind==index){
                        $(this).addClass('selected');
                        $(this).removeClass('others');

                    }else{
                        $(this).removeClass('selected');
                        $(this).addClass('others');
                    }
                }else{
                    $(this).removeClass('selected');
                    $(this).removeClass('others');
                }
            });
        }   
    }
});
function ContactController(sel, pathNames){
    this.sel = '#mainContainer #contact';
    this.pathNames = 'contact';
    return this;
}
ContactController.prototype = $.extend(Object.create(Controller.prototype), {


});



var controllers = {
    about:new AboutController(),
    platform:new PlatformController(),
    folios:new FoliosController(),
    crew:new CrewController(),
    contact:new ContactController(),
    goapp:new Controller('#mainContainer #home', 'goapp')
};
//*/


$(document).ready(function(){
    $("#mainContainer nav ul").slideUp(0);
    $("#mainContainer nav .navbtn").click(function(evt){
        var hidden = $("#mainContainer nav ul").is(":hidden"); 
        if(hidden){
            $("#mainContainer nav ul").slideDown(0); 
        }else{
            $("#mainContainer nav ul").slideUp(0);    
        }
    });
    $("#mainContainer nav a").click(function(evt){
       $("#mainContainer nav ul").slideUp(0);   
    });


    
    function initHome() {        
        /* header */


        /* sections */
        sections = $("#goSlider .section");
        $("#goContainer").fadeIn();
        section_content_containers = {};
        sections.each(function(ind,ele){
            var key = $(ele).attr('data-slideindex');
            var val = $(ele).find('.section_content_container');
            section_content_containers[key] = val;
        });
        sectionSlideHandles = {
            0:onSectionHomeSlide,
            5:onSection360Slide
        };
        sectionLogonHandles = {
            5:onSection360Logon   
        }
        var sectionKeyNavEnable = true;

        sectionContainerSliderOption = {
            mode:'horizontal',
            controls:true, pager:false, touchEnabled:false, startSlide:0,
            onSlideBefore:function($slideElement, oldIndex, newIndex){ 
                var f = sectionSlideHandles[newIndex];
                if(f){
                    f("willSlideTo"); 
                }
                commonSlideHandle("willSlideTo", $slideElement, oldIndex, newIndex);
                f = sectionSlideHandles[oldIndex];
                if(f){
                    f("willSlideFrom");   
                }
                commonSlideHandle("willSlideFrom", $slideElement, oldIndex, newIndex);
            },
            onSlideAfter:function($slideElement, oldIndex, newIndex){ 
                var f = sectionSlideHandles[newIndex];
                if(f){
                    f("didSlideTo");   
                }
                commonSlideHandle("didSlideTo", $slideElement, oldIndex, newIndex);
                f = sectionSlideHandles[oldIndex];
                if(f){
                    f("didSlideFrom");   
                }
                commonSlideHandle("didSlideFrom", $slideElement, oldIndex, newIndex);
            }
        };
        function commonSlideHandle(type, $slideElement, oldIndex, newIndex){
            switch(type){
                case "willSlideTo": 
                    if(newIndex != 0){
                        section_content_containers[newIndex].css("overflow", "auto");
                        section_content_containers[newIndex].scrollTop(0);
                        $("#fb-btn, #tw-btn").removeClass("bright");      
                    }
                    break;
                case "didSlideTo":

                    break;
                case "willSlideFrom":
                    section_content_containers[oldIndex].css("overflow", "hidden");
                    break;
                case "didSlideFrom":
                    section_content_containers[oldIndex].scrollTop(0);
                    break;
            }
        }

        sectionContainerSlider = $("#goContainer>.sliderContainer>ul.slider").bxSlider(sectionContainerSliderOption);
        sectionContainerSlider.parent().parent().find(".bx-controls-direction").hide();  

        $(document).keydown(function(evt){
            if(!sectionKeyNavEnable)return;
            var keys = {38:"up",40:"down",37:"left",39:"right"};
            switch(keys[evt.keyCode]){
                case "left":
                    sectionContainerSlider.goToPrevSlide();
                    return false;
                    break;
                case "right":
                    sectionContainerSlider.goToNextSlide();
                    return false;
                    break;
                default:
                    break;
            }
        });

        $('a.section_down_btn').click(function(){
            openRegisterPopup();
        });


        /* Section Home */
        function onSectionHomeSlide(type){
            var sectionControl = sectionContainerSlider.parent().parent().find(".bx-controls-direction");
            switch(type){
                case "willSlideTo":    
                    homeSlider.goToSlide(0, 'reset');
                    sectionControl.fadeOut();   
                    break;
                case "didSlideTo":
                    homeSlider.startAuto();
                    break;
                case "willSlideFrom":
                    if(delayHomeSliderStartAutoAfterPagerClick) clearTimeout(delayHomeSliderStartAutoAfterPagerClick);
                    homeSlider.stopAuto();
                    sectionControl.fadeIn();  
                    break;
                case "didSlideFrom":
                    homeSlider.goToSlide(0, 'reset');
                    $('#section_home #home_slide02 p').hide();
                    break;
            }
        }
        homeSliderOption = {
            mode:'horizontal',
            controls:false, pager:true, touchEnabled:false, startSlide:0,
            auto:false,speed:750,pause:5500,
            onSlideBefore:function($slideElement, oldIndex, newIndex){
                if(newIndex == 0){
                }else{
                    $('#section_home #home_slide02 p').show();
                }
                if(newIndex == 0){
                    $("#fb-btn, #tw-btn").removeClass("bright");   
                }else{
                    $("#fb-btn, #tw-btn").addClass("bright");
                }
            },
            onSlideAfter:function($slideElement, oldIndex, newIndex){

            }
        };
        homeSlider = $("#goBannerSlider").bxSlider(homeSliderOption);
        function startHomeSliderAuto() {
            if(homeSliderOption.auto){
                homeSlider.startAuto();
            }
        }
        function stopHomeSliderAuto() {
            homeSlider.stopAuto();
        }
        homeSlider.parent().parent().find("a[data-sectionid]").click(function(){
           var to_sectionid = $(this).attr("data-sectionid");
           $(".section").each(function(ind,ele){
                var sectionid = ele.id;
                if(sectionid == to_sectionid){
                    sectionContainerSlider.goToSlide($(this).attr("data-slideindex"));
                    return false;   
                }
           })
        }).hover(
           stopHomeSliderAuto, 
           startHomeSliderAuto
        );

        if(homeSliderOption.auto){
            homeSlider.parent().parent().find(".bx-pager").click(function(){
                if(delayHomeSliderStartAutoAfterPagerClick) clearTimeout(delayHomeSliderStartAutoAfterPagerClick);
                delayHomeSliderStartAutoAfterPagerClick = setTimeout(function(){
                    startHomeSliderAuto();
                    delayHomeSliderStartAutoAfterPagerClick = 0;
                }, homeSliderOption.pause);
            });
        }

        $("a.video_play_btn").click(function(){
            var videosrcs = [];
            for(i = 1 ; i <= 3 ; i++) {
                var attr = $(this).attr('datasrc'+i);
                if (typeof attr !== typeof undefined && attr !== false) {
                    videosrcs.push({src:$(this).attr('datasrc'+i), type:$(this).attr('datatype'+i)});
                }
            }
            if(videosrcs.length > 0){
                openVideoPopup(videosrcs);
            }
        });

        /* Section Prosales */
        $("a.demoversion").click(function(){
            if(!isRegistered){
            openRegisterPopup(); 
            }
        });
        /* Section 360 */
        showcase_panorama = $("#section_360 .section_content_extra #showcase_panorama_view");
        showcase_tour = $("#section_360 .section_content_extra #showcase_360_view");
        showcase_tour.find("iframe").bind("mousewheel", function(){ return false; });
        function onSection360Slide(type){
            switch(type){
                case "willSlideTo":     
                    break;
                case "didSlideTo":
                    if(isRegistered){
                        startShowcasePanoramaSlideShow();
                        startShowcase360tour();
                    }
                    break;
                case "willSlideFrom":
                    stopShowcasePanoramaSlideShow();
                    break;
                case "didSlideFrom":
                    stopShowcase360tour();
                    break;
            }
        }
        function onSection360Logon(){
            startShowcasePanoramaSlideShow();
            startShowcase360tour();
        }

        function startShowcase360tour(){
            var datasrc = showcase_tour.attr('data-src');
            showcase_tour.find('iframe').attr('src', datasrc);
        }
        function stopShowcase360tour(){
            showcase_tour.find('iframe').attr('src', '');
        }
        function startShowcasePanoramaSlideShow(){
            var datasrc = showcase_panorama.attr('data-src');
            showcase_panorama.css({'background-position-x':'0%', 'background-position-y':'0%' });
            showcase_panorama.css({'background-image':'url('+datasrc+')'});
            showcase_panorama.hide();
            animateShowcasePanoramaSlideShow();
        }
        function animateShowcasePanoramaSlideShow() {
            showcase_panorama.stop(true).fadeIn();
            return;
        }
        function stopShowcasePanoramaSlideShow(){
            showcase_panorama.stop(true);
        }

        /* popup */
        var popupRegisterContainer = $("#popup_register_container");
        popupRegisterHtml = $("#popup_content_register").wrap('<div>').parent().html();
        popupThankHtml = $("#popup_content_thank").wrap('<div>').parent().html();
        popupVideoHtml = $("#popup_content_video").wrap('<div>').parent().html();
        popupRegisterContainer.remove();
        var submitted = false;
        function openRegisterPopup(){
            sectionKeyNavEnable = false;
            submitted = false;
            $.fancybox.open({
                content : popupRegisterHtml,
                afterClose : onRegisterPopupClosed
            });
            $("#popup_content_register .error p").html("&nbsp;");
            $("#popup_content_register input[type=submit]").click(onPopupRegisterSubmit);
            $("#popup_content_register input[type=reset]").click(onPopupRegisterReset);
            $("#register_name").focus();
        }
        function onRegisterPopupClosed(){
            sectionKeyNavEnable = true;
        }
        function onPopupRegisterReset(){
            $("#popup_content_register .error p").html("&nbsp;");
            $("#register_name").focus();
        }
        function onPopupRegisterSubmit(){
            $("#popup_content_register .error p").html("&nbsp;");
            var reason = "";
            var user = {};
            user.name = $("#register_name").val().trim();
            user.email = $("#register_email").val().trim();
            user.contact = $("#register_contact").val().trim();
            user.company = $("#register_company").val().trim();
            user.businesstype = $("#register_businesstype").val().trim();
            user.interest = {};
            user.interest.prosalesdemoversion = $("#register_prosalesdemoversion").is(':checked');
            user.interest.ar = $("#register_ar").is(':checked');
            user.interest.crm = $("#register_crm").is(':checked');
            user.interest.virtualtour = $("#register_virtualtour").is(':checked');
            user.interest.mobileapplication = $("#register_mobileapplication").is(':checked');

            try {
                if(user.name == ""){
                    $("#register_name").focus();
                    reason = "Error : Please enter your name.";   
                    throw reason;
                }
                if(user.email == ""){
                    $("#register_name").focus();
                    reason = "Error : Please enter your email.";   
                    throw reason;
                }
                if(!isEmailAddress(user.email)){
                    $("#register_email").focus();
                    reason = "Error : Please enter correct format email.";   
                    throw reason;
                }
                if(user.contact == ""){
                    $("#register_contact").focus();
                    reason = "Error : Please enter your contact.";   
                    throw reason;
                }
                if(!isPhoneNumber(user.contact)){
                    $("#register_contact").focus();
                    reason = "Error : Please enter correct format contact."; 
                    throw reason;
                }
                if(user.company == ""){
                    $("#register_company").focus();
                    reason = "Error : Please enter your company.";   
                    throw reason;
                }

                var anyInterest = false;
                for(var key in user.interest){
                    if(user.interest[key] == true){
                        anyInterest = true;
                        break;   
                    }
                }
                if(!anyInterest){
                    reason = "Please tick at least one interest.";   
                    throw reason;
                }
            } catch(err){
                $("#popup_content_register .error p").delay(200).html(reason).show();
                return;
            }
            submitted = true;
            $.fancybox.close();
            openThankPopup();
        }
        function openThankPopup(){
            $.fancybox.open({
                content : popupThankHtml,
                afterClose : onThankPopupClosed
            });
            popupThankCloseTimeout = setTimeout(function(){
                $.fancybox.close();
            },5000);
        }
        function onThankPopupClosed(){
            sectionKeyNavEnable = true;
            if(popupThankCloseTimeout){
                clearTimeout(popupThankCloseTimeout);
                popupThankCloseTimeout = 0;
            }
            if(submitted){
                setRegistered(true);
            }
        }
        function openVideoPopup(videosrcs){
            stopHomeSliderAuto();
            $.fancybox.open({
                content : popupVideoHtml,
                beforeClose : onVideoPopupBeforeClose,
                afterClose : onVideoPopupAfterClose
            });
            $("#popup_content_video video").attr('autoplay','autoplay');
            for(var key in videosrcs){
                 $("#popup_content_video video").append($('<source></source>').attr('src', videosrcs[key].src).attr('type', videosrcs[key].type));
            }
        }
        function onVideoPopupBeforeClose() {

        }
        function onVideoPopupAfterClose() {
            startHomeSliderAuto();
            sectionKeyNavEnable = true;
        }

        //openRegisterPopup();

        /* resize */
        $(window).resize(function() {
            var ww = Math.max($(window).width(), 0);
            var wh = Math.max($(window).height(), 0);
            var hh = $("#header").height();
            var ch = wh - hh;
            $('#goContainer .sliderContent').css({width:ww, height:wh});
            $('#goContainer .section_content_container').css({width:ww, height:wh-hh});
            $('#goContainer #section_home .section_content_container').css({width:ww, height:wh});
            $('#goContainer .home_slide').css({width:ww, height:wh});
            $('#goContainer #home_slide01').css({width:ww, height:wh-hh});
            sectionContainerSlider.redrawSlider();
            homeSlider.redrawSlider();
        });

        /* login */
        function setRegistered(_isRegistered){
            if(isRegistered == _isRegistered)return;
            isRegistered = _isRegistered;
            if(isRegistered){
                $("#goContainer").addClass("islogon");
                $(".section_content_extra>*").hide().fadeIn();
                var f = sectionLogonHandles[sectionContainerSlider.getCurrentSlide()];
                if(f){
                    f();   
                }
            }else{
                $("#goContainer").removeClass("islogon");
            }
        }

        /* post initialization */
        if($.cookie) {
            setRegistered($.cookie("signed") == "yes");
        }else{
            setRegistered(false);
        }
        $(window).trigger('resize');
        sectionContainerSlider.redrawSlider();
        setTimeout(function(){
            $(window).trigger('resize');
        },100);
    }    
    
    /*home*/
    initHome();
    
    
    
    $.each(controllers, function(ind,controller){
        controller.onLoad();
    });
    
    /* resize */
    function onResize(){
        var ww = Math.max($(window).width(), 0);
        var wh = Math.max($(window).height(), 0);
        var hh = parseInt($('#header').height());
        $('#mainContainer').css({width:ww+'px', height:wh+'px'});
        $('#goContainer').css({width:ww+'px', height:wh+'px'});
        
        $('#home.mainContent').css({width:ww+'px', height:wh+'px', top:0+'px'});
        $(':not(#home).mainContent').css({width:ww+'px', height:(wh-hh)+'px', top:hh+'px'});
        
        $('.mainContent>.sliderContainer>.bx-wrapper>.bx-viewport>ul>li>.sliderContent, .mainContent>.sliderContainer>.bx-wrapper>.bx-viewport>ul>li').css({width:ww+'px', height:(wh-hh)+'px'});
        
        $('[data-scale-fit-width]').each(function(ind, ele){
            var pw = $(this).parent().width();
            var w = $(this).width();
            var s = pw / w;
            $(this).css({
                'transform-origin':'0 0',
                '-webkit-transform':'scale('+s+')',
                '-ms-transform':'scale('+s+')',
                'transform':'scale('+s+')'
            });           
        });//*/
    }
    $(window).resize(onResize);
    /* */
    
    
    var lastProcessedEvent = null;
    $.address.init(function(event) {
        /*
        log('init: ' + serialize({
            value: $.address.value(), 
            path: $.address.path(),
            pathNames: $.address.pathNames(),
            parameterNames: $.address.parameterNames(),
            queryString: $.address.queryString()
        }));//*/
        
        $('a').each(function() {
            var alink = $(this).attr('href') || "";
            if(alink.indexOf('#')==0){
                alink = '/' + alink.substring(1);
                $(this).toggleClass('selected', alink  == event.value);
            }
        });
        $.each(controllers, function(name,controller){
            if(controller.processPathNames(event.pathNames, event.value)){
                lastProcessedEvent = event;
                return false;   
            }
        });
        
    }).bind('change', function(event) {
        /*
        var names = $.map(event.pathNames, function(n) {
            return n.substr(0, 1).toUpperCase() + n.substr(1);
        }).concat(event.parameters.id ? event.parameters.id.split('.') : []);
        var links = names.slice();
        var match = links.length ? links.shift() + ' ' + links.join('.') : 'Home';
        log('change: ' + serialize(event, /parameters|parametersNames|path|pathNames|queryString|value/));
        //$.address.title(names.length == 1 ? names[0] : names.join(' - '));
        //*/
        if(lastProcessedEvent && lastProcessedEvent.value == event.value) return;
        
        $('a').each(function() {
            var alink = $(this).attr('href') || "";
            if(alink.indexOf('#')==0){
                alink = '/' + alink.substring(1);
                $(this).toggleClass('selected', alink  == event.value);
            }
        });
        //console.log((lastProcessedEvent?lastProcessedEvent.value:'') + '>' + event.value);
        var processed = false;
        $.each(controllers, function(name,controller){
            if(controller.processPathNames(event.pathNames, event.value)){
                lastProcessedEvent = event;
                processed = true;
                return false;   
            }
        });
        //if(!processed){
        //    $.address.value(lastProcessedEvent.value);
        //}
    });

    /* post init */
    $(window).trigger('resize');
    $('#mainContainer').fadeIn();
});