// DOM Ready
var maximageid = imageid = 0;
$(function() {
	var imageHeight, wrapperHeight, overlap, container = $('.post-image');  
    function centerImage() {
        imageHeight = container.find('img').height();
        wrapperHeight = container.height();
        overlap = (wrapperHeight - imageHeight) / 2;
        container.find('img').css('margin-top', overlap);
    }
    $(window).on("load resize", centerImage);
	function wimgsize(){
		$("#lightbox img").css({"max-width":"9999px","width":"auto","height":"auto","margin":"0"});
		if($(window).width()/$(window).height() > $("#lightbox img").width()/$("#lightbox img").height()){
			$("#lightbox img").css({"width":"100%","height":"auto"});
			$("#lightbox img").css("margin-top",$(window).height()/2-$("#lightbox img").height()/2);
		} else {
			$("#lightbox img").css({"max-width":"9999px","width":"auto","height":"100%"});
			$("#lightbox img").css("margin-left",$(window).width()/2-$("#lightbox img").width()/2);
		}
	}
	function imgcount(){
		$(".gallery article .ngg-gallery-thumbnail-box img").each(function(x){
			if($(this).parent().attr("data-title")!="youtube"){
				$(this).parent().append("<div class=\"title\">"+$(this).parent().attr("data-title")+"<div class=\"description\">"+$(this).parent().attr("data-description")+"</div></div>");
			}
			maximageid = maximageid+1;
			$(this).addClass("limage limage"+x).attr("data-imageid",x);
		});
		$(".gallery article .ngg-gallery-thumbnail-box img[title=youtube]").each(function(){
			$(this).addClass("youtube").attr("src","http://img.youtube.com/vi/"+$(this).addClass("youtube").parent().attr("data-description")+"/0.jpg");
			$(this).parent().append("<div class=\"video\">Video</div>");
		});
	}
	function imgsize(){
		$(".gallery article .ngg-gallery-thumbnail-box img").each(function(){
			if($(this).parent().parent().parent().width()/$(this).parent().parent().parent().height() > $(this).width()/$(this).height()){
				$(this).css({"width":"100%","height":"auto"});
				$(this).css("margin-top",$(this).parent().parent().parent().height()/2-$(this).height()/2);
			} else {
				$(this).css({"width":"auto","height":"100%"});
				$(this).css("margin-left",$(this).parent().parent().parent().width()/2-$(this).width()/2);
			}
		});
	}
	imgcount();
	$(window).load(function(){
		imgsize();
	});
	$(window).resize(function(){
		wimgsize();
	});
	function lightbox(id){
		$("#lightbox .prev, #lightbox .next").hide();
		$("#lightbox").children(".img, .about").remove();
		var image = $(".limage"+id);
		var image = $(".limage"+id).parent().attr("href");
		var title = $(".limage"+id).parent().attr("data-title");
		var description = $(".limage"+id).parent().attr("data-description");
		if($(".limage"+id).hasClass("youtube")){
			$("#lightbox").show().append('<iframe class="img" src="//www.youtube.com/embed/'+description+'?rel=0" frameborder="0"></iframe>');
		} else if(title){
			$("#lightbox").show().append("<div class='img'><img src='"+image+"' /><div class='about'><h3>"+title+"</h3><p>"+description+"</p></div></div>");
		} else {
			$("#lightbox").show().append("<div class='img'><img src='"+image+"' /></div>");
		}
		$('#lightbox img').load(function(){
			wimgsize();
			$(this).show();
		});
		$("html").css("overflow","hidden");
		if (id>0) {
			$("#lightbox .prev").show();
		}
		if (id<(maximageid-1)) {
			$("#lightbox .next").show();
		}
	}
	$("article .limage, article .ngg-gallery-thumbnail .title, article .ngg-gallery-thumbnail .video").click(function(){
		var id = parseInt($(this).parent().children(".limage").attr("data-imageid"));
		imageid = id;
		lightbox(id);
		event.preventDefault();
	});
	$("#lightbox .prev").click(function(){
		var id = imageid = imageid-1;
		lightbox(id);
	});
	$("#lightbox .next").click(function(){
		var id = imageid = imageid+1;
		lightbox(id);
	});
	$("#lightbox .close").click(function(){
		$("#lightbox .prev, #lightbox .next").hide();
		$("#lightbox").hide().children(".img, .about").remove();
		$("html").css({"overflow-y": "scroll", "overflow-x": "auto"});
	});
	$("article [class*=wp-image]").click(function(){
		var image = $(this).parent().attr("href");
		$("#lightbox .prev, #lightbox .next").hide();
		$("#lightbox").children(".img, .about").remove();
		$("#lightbox").show().append("<div class='img'><img src='"+image+"' /></div>");
		$('#lightbox img').load(function(){
			wimgsize();
			$(this).show();
		});
		$("html").css("overflow","hidden");
		event.preventDefault();
	});
});