//ページ内スクロール
$('a[href^="#link_"]').on('click', function(){
    var target = $($(this).attr('href'));
    var point = target.offset().top - 50;
    $('html, body').animate({scrollTop : point}, 900)

})

//ナビゲーション表示関連
var trigger = $('#navTrigger');
var nav = $('#mainNav');
    
//スクロール量に応じてmenuボタンを表示
$(window).on('scroll', function(){

    var header = $('#mainHeader');

    var scroll = $(this).scrollTop();
    var point = header.outerHeight();

    if(scroll >= point) {
        trigger.addClass('view');
    } else {
        trigger.removeClass('view open');
        nav.removeClass('open')
    }
})

//クリックでナビゲーションを表示、トリガーの文字を変化
$('#navTrigger a').on('click', function(){
    trigger.toggleClass('open');
    nav.toggleClass('open');
})
nav.on('click', function(){
    trigger.removeClass('open')
    $(this).removeClass('open')
})

//ナビゲーション複製
$('#mainNav > ul').clone(true).appendTo('#mainNavClone');