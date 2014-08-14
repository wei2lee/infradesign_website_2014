var FORCE_SIGN_IN = true; 

var ios, android, ie, busy;
var landscape = true;
var timeoutID = null;
var callBack = null;
var panoramaAreaViewSlider;

/* Utilities */
Filters = {};
Filters.getPixels = function(img) {
  var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return {imgData:ctx.getImageData(0,0,c.width,c.height), canvas:c, context:ctx};
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.filterImage = function(filter, image, var_args) {
  var obj = this.getPixels(image);
  var args = [obj.imgData];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  obj.filteredImgData = filter.apply(null, args);
  obj.context.putImageData(obj.filteredImgData, 0, 0);
  return obj;
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/* Home */

/**/

/* Resize container to fit */

function resizeHandler(evt)
{
	landscape = ($(window).width() > $(window).height() ? true : false);
	
	if(timeoutID != null)
	{
		clearTimeout(timeoutID);
		timeoutID = null;
	}
	if(evt != null) timeoutID = setTimeout("resizeHandler()", 100);
	
	var ww = Math.max($(window).width(), 1024);
	var wh = Math.max($(window).height(), 600);
	var ch = wh - 135;

	if($("body").hasClass("intro"))
	{
		var dh = Math.max((wh - $("#container").height() - 40) >> 1, 0);
		$("#container").css("margin-top", dh);
	}
	else
	{
		if($("body").hasClass("folios"))
		{
			//var scale = Math.floor((ww - 20) / 1.6) / 1000;
            var scale = ww / 1600;
			var style = "scale(" + scale + ")";
			$("#categories").css( { "transform":style, "-moz-transform":style, "-ms-transform":style, "-o-transform":style, "-webkit-transform":style,
			"-ms-filter":"progid:DXImageTransform.Microsoft.Matrix(M11=" + scale + ", M12=0, M21=0, M22=" + scale + ", SizingMethod='auto expand')" } );
			$("#galleries").css( { height:ch, left:(ww - 1024) >> 1 } );
		}
        if($("body").hasClass("pav"))
        {
            //panoramaAreaViewSlider.redrawSlider();
        }
		$("#container").css("height", wh);
		$("#content, #content-inner, .gallery #left").css("height", ch);

	}
}


/* Show gallery */

function showGallery(id, func)
{
	callBack = func;
	$(".gallery").removeClass("selected");
	$("#" + id).addClass("selected");
	$("#categories").css("pointer-events", "none").fadeTo(200, 0.25);
	$("#galleries").fadeIn(250);
}


/* Hide gallery */

function hideGallery()
{
	$("#galleries").fadeOut(200);
	$("#categories").fadeTo(200, 1).css("pointer-events", "auto");
}


/* Share with facebook */

function shareWithFB()
{
	var url         = "http://www.infradesign.com.my";
	var title       = "Infra Design - making ideas happen.";
	var description = "Infra Design, Digital Marketing and Advertising Agency, Mobile Solutions.";
	var image      	= "http://infradesign.com.my/apple-touch-icon.png";
	var left = ($(window).width() - 800) >> 1;
	var top = ($(window).height() - 350) >> 1;
	
	var sharingURL	= encodeURI("http://www.facebook.com/sharer.php?s=100" +
	"&p[url]=" + url +
	"&p[title]=" + title +
	"&p[images][0]=" + image +
	"&p[summary]=" + description);
	
	window.open(sharingURL, "FBSharer", "menubar=0, resizable=0, width=800, height=350, left=" + left + ", top=" + top);
}


/* Share with twitter */

function shareWithTW()
{
	var url         = "http://www.infradesign.com.my";
	var title       = "Infra Design - making ideas happen. #InfraDesign";
	
	var left = ($(window).width() - 800) >> 1;
	var top = ($(window).height() - 460) >> 1;
	
	var sharingURL	= encodeURI("http://twitter.com/share?" +
	"&url=" + url +
	"&text=" + title);
	
	window.open(sharingURL, "TWSharer", "menubar=0, resizable=0, width=800, height=460, left=" + left + ", top=" + top);
}


/* Get url parameter */

function getURLParameter(name)
{
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]);
}


/* Trim a string */

function trim(str)
{
	return str.replace(/^\s+|\s+$/g, "");
}


/* Validate email address */

function isEmailAddress(email)
{
	var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}


/* Validate phone number */

function isPhoneNumber(numb)
{
	var intRegex = /[0-9 -()+]+$/;
	return (numb.length >= 9 && intRegex.test(numb));
}


/* Send button clicked */

function onSubmit()
{
	if(busy) return;
	
	var name = trim($("#name").val());
	var company = trim($("#company").val());
	var contact = trim($("#contact").val());
	var email = trim($("#email").val());
	var date = trim($("#date").val());
	var budget = trim($("#budget").val());
	var message = trim($("#message").val());
	
	if(name == "")
	{
		$("#feedback").html("Error: Please enter your name!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#name").select();
		return;
	}
	if(!isPhoneNumber(contact))
	{
		$("#feedback").html("Error: Please enter your contact number!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#contact").select();
		return;
	}
	if(!isEmailAddress(email))
	{
		$("#feedback").html("Error: Please enter your email address!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#email").select();
		return;
	}
	if(message == "")
	{
		$("#feedback").html("Error: Please enter your message!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#message").select();
		return;
	}
	
	$("#feedback").html("Sending enquiry...");
	$("#feedback").stop().hide(0).fadeIn(150);
	$("#container").css("cursor", "wait");
	busy = true;
	
	$.ajax(
	{
		type: "POST",
		url: "contact.php",
		data:
		{
			name: name, company: company,
			contact: contact, email: email,
			date: date, budget: budget, message: message
		},
		success: function(response)
		{
            console.log("contact.php response="+response);
			busy = false;
			$("#container").css("cursor", "auto");
			resetForm(true);
			$("#feedback").html("Enquiry has been sent.");
			$("#feedback").stop().hide(0).fadeIn(150);
			alert("Thank you! Your enquiry has been sent.");
		},
		error: function(xhr, optns, err)
		{
			busy = false;
			$("#container").css("cursor", "auto");
			$("#feedback").html("Error: " + (err || "Cannot connect to server!"));
			$("#feedback").stop().hide(0).fadeIn(150);
		}
	});
}


/* Enter button clicked */

function onSubmitInfo()
{
	if(busy) return;
	
	var name = trim($("#name").val());
	var email = trim($("#email").val());
	var contact = trim($("#contact").val());
	
	if(name == "")
	{
		$("#feedback").html("Error: Please enter your name!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#name").select();
		return;
	}
	if(!isEmailAddress(email))
	{
		$("#feedback").html("Error: Please enter your email address!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#email").select();
		return;
	}
	if(!isPhoneNumber(contact))
	{
		$("#feedback").html("Error: Please enter your contact number!");
		$("#feedback").stop().hide(0).fadeIn(150);
		$("#contact").select();
		return;
	}
	
	$.ajax(
	{
		type: "POST",
		url: "/visitor/visitor.php",
		data:
		{
			name: name, email: email,
			contact: contact
		},
		success: function(response)
		{
            console.log("visitor.php response="+response);
			busy = false;
			$("#container").css("cursor", "auto");
			resetForm(true);
			$("#feedback").html("Thank you!");
			$("#feedback").stop().hide(0).fadeIn(150);
			
			$.cookie("signed", "yes", { expires:365 });
			if(!callBack)
				visit(getURLParameter("dir"));
			else
				eval(callBack);
		},
		error: function(xhr, optns, err)
		{
			busy = false;
			$("#container").css("cursor", "auto");
			
			$.cookie("signed", "yes", { expires:365 });
			if(!callBack)
				visit(getURLParameter("dir"));
			else
				eval(callBack);
		}
	});
}


/* Reset form */

function resetForm(flag)
{
	if(busy) return;
	
	$("#form .text-field, #form .text-area").val("");
	$("#feedback").html("&nbsp;");
	
	if(!flag) $("#name").focus();
}


/* Visitor redirection */

function visit(dir)
{
	var url = "http://infradesign.com.my";
	
	switch(dir)
	{
		case "home":
			url += "/home.html";
			break;
		
		case "mobile":
			url += "/mobile-application.html";
			break;
		
		case "ar":
			url += "/augmented-reality.html";
			break;
		
		case "web":
			url += "/web-development.html";
			break;
	}
	window.location.href = url;
}

/* Execution */
$(function () {
    var ua = navigator.userAgent;
    ios = ua.match(/iP/i);
    android = ua.match(/Android/i);
    ie = ua.match(/MSIE/i);

    // Initialize Intro page
    if ($("body").hasClass("intro")) {
        $(".intro #content").children("div").css("height", "640px");
        setTimeout(function () {
            $("#enter-btn").fadeIn(750);
        }, 1500);
    }
    // Initialize Home page
    if ($("body").hasClass("home")) {
		var ww = Math.max($(window).width(), 1024);
		var wh = Math.max($(window).height(), 600);
		var ch = wh - 135;
		$(".page").css("height",wh);
        initHome();
    }

    // Initialize Platforms page
    else if ($("body").hasClass("platforms")) {
        $("#content a").mouseover(function () {
            $("#content").css("background", $(this).attr("data"));
        }).mouseout(function () {
            $("#content").css("background", "none");
        });
    }

    // Initialize Computer Graphic page
    else if ($("body").hasClass("cg")) {
        $("#right img").click(function () {
            $("#right img").removeClass("selected");
            $(this).addClass("selected");
            $("#left img").attr("src", $(this).attr("src"));
            resizeHandler();
        });
    }

    // Initialize Virtual Reality Tour page
    else if ($("body").hasClass("vrt")) {
        $("#right img").click(function () {
            try { $("video")[0].pause(); } catch (err) { }
            $("#right img, #left div").removeClass("selected");
            $(this).addClass("selected");
            $("#left #" + $(this).attr("link")).addClass("selected");
            resizeHandler();
        });
    }

    // Initialize Panorama Area View page
    else if ($("body").hasClass("pav")) {
        panoramaAreaViewSlider = $("#slider").bxSlider({ slideMargin:10, auto: true, autoControls: true, autoControlsCombine: true, speed: 1500, pause: 5500, infiniteLoop: true });
    }

    // Initialize Folios page
    else if ($("body").hasClass("folios")) {
        $("#categories .rollover").click(function () {
            if (FORCE_SIGN_IN == false || $.cookie("signed") == "yes") {
                eval($(this).attr("link"));
            }
            else {
                resetForm(true);
                showGallery("visitor", $(this).attr("link"));
            }
        });
        $("#right img").click(function () {
            $(this).parent().find("img").removeClass("selected");
            $(this).addClass("selected");
            $(this).parent().parent().find("#left img").attr("src", $(this).attr("src"));
            resizeHandler();
        });
        $(document).keydown(function (evt) {
            if (evt.keyCode == 27) hideGallery();
        });
        
        function preloadFoliosImage() {
            var total = $(".folios_page>div").length;
            var loaded = 0;
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
                var style = "left:0px; top:0px; width:"+preloadobj.ele.css('width')+"; height:"+preloadobj.ele.css('height')+"; background-image:url("+obj.canvas.toDataURL("image/png")+")";
                preloadobj.ele.append($("<div class='grayscale' style='"+style+"';></div>"));
            });//*/
            startFoliosAnimation();
        }
        var foliosanim1delay = new TimelineMax({paused:true});
        var foliosanim1 = new TimelineMax({paused:true});
        var foliosanim2delay = new TimelineMax({paused:true});
        var foliosanim2 = new TimelineMax({paused:true});
        function startFoliosAnimation() {
            var isinitcycle = true;
            var pagedelay = 2;
            var pagedelay2 = 1.5;
            var alphatweendelay = 0.1;
            var randomdelayk = 0.3;
            var tweenduration = 0.7;
            
            TweenMax.to($(".folios_page"), 0, {perspective:2000});
            
            foliosanim1delay.insert(TweenMax.to({x:0}, pagedelay, {x:0}));
            foliosanim1delay.append(TweenMax.delayedCall(0, function(){
                console.log("foliosanim1.restart");
                foliosanim1.restart();
            }));
            
            foliosanim1.insert(TweenMax.delayedCall(0, function(){ 
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
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:1}, {alpha:0}), (1600-left)*0.0008 + randomdelay + alphatweendelay);
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:0}, {rotationY:-180, transformOrigin:"center center"}), (1600-left)*0.0008 + randomdelay);
            });
            
            $("#folios_page1>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:0}, {alpha:1}), pagedelay2 + 0.5 + left*0.0008 + randomdelay + alphatweendelay);
                foliosanim1.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:-180}, {rotationY:0, transformOrigin:"center center"}), pagedelay2 + 0.5 + left*0.0008 + randomdelay);
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
                $("#folios_page2").show(); 
                $("#folios_page1").css("pointer-events", "none");
                $("#folios_page2").css("pointer-events", "visible");
                $("#folios_page1>div").unbind('mouseover mouseout');
                $("#folios_page1").unbind('mouseover mouseout');
            }));
            $("#folios_page1>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:1}, {alpha:0}), left*0.0008 + randomdelay + alphatweendelay);
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:0}, {rotationY:180, transformOrigin:"center center"}), left*0.0008 + randomdelay);
            });
            
            $("#folios_page2>div").each(function(ind,ele){
                var left = parseInt($(ele).css('left'));
                var randomdelay = Math.random() * randomdelayk;
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {alpha:0}, {alpha:1}), pagedelay2 + (1600-left)*0.0008 + randomdelay + alphatweendelay);
                foliosanim2.insert(TweenMax.fromTo($(ele), tweenduration, {rotationY:180}, {rotationY:0, transformOrigin:"center center"}), pagedelay2 + (1600-left)*0.0008 + randomdelay);
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
            foliosanim1delay.killAll();
            foliosanim1.killAll();
            foliosanim2delay.killAll();
            foliosanim2.killAll();
        }
        
        preloadFoliosImage();
    }

    // Initialize Crew page
    else if ($("body").hasClass("crew")) {
        
        $("#p1,#p2,#p3,#p4,#p5,#p6").hover(
            function(){
                var hoverid = $(this).attr('id');
                if(hoverid != 'p1' && hoverid != 'p6')
                    $(this).addClass("hover");
                $("#p1,#p2,#p3,#p4,#p5,#p6").each(function(ind,ele){
                     if(ele.id != hoverid){
                        $(ele).addClass("others");   
                     }
                });
            }, 
            function(){
                
                $(this).removeClass("hover");
                $("#p1,#p2,#p3,#p4,#p5,#p6").removeClass("others");
            }
        );
    }

    // Initialize AR page
    else if ($("body").hasClass("ar")) {
        $(document).keydown(function (evt) {
            if (evt.keyCode == 27) hideGallery();
        });
    }

    // Initialize Visitor page
    else if ($("body").hasClass("visitor")) {
        if ($.cookie("signed") == "yes") visit(getURLParameter("dir"));
    }
    // Default initializing
    $("a.selected").css("cursor", "default").click(function () { return false; });
    if (ios) $(window).bind("orientationchange", resizeHandler);
    if (android) window.scrollTo(0, 1);
    $(window).bind("resize", resizeHandler);
    resizeHandler(true);

});


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
function initHome() {         
    
    
    /* sections */
    sections = $(".section");
    $(".sections").fadeIn();
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

    sectionContainerSlider = $(".sections>ul").bxSlider(sectionContainerSliderOption);
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
        auto:true,speed:750,pause:5500,
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

    homeSlider = $("#home_bxslider").bxSlider(homeSliderOption);
    function startHomeSliderAuto() {
        homeSlider.startAuto();
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
        $("#popup_content_video video")[0].addEventListener("loadedmetadata", onVideoLoadedMetaData, false);
        for(var key in videosrcs){
             $("#popup_content_video video").append($('<source></source>').attr('src', videosrcs[key].src).attr('type', videosrcs[key].type));
        }

    }
    function onVideoLoadedMetaData(evt){
        var width = this.videoWidth;
        var height = this.videoHeight;
        var vid = $("#popup_content_video video")[0];
        $('popup_video').attr('width', vid.videoWidth).attr('height', vid.videoHeight);
        $.fancybox.reposition();
        $.fancybox.update();
    }
    function onVideoPopupBeforeClose() {
        var vid = document.getElementById("popup_video");
        $("#popup_content_video video")[0].removeEventListener("loadedmetadata", onVideoLoadedMetaData);
    }
    function onVideoPopupAfterClose() {
        startHomeSliderAuto();
        sectionKeyNavEnable = true;
    }
    
    //openRegisterPopup();

    /* resize */
    $(window).resize(function() {
        var ww = Math.max($(window).width(), 1024);
        var wh = Math.max($(window).height(), 600);
        var ch = wh - 135;
        $('.section').css({width:ww, height:wh});
        $('.home_slide').css({width:ww, height:wh});
        $('.section_page').css({width:ww, height:wh});
        sectionContainerSlider.redrawSlider();
        homeSlider.redrawSlider();
    });

    /* login */
    function setRegistered(_isRegistered){
        if(isRegistered == _isRegistered)return;
        isRegistered = _isRegistered;
        if(isRegistered){
            $(".sections").addClass("islogon");
            $(".section_content_extra>*").hide().fadeIn();
            var f = sectionLogonHandles[sectionContainerSlider.getCurrentSlide()];
            if(f){
                f();   
            }
        }else{
            $(".sections").removeClass("islogon");
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
    
    openRegisterPopup();
}
