$(function(){
	$('.comment').click(function(){
		var target = $(this);
		var cid = target.data('cid'); // 来源
		var tid = target.data('tid'); // 目标
		var Cont = target.data('cont') || '';


		if($('#cid').length >0 ){
			$('#cid').val(cid);
		}else{
			$('#comment').val('回复：“'+Cont+'”'+"\r");
			$('<input>').attr({
				type: 'hidden',
				id: 'cid',
				name: 'comment[cid]',
				value: cid
			}).appendTo('#commentForm');
		}

		if($('#tid').length >0 ){
			$('#tid').val(tid)	;
		}else{
			$('<input>').attr({
				type: 'hidden',
				id: 'tid',
				name: 'comment[tid]', 
				value: tid
			}).appendTo('#commentForm');
		}
	});
});