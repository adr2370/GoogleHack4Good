/*** Create XRH ****/
function createXHR(){
		if(typeof XMLHttpRequest != "undefined"){
				return new XMLHttpRequest();
		} else if(window.ActiveXObject){

		var aVersion = ['MSXML2.XMLHttp6.0','MSXML2.XMLHttp3.0'];
		for(var i=0;i<aVersion.length; i++){
			try{
				var oXHR = new ActiveXObject(aVersion[i]);
				return oXHR;
			} catch (oError){
				//do nothing
			}
		}
		throw new Error('XMLHttp could not be created');
		}
	}

//global object
var xmlhttp = createXHR();

function deletePost(statusid){
 		var url = "http://test.yourperfectbeauty.com/deleteStatus.php",
 			params = "sid="+statusid,
 			result;

 			//Send the proper header information along with the request
			xmlhttp.open("POST",url,true);

			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			// xmlhttp.setRequestHeader("Content-length", params.length);
			// xmlhttp.setRequestHeader("Connection", "close");

			xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
				{
			       result = xmlhttp.responseText;
			       $('#singleUpdatePost'+statusid).slideUp(800, function(){
				    $(this).remove();
				});
			    }
			}
			xmlhttp.send(params);
}

function updateCompliments(userid,statusid,currentStatus,currentID,currentCompCount){
		if(currentStatus.length==10)
		{	
 		var url = "http://test.yourperfectbeauty.com/compliment.php",
 			params = "uid="+userid+"&sid="+statusid,
 			comp = currentCompCount+1,
 			result;

 			//Send the proper header information along with the request
			xmlhttp.open("POST",url,true);

			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			// xmlhttp.setRequestHeader("Content-length", params.length);
			// xmlhttp.setRequestHeader("Connection", "close");

			xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) 
				{
			       result = xmlhttp.responseText;
			       $('#'+currentID).text(result+'('+comp+')'); 
			    }
			}
			xmlhttp.send(params);
	} else {
		
	}
}


/***** Comment Form *****/

function submitComment(userid,statid,commt,ids){
		commt=commt.replace("&","%26");
		$('#userComment'+ids).val('');
		var urlComment = 'comment.php',
			params = "uid="+userid+"&statusid="+statid+"&comment="+commt,
			result;
			
		xmlhttp.open("POST",urlComment,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		// xmlhttp.setRequestHeader("Content-length", params.length);
		// xmlhttp.setRequestHeader("Connection", "close");

		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState == 4 && xmlhttp.status==200)
			{
				result = xmlhttp.responseText;
				commObj = eval('('+result+')');
				var commentObj = $.makeArray(commObj)[0];
				if(commentObj['worked']>0) {
				var toAdd = '<li class="hideMe currentComment commentAppend'+ids+' eachComment"><div class="commentLeftBlk"><a href="userProfile.php?name='+commentObj['username']+'"><img src="'+commentObj['pic']+'" /></a></div> <div class="commentRightBlk"><div class="userFName"><div><a href="userProfile.php?name='+commentObj['username']+'">'+commentObj['firstname']+'</a> says:</div>';
				toAdd += '<div class="deleteComment" id="deleteComment'+commentObj['worked']+'" onclick="deleteComment('+commentObj['worked']+')">Delete Comment</div>';
				toAdd+='</div><div class="userCommentDetail">'+commentObj['comment']+'</div></div></li>';
				$('.comListUL'+ids).append(toAdd);
				if(statid>=1000000000||statid==0) {
					$(".commentRightBlk").addClass("commentRightBlkProfile");
					$(".commentRightBlk").removeClass("commentRightBlk");
				}	
				$(".currentComment").slideDown(400);
				$(".currentComment").removeClass("currentComment");
			}
			}
		}
		xmlhttp.send(params);
}

function submitPostComment(userid,targetid,commt,ids){
		
		var urlComment = 'comment.php',
			params = "uid="+userid+"&statusid=0&comment="+commt+"&targetid="+targetid,
			result;
		
		xmlhttp.open("POST",urlComment,true);

		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		// xmlhttp.setRequestHeader("Content-length", params.length);
		// xmlhttp.setRequestHeader("Connection", "close");

		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState == 4 && xmlhttp.status==200)
			{
				result = xmlhttp.responseText;
				commObj = eval('('+result+')');
				var commentObj = $.makeArray(commObj)[0];
				$('#userComment'+ids).val('');
				if(commentObj['worked']>0) {
				var toAdd = '<li class="hideMe currentComment commentAppend'+ids+' eachComment"><div class="commentLeftBlk"><a href="userProfile.php?name='+commentObj['username']+'"><img src="'+commentObj['pic']+'" /></a></div> <div class="commentRightBlk"><div class="userFName"><div><a href="userProfile.php?name='+commentObj['username']+'">'+commentObj['firstname']+'</a> says:</div>';
				toAdd += '<div class="deleteComment" id="deleteComment'+commentObj['worked']+'" onclick="deleteComment('+commentObj['worked']+')">Delete Comment</div>';
				toAdd += '</div><div class="userCommentDetail">'+commentObj['comment']+'</div></div></li>';
				$('.comListUL'+ids).append(toAdd);
				$(".commentRightBlk").addClass("commentRightBlkProfile");
				$(".commentRightBlk").removeClass("commentRightBlk");
				$(".currentComment").slideDown(400);
				$(".currentComment").removeClass("currentComment");
			}
			}
		}
		xmlhttp.send(params);
}

function showCommentForm(thisForm){

	$('.'+thisForm).slideToggle(500);
	$('.commentBtn').unbind('click');
	$('.commentBtn').on('click',function(){
		var parentID = $(this).parent()[0].id,
			parentName = $(this).parent()[0].name;

		$('#'+parentID).submit(function(event){
		 event.preventDefault();
		 });

		 
		var uid = $('#hiddenSession'+parentName).val(),
				sid = $('#hiddenStatus'+parentName).val(),
				com = $('#userComment'+parentName).val();
			if(com.length > 0) {
				submitComment(uid,sid,com,parentName);
			}
		
	});
}

if (typeof isProfile === 'undefined') {
    var isProfile=false;
}

function showComments(eids,statusid,commentCount,userid){
	var vals = $('#showComments'+eids).text();
	if(statusid>0) {
	$('.commentBtn').on('click',function(){
		var parentID = $(this).parent()[0].id,
			parentName = $(this).parent()[0].name;

		$('#'+parentID).submit(function(event){
		 event.preventDefault();
		 });

		 
		var uid = $('#hiddenSession'+parentName).val(),
				sid = $('#hiddenStatus'+parentName).val(),
				com = $('#userComment'+parentName).val();
			if(com.length > 0) {
				submitComment(uid,sid,com,parentName);
			}
		
	});
}
	if(vals!="Close Comments")
	{
	$('#showComments'+eids).text('Close Comments');
			var url = 'fetchComments.php',
				params = 'statusid='+statusid+'&targetid='+eids,
				result,comObj,size,i,divVal,modVal,maxLoop,minLoop;
			xmlhttp.open("POST",url,false);
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			// xmlhttp.setRequestHeader("Content-length", params.length);
			// xmlhttp.setRequestHeader("Connection", "close");
			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
				{
					result = xmlhttp.responseText;
					comObj = eval('('+result+')');
					size = getObjSize(comObj);
					if(comObj[0]) //if there is any comment 
					{	
						i = 0;
						divVal = parseInt(size/5);
						modVal = size%5;
						maxLoop = Math.min(size,5);
						minLoop = 0;
						
						fetchCommentsChunk(minLoop,maxLoop,comObj,eids,userid);
						displayButton(eids,comObj,i,divVal,modVal,maxLoop,minLoop,userid);
						if(statusid>=1000000000||statusid==0) {
							$(".commentRightBlk").addClass("commentRightBlkProfile");
							$(".commentRightBlk").removeClass("commentRightBlk");
							isProfile=true;
						}
					} else {
						$('.comListUL'+eids+' li').empty().html('');
					}
					
				}
			};

			xmlhttp.send(params);
			$('#loadingImg'+eids).removeClass('hideMe');
			$('.commentList'+eids).delay(400).slideDown(500, function(){
					$('#loadingImg'+eids).addClass('hideMe');
					
			});//, function(){
		//});
	}	
	else
	{	
			var url = 'fetchComments.php',
					params = 'statusid='+statusid+'&targetid='+eids,
					size = 0;

				xmlhttp.open("POST",url,true);

				xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				// xmlhttp.setRequestHeader("Content-length", params.length);
				// xmlhttp.setRequestHeader("Connection", "close");

				xmlhttp.onreadystatechange = function(){
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
					{
						result = xmlhttp.responseText;
						comObj = eval('('+result+')');
						size = getObjSize(comObj);
						if(comObj[0]==false) size=0;
						$('#showComments'+eids).text('Show Comments('+size+')');
					}
				};

				xmlhttp.send(params);
		$('.commentList'+eids).slideUp(500,function(){
			$('li.commentAppend'+eids).remove();
			$('#loadingCom'+eids).remove();
			$('.postComList'+eids).text('');
		});			
	}
}

function deleteComment(cid){
	var url = 'deleteComment.php',
		params = 'cid='+cid;
	xmlhttp.open("POST",url,false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			$('#deleteComment'+cid).parent().parent().parent().slideUp(400, function(){
			    $(this).remove();
			});
		}
	};
	xmlhttp.send(params);
}

function deleteProductComment(cid){
	var url = 'deleteProductComment.php',
		params = 'cid='+cid;
	xmlhttp.open("POST",url,false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			$('#deleteComment'+cid).parent().parent().slideUp(400, function(){
			    $(this).remove();
			});
		}
	};
	xmlhttp.send(params);
}

/*** Jquery Code to get the size of an object ***/
function getObjSize(obj) {
    var size = 0, 
    	key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) 
        	size++;
    }
    return size;
};

function fetchCommentsChunk(min,max,commentObj,eids,userid){
	var i;
	var stuff='';
	for(i=min;i<max;i++)
		{
			var oldstuff=stuff;
			//$('.comListUL'+eids).append('<li class="commentAppend'+eids+'">'+commentObj[i]['firstname']+': '+commentObj[i]['comment']+'</li>');
			stuff='<li class="commentAppend'+eids+' eachComment"><div class="commentLeftBlk"><a href="userProfile.php?name='+commentObj[i]['username']+'"><img src="'+commentObj[i]['pic']+'" /></a></div> <div class="commentRightBlk"><div class="userFName"><div><a href="userProfile.php?name='+commentObj[i]['username']+'">'+commentObj[i]['firstname']+'</a> says:</div>';
			if(commentObj[i]['userid']==userid) stuff += '<div class="deleteComment" id="deleteComment'+commentObj[i]['worked']+'" onclick="deleteComment('+commentObj[i]['worked']+')">Delete Comment</div>';
			stuff+='</div><div id="'+userid+' '+commentObj[i]['userid']+'" class="userCommentDetail">'+commentObj[i]['comment']+'</div></div></li>'+oldstuff;
		}
		stuff='<div id="'+min+''+max+''+eids+'">'+stuff+'</div>';
	$('.comListUL'+eids).prepend(stuff);
	$('#'+min+''+max+''+eids).hide().slideDown(500);
}

function displayButton(eids,comObj,i,divVal,modVal,maxLoop,minLoop,userid){
	if(i<divVal)
	{
		//$('.comListUL'+eids).append('<button onclick="loadMore('+eids+','+comObj+','+i+','+divVal+','+modVal+','+maxLoop+','+minLoop+')">Load More</button>');
		if(!(i==divVal-1&&modVal==0)) {
			$('.comListUL'+eids).prepend('<div id="loadingCom'+eids+'" class="loadMoreCom gradientBg">Load More</div>');
		}
		$('#loadingCom'+eids).on('click',function(){
			loadMore(eids,comObj,i,divVal,modVal,maxLoop,minLoop,userid);
		});
	}
}

function setObj(comObj){
	return comObj
}

function loadMore(eids,comObj,i,divVal,modVal,maxLoop,minLoop,userid){
	i++;
	if(i==divVal)
	{
		minLoop = maxLoop;
		maxLoop = maxLoop+modVal;
		$('#loadingCom'+eids).remove();
		fetchCommentsChunk(minLoop,maxLoop,comObj,eids,userid);
	} 
	else // if(i<divVal)  may need experiment
	{
		minLoop = maxLoop;
		maxLoop = maxLoop+5;
		$('#loadingCom'+eids).remove();
		fetchCommentsChunk(minLoop,maxLoop,comObj,eids,userid);
		displayButton(eids,comObj,i,divVal,modVal,maxLoop,minLoop,userid);
	}	
	if(isProfile) {
		$(".commentRightBlk").addClass("commentRightBlkProfile");
		$(".commentRightBlk").removeClass("commentRightBlk");
	}
}

function loadMorePostSelf(loadCounter,path,userID,target,showproducts){
	var url = "http://test.yourperfectbeauty.com/morePostSelf.php",
		params = "counter="+loadCounter+"&userid="+target+"&showproducts="+showproducts,
		result,statusObj,i;

	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{	result = xmlhttp.responseText;
			statusObj = eval('('+result+')');
			size = getObjSize(statusObj);
			if(typeof statusObj[0] == "object")
			{
				for(i=0;i<size;i++)
				 	appendPost(statusObj[i],loadCounter,i,path,userID);
			}
		}
	};
	xmlhttp.send(params);
}

function loadMorePost(loadCounter,path,userID,whatToShow,whoToShow){
	var url = "http://test.yourperfectbeauty.com/morePost.php",
		params = "uid="+userID+"&counter="+loadCounter+"&whatToShow="+whatToShow+"&whoToShow="+whoToShow,
		result,statusObj,i;

	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{	result = xmlhttp.responseText;
			statusObj = eval('('+result+')');
			size = getObjSize(statusObj);
			if(typeof statusObj[0] == "object")
			{
				for(i=0;i<size;i++)
				 	appendPost(statusObj[i],loadCounter,i,path,userID);
			}
		}
	};
	xmlhttp.send(params);
}

function appendPost(statusObj,loadCounter,i,path,userID){
	eids = (10*loadCounter)+(++i);
	var eachUserID = statusObj['uid'],
		eachUserName = statusObj['username'],
		eachStatusID = statusObj['statusid'],
		eachUpdateStatus = statusObj['updates'],
		eachCompliments = statusObj['compliments'],
		eachAtt = statusObj['attachment'],
		eachUserImage = statusObj['pic'],
		eachUserFirstName = statusObj['firstname'],
		imageObj = statusObj['imageObj'],
		size = getObjSize(imageObj),
		currentStatus = statusObj['currentStatus'],
		compCount = statusObj['compCount'],
		commentCount = statusObj['commentCount'],
		products = statusObj['products'],
		j;
		eachUpdateStatus=eachUpdateStatus.replace("\\r\\n","<br/>");
		eachUpdateStatus=eachUpdateStatus.replace("\\n","<br/>");
		eachUpdateStatus=eachUpdateStatus.replace("\\r","<br/>");
	var postUserDetail = '<div id="singleUpdatePost'+eachStatusID+'"  class="singleUpdatePost"><div class="postUserDetail" style="font-size:12px;"><a href="userProfile.php?name='+eachUserName+'"><img src="'+eachUserImage+'" style="width:80px;"/>'+eachUserFirstName+'</a></div>',
		updatesPost = '',
		metaList1,metaList2,metaList3,metaList4,
		commentForms1,commentForms2,commentForms3,commentForms4,commentForms5,
		commentList, loadingThisImg;
		if(imageObj||products){
			updatesPost+='<div class="updatesPost">'+eachUpdateStatus+'<div class="postImage">';
			for(j=0;imageObj&&j<size;j++) {
				updatesPost+= '<img src="https://d11lxttoebl3uu.cloudfront.net/upload/upload/'+eachUserID+'/'+imageObj[j]+'" />';
			}
			for(j=0;products&&j<getObjSize(products);j++) {
				updatesPost+= '<a href="productDetail.html?pid='+products[j]+'"><img src="https://d11lxttoebl3uu.cloudfront.net/upload/upload/product/275'+products[j]+'" style="height:250px;" /></a>';
			}
			updatesPost+='</div></div>';
		} else {
			updatesPost = '<div class="updatesPost">'+eachUpdateStatus+'</div>';
		}
		metaList1 = '<ul class="postMetaList">';
		if(userID==eachUserID) metaList1+='<li id="Delete" onclick="deletePost('+eachStatusID+')">Delete Post</li>';
		metaList1+='<li id="Compliments'+eids+'" onclick="updateCompliments('+userID+','+eachStatusID+',\''+currentStatus+'\',this.id,'+compCount+')">'+currentStatus+'('+compCount+')</li>';
		metaList3 = '<li id="showComments'+eids+'" onclick="showComments('+eids+','+eachStatusID+','+commentCount+','+userID+')">Show Comments('+commentCount+')</li>';
		metaList4 = '</ul>';

		commentForms1 = '<form id="commentForm'+eids+'" name="'+eids+'">';
		commentForms2 = '<input type="hidden" id="hiddenStatus'+eids+'" value="'+eachStatusID+'" />';
		commentForms3 = '<input type="hidden" id="hiddenSession'+eids+'" value="'+userID+'" />';
		commentForms4 = '<label>Enter Your Comment:</label><textarea rows="3" cols="100" class="userComment" id="userComment'+eids+'"></textarea>';
		commentForms5 = '<input type="submit" value="SUBMIT COMMENT" name="submitcomment" class="commentBtn"/></form>';
	
		commentList = '<div class="commentList'+eids+' comList hideMe"><ul class="comListUL'+eids+' commentDiv"><li class="postComList'+eids+' postCommList"></li></ul>';
		commentList2 = '</div>';
	
		loadingThisImg = '<div id="loadingImg'+eids+'" class="loadImage hideMe"><img src="img/loading.gif" /></div>'
	$('.latestUpdates').append(postUserDetail+updatesPost+'<div class="postMeta">'+metaList1+metaList3+metaList4+loadingThisImg+commentList+commentForms1+commentForms2+commentForms3+commentForms4+commentForms5+commentList2+'</div></div>');
}


function follow(uid,targetid){
	var url="followUnfollow.php",
		params="follow=true&uid="+uid+"&targetid="+targetid,
		result,unfollow;
		xmlhttp.open("POST",url,true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.onreadystatechange=function(){
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{	
				result = xmlhttp.responseText;
				if(result)
				{	
					$('ul.profileSocial li:last-child').remove();
					unfollow = "<li><div id='unfollow' onclick='unfollow("+uid+","+targetid+")'>Stop Being a Fan</div></li>";
					$('ul.profileSocial').append(unfollow);
					
				}
			}

		};
		xmlhttp.send(params);
}


function unfollow(uid,targetid){
	var url="followUnfollow.php",
		params="unfollow=true&uid="+uid+"&targetid="+targetid,
		result,follow;
		xmlhttp.open("POST",url,true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.onreadystatechange=function(){
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
			{	
				result = xmlhttp.responseText;
				if(result)
				{	
					$('ul.profileSocial li:last-child').remove();
					follow = "<li><div id='follow' onclick='follow("+uid+","+targetid+")'>Become a Fan</div></li>";
					$('ul.profileSocial').append(follow);
				}
			}

		};
		xmlhttp.send(params);
}


function loadMoreSearchResult(numLoaded){
	var result, jsonRes, resListCount,counter,minVal,temp,maxVal,i,
		line1,line2,line3,line4,line5,html;
	result = $('.jsonData').text();
	jsonRes = eval('('+result+')');
	resListCount = $('.intRightBlock').children('.eachUserSearchResult').length;
	counter = parseInt(resListCount/10);
	minVal = numLoaded*10;
	temp = jsonRes.length - minVal;
	maxVal = Math.min(minVal+10,jsonRes.length);
	$('.loadMoreSearchResult').remove();
	for(i=minVal;i<maxVal;i++)
	{
		var message=jsonRes[i]['message'];
		if(message==null) message="";
		line1 = "<div class='eachUserSearchResult'><div class='searchResultintLeft'><img src='"+jsonRes[i]['avatar']+"' /></div>";
		line2 = "<div class='searchResultintRight'><ul class='searchResultList'><li><a href='userProfile.php?name="+jsonRes[i]['username']+"'>"+jsonRes[i]['firstname']+"</a></li>";
		line3 = "<li><span>"+jsonRes[i]['username']+"</span></li><li>"+message+"</li></ul>";
		line4 = "</div></div>";
		html = line1+line2+line3+line4;
		$(html).hide().appendTo('.intRightBlock').slideDown(500);
	}
	if(temp>10)
	{
		line4 = "<div class='loadMoreSearchResult gradientBg' onclick='loadMoreSearchResult("+(numLoaded+1)+");'>Load More Results</div>";
		$('.intRightBlock').append(line4);
	} else {
		line5 = "<div class='finishLoadingSearchResult gradientBg'>No More Results. Click to Goto Top</div>";
		$('.intRightBlock').append(line5);
		$('.finishLoadingSearchResult').on('click',function(){
			$(window).scrollTop(0);
		});
	}
}

function loadMoreBeautiesPageResult(numLoaded,whichOne,uid){
	var result, jsonRes, resListCount,counter,minVal,temp,maxVal,i,
		line1,line2,line3,line4,line5,html;
	var url = "http://test.yourperfectbeauty.com/getBeauties.php",
	params = "num="+whichOne+"&count="+numLoaded+"&uid="+uid,
	result,statusObj,i;
	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			result = xmlhttp.responseText;
			jsonRes = eval('('+result+')');
			resListCount = $('#beautiesTab'+whichOne+'Content').children('.eachUserSearchResult').length;
			counter = parseInt(resListCount/10);
			minVal = 0;
			temp = jsonRes.length - minVal;
			maxVal = Math.min(minVal+10,jsonRes.length);
			$('.loadMoreSearchResult'+whichOne).remove();
			for(i=0;i<Math.min(10,jsonRes.length);i++)
			{
				var message=jsonRes[i]['message'];
				if(message==null) message="";
				line1 = "<div class='eachUserSearchResult'><div class='searchResultintLeft'><img src='"+jsonRes[i]['avatar']+"' /></div>";
				line2 = "<div class='searchResultintRight'><ul class='searchResultList'><li><a href='userProfile.php?name="+jsonRes[i]['username']+"'>"+jsonRes[i]['firstname']+"</a></li>";
				line3 = "<li>"+message+"</li></ul>";
				line4 = "<ul class='searchResultListRightPoints'><li>&nbsp;</li><li>POINTS: "+jsonRes[i]['points']+"</li><li>COMPLIMENTS: "+jsonRes[i]['compliments']+"</li><li>FANS: "+jsonRes[i]['fans']+"</li></ul></div></div>";
				html = line1+line2+line3+line4;

				if(numLoaded>0) $(html).hide().appendTo('#beautiesTab'+whichOne+'Content').slideDown(500);
				else $(html).appendTo('#beautiesTab'+whichOne+'Content');
			}
			if(temp>10)
			{
				line4 = "<div class='loadMoreSearchResult loadMoreSearchResult"+whichOne+" gradientBg' onclick='loadMoreBeautiesPageResult("+(numLoaded+1)+","+whichOne+","+uid+");'>Load More Results</div>";
				$('#beautiesTab'+whichOne+'Content').append(line4);
			} else if(numLoaded>0) {
				line5 = "<div class='finishLoadingSearchResult gradientBg'>No More Results. Click to Goto Top</div>";
				$('#beautiesTab'+whichOne+'Content').append(line5);
				$('.finishLoadingSearchResult').on('click',function(){
					$(window).scrollTop(0);
				});
			}
		}
	};
	xmlhttp.send(params);
}

function loadMoreBeautiesResult(numLoaded,uid){
	var result, jsonRes, resListCount,counter,minVal,temp,maxVal,i,
		line1,line2,line3,line4,line5,html;
	var url = "http://test.yourperfectbeauty.com/getFans.php",
	params = "count="+numLoaded+"&uid="+uid,
	result,statusObj,i;
	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			result = xmlhttp.responseText;
			jsonRes = eval('('+result+')');
			resListCount = $('.intRightBlock').children('.eachUserSearchResult').length;
			counter = parseInt(resListCount/10);
			maxVal = Math.min(10,jsonRes.length);
			$('.loadMoreSearchResult').remove();
			for(i=0;i<maxVal;i++)
			{
				var message=jsonRes[i]['message'];
				if(message==null) message="";
				line1 = "<div class='eachUserSearchResult'><div class='searchResultintLeft'><img src='"+jsonRes[i]['avatar']+"' /></div>";
				line2 = "<div class='searchResultintRight'><ul class='searchResultList'><li><a href='userProfile.php?name="+jsonRes[i]['username']+"'>"+jsonRes[i]['firstname']+"</a></li>";
				line3 = "<li>"+message+"</li></ul>";
				line4 = "<ul class='searchResultListRightPoints'><li>&nbsp;</li><li>POINTS: "+jsonRes[i]['points']+"</li><li>COMPLIMENTS: "+jsonRes[i]['compliments']+"</li><li>FANS: "+jsonRes[i]['fans']+"</li></ul></div></div>";
				html = line1+line2+line3+line4;
				$(html).hide().appendTo('#routineDisplayTab3Content').slideDown(500);
			}
			if(jsonRes.length>10)
			{
				line4 = "<div class='loadMoreSearchResult gradientBg' onclick='loadMoreBeautiesResult("+(numLoaded+1)+","+uid+");'>Load More Results</div>";
				$('#routineDisplayTab3Content').append(line4);
			} else {
				line5 = "<div class='finishLoadingSearchResult gradientBg'>No More Results. Click to Goto Top</div>";
				$('#routineDisplayTab3Content').append(line5);
				$('.finishLoadingSearchResult').on('click',function(){
					$(window).scrollTop(0);
				});
			}
		}
	};
	xmlhttp.send(params);
}

function moreComment(prdId,multiplier,limit,divisor){
	
	var baseCounter = $('#product'+prdId+' .productCommentBox').children('.eachComment').length;
	var counter = parseInt(baseCounter/divisor);
	
	var url="http://test.yourperfectbeauty.com/productController.php",
		params="mc=true&pid="+prdId+"&counter="+counter+"&multiplier="+multiplier+"&limit="+limit,
		result, resultObj, size, html,i, html1;

	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			result = xmlhttp.responseText;
			resultObj = eval('('+result+')');
			size = getObjSize(resultObj);
			
			if(typeof resultObj[0] == "object")
			{	var $this = $('#product'+prdId+' .productCommentBox');
					$('#product'+prdId+' .moreComment').remove();
					$this.show();
					for(i=0;i<(size-1);i++)
					{
						resultObj[i]['comment']=resultObj[i]['comment'].replace("\\r\\n","<br/>");
						resultObj[i]['comment']=resultObj[i]['comment'].replace("\\\\n","<br/>");
						resultObj[i]['comment']=resultObj[i]['comment'].replace("\\n","<br/>");
						resultObj[i]['comment']=resultObj[i]['comment'].replace("\\r","<br/>");
                        var pic=resultObj[i]['pic'];
                        if(pic.charAt(0)!='h') {
                            pic="http://beta.yourperfectbeauty.com/"+pic;
                        }
						if(limit==15)
							html= "<div class='eachComment'><div class='commentIntLeft'><img src='"+pic+"' /></div><div class='commentIntRight bigComment'>"+resultObj[i]['comment']+"</div></div>";
						else
							html= "<div class='eachComment'><div class='commentIntLeft'><img src='"+pic+"' /></div><div class='commentIntRight' style='width:277px'>"+resultObj[i]['comment']+"</div></div>";
						$(html).hide().appendTo('#product'+prdId+' .productCommentBox').slideDown(500);;
					
					}
					
					if((i == size-1)&&resultObj[size-1])
					{
						html2 = "<div class='moreComment' id='moreComment"+prdId+"'>More Reviews</div>";
						$('#product'+prdId+' .productCommentBox').append(html2);
						$("#moreComment"+prdId).click(function() {
							moreComment(prdId,multiplier,limit,divisor);
						});
					} else if((i == size-1)&&!resultObj[size-1]) {
						html1 = "<div class='noMoreComment'>No More Reviews</div>";
						$('#product'+prdId).append(html1);

					}
			}
		}
	};
	xmlhttp.send(params);

}


function loadMoreProduct(counter,imgPath,productImgPath,uid,whichType){
    $(".loader").show();
	var url 	=	"http://test.yourperfectbeauty.com/productController.php",
		params	=	"moreProduct=true&uid="+uid+"&counter="+counter+"&imgPath="+imgPath+"&productImgPath="+productImgPath+"&whichType="+whichType,
		result, resultObj, size, i, product, comment, sizeComment, cl, totalCommentSize, allComment,
		pid, avgRating, html1, html2, html3, html4, html5, html6, html7, html8, html8, html9,html9ary, html10, html10ary, html11, html12;

		html9ary = new Array();
		html10ary = new Array();

	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			result = xmlhttp.responseText;
			resultObj = eval('('+result+')');
            $(".loader").hide();
			size = getObjSize(resultObj);
			if(size==0) {
				$('#productsDisplayTab1').remove();
				$('#productsDisplayTab2').click();
			}
			for(i=0;i<size;i++)
			{	
				product = resultObj[i]['product'];
				comment = resultObj[i]['comment'];
				pid = product['pid'];
				avgRating = resultObj[i]['avgRating'];
				numRating = resultObj[i]['numRating'];
				totalCommentSize = resultObj[i]['commentSize'];

				html1 = "<div id='product"+pid+"' class='eachProduct'><div class='productRating'><ul class='starRatings'>";
				html2 = "<li class='oneStar'><img src='"+imgPath+"/whiteStar.png'/></li>";
				html3 = "<li class='twoStar'><img src='"+imgPath+"/whiteStar.png'/></li>";
				html4 = "<li class='threeStar'><img src='"+imgPath+"/whiteStar.png'/></li>";
				html5 = "<li class='fourStar'><img src='"+imgPath+"/whiteStar.png'/></li>";
				html6 = "<li class='fiveStar'><img src='"+imgPath+"/whiteStar.png'/></li></ul>";
				
				html7 = "</div><div class='productImg'><a href='productDetail.html?pid="+pid+"'><img src='"+productImgPath+"/275"+product['image']+"' /></a></div>";
				html8 = "<div class='productTitle'><a href='productDetail.html?pid="+pid+"'>"+product['name']+"</a></div><div class='productCommentBox'>";
                
                $('.productsContainer').append(html1+html2+html3+html4+html5+html6+html7+html8+"</div>");
							
                if(parseInt(avgRating)!=0)
                    defaultsVal(parseInt(avgRating),pid);
				
				$('#product'+pid+' li.oneStar img').attr('onclick','giveRatings("'+pid+'",1)');
				$('#product'+pid+' li.twoStar img').attr('onclick','giveRatings("'+pid+'",2)');
				$('#product'+pid+' li.threeStar img').attr('onclick','giveRatings("'+pid+'",3)');
				$('#product'+pid+' li.fourStar img').attr('onclick','giveRatings("'+pid+'",4)');
				$('#product'+pid+' li.fiveStar img').attr('onclick','giveRatings("'+pid+'",5)');
				
				$('#product'+pid+' li.oneStar img').attr('onmouseover','oneHover("'+pid+'")');
				$('#product'+pid+' li.twoStar img').attr('onmouseover','twoHover("'+pid+'")');
				$('#product'+pid+' li.threeStar img').attr('onmouseover','threeHover("'+pid+'")');
				$('#product'+pid+' li.fourStar img').attr('onmouseover','fourHover("'+pid+'")');
				$('#product'+pid+' li.fiveStar img').attr('onmouseover','fiveHover("'+pid+'")');
				
				$('#product'+pid+' li.oneStar img').attr('onmouseout','oneHoverOut("'+pid+'",'+parseInt(avgRating)+')');
				$('#product'+pid+' li.twoStar img').attr('onmouseout','twoHoverOut("'+pid+'",'+parseInt(avgRating)+')');
				$('#product'+pid+' li.threeStar img').attr('onmouseout','threeHoverOut("'+pid+'",'+parseInt(avgRating)+')');
				$('#product'+pid+' li.fourStar img').attr('onmouseout','fourHoverOut("'+pid+'",'+parseInt(avgRating)+')');
				$('#product'+pid+' li.fiveStar img').attr('onmouseout','fiveHoverOut("'+pid+'",'+parseInt(avgRating)+')');
			}
		}
	};
	xmlhttp.send(params);
}


function singleProductSubmitComment(comment,uid,pid){
	comment=comment.replace("&","%26");
	var url = "http://test.yourperfectbeauty.com/productController.php",
		params = "spc=true&comment="+comment+"&uid="+uid+"&pid="+pid,
		result, resultObj;


	xmlhttp.open("POST",url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			result = xmlhttp.responseText;
		resultObj = eval('('+result+')');
		html1 = "<div class='eachComment'><div class='commentIntLeft' style='display:none;'><img src='img/thumbsUp.png' style='width: 40px;top: -10px;left: 5px;position: relative;cursor:pointer;' onclick='giveCommentCompliment("+resultObj['cid']+")'><div id='compliments"+resultObj['cid']+"' style='float: left;font-size: 10px;position: relative;top: -18px;text-align: center;width: 50px;cursor:default;'>";
		html2 = resultObj['thumbsup']+" Up</div></div><div class='commentIntLeft'><a href='userProfile.php?name="+resultObj['username']+"'><img src='"+resultObj['image']+"' /></a></div>";
		var newComment=resultObj['comment'];
		newComment=newComment.replace("\\r\\n","<br/>");
		newComment=newComment.replace("\\\\n","<br/>");
		newComment=newComment.replace("\\n","<br/>");
		newComment=newComment.replace("\\r","<br/>");
		html3 = "<div class='commentIntRight bigComment' style='width:227px;'>"+newComment+"<div style='top:0px;' class='deleteComment' id='deleteComment"+resultObj['cid']+"' onclick='deleteProductComment("+resultObj['cid']+")'>Delete Comment</div></div></div>";

		$(html1+html2+html3).hide().prependTo('.productCommentBox').slideDown(500);

		}
	};

	xmlhttp.send(params);

}

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemBottom >= docViewTop));
}








