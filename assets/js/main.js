/*  ---------------------------------------------------
  Template Name: Gym
  Description:  Gym Fitness HTML Template
  Author: Colorlib
  Author URI: https://colorlib.com
  Version: 1.0
  Created: Colorlib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Canvas Menu
$(document).on('click', '.canvas-open', function() {
        $(".offcanvas-menu-wrapper").addClass("show-offcanvas-menu-wrapper");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".canvas-close, .offcanvas-menu-overlay").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("show-offcanvas-menu-wrapper");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    // Search model
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    //Masonary
    $('.gallery').masonry({
        itemSelector: '.gs-item',
        columnWidth: '.grid-sizer',
        gutter: 10
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Carousel Slider
    --------------------*/
    var hero_s = $(".hs-slider");
    hero_s.owlCarousel({
        loop: true,
        margin: 0,
        nav: true,
        items: 1,
        dots: false,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false
    });

    /*------------------
        Team Slider
    --------------------*/
    $(".ts-slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        dotsEach: 2,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {
            320: {
                items: 1,
            },
            768: {
                items: 2,
            },
            992: {
                items: 3,
            }
        }
    });

    /*------------------
        Testimonial Slider
    --------------------*/
    $(".ts_slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*------------------
        Image Popup
    --------------------*/
    $('.image-popup').magnificPopup({
        type: 'image'
    });

    /*------------------
        Video Popup
    --------------------*/
    $('.video-popup').magnificPopup({
        type: 'iframe'
    });

    /*------------------
        Barfiller
    --------------------*/
    $('#bar1').barfiller({
        barColor: '#ffffff',
        duration: 2000
    });
    $('#bar2').barfiller({
        barColor: '#ffffff',
        duration: 2000
    });
    $('#bar3').barfiller({
        barColor: '#ffffff',
        duration: 2000
    });

    $('.table-controls ul li').on('click', function () {
        var tsfilter = $(this).data('tsfilter');
        $('.table-controls ul li').removeClass('active');
        $(this).addClass('active');

        if (tsfilter == 'all') {
            $('.class-timetable').removeClass('filtering');
            $('.ts-meta').removeClass('show');
        } else {
            $('.class-timetable').addClass('filtering');
        }
        $('.ts-meta').each(function () {
            $(this).removeClass('show');
            if ($(this).data('tsmeta') == tsfilter) {
                $(this).addClass('show');
            }
        });
    });

})(jQuery);

(function () {
    "use strict";

    var loader = document.getElementById("hitboxe-loader");
    if (!loader) return;

    var progress = 0;
    var progressBar = null;
    var progressInterval = null;
    var navegando = false;

    var componentesOk = false;
    var paginaOk = document.readyState === "complete";
    var finalizado = false;

    /* =================================================
       INICIALIZAÇÃO (depois que o loader.html existe)
    ================================================= */
    function iniciarLoader() {
        progressBar = document.querySelector(".loader-progress-bar");
        if (!progressBar) return;

        // A barra sobe devagar até 90%
        progressInterval = setInterval(function () {
            if (progress < 90) {
                progress += 1;
                progressBar.style.width = progress + "%";
            }
        }, 100);

        tentarFinalizar();
    }

    /* =================================================
       FINALIZAÇÃO (precisa de página + componentes)
    ================================================= */
    function tentarFinalizar() {
        if (finalizado || !progressBar) return;
        if (!(paginaOk && componentesOk)) return;

        finalizado = true;
        clearInterval(progressInterval);

        setTimeout(function () {
            progress = 100;
            progressBar.style.width = "100%";

            // Mantém 100% na tela para o usuário ver
            setTimeout(function () {
                loader.classList.add("loader-hidden");
            }, 1200);
        }, 500);
    }

    document.addEventListener("loaderReady", iniciarLoader);

    document.addEventListener("componentsLoaded", function () {
        componentesOk = true;
        tentarFinalizar();
    });

    window.addEventListener("load", function () {
        paginaOk = true;
        tentarFinalizar();
    });

    /* =================================================
       LOADER AO TROCAR DE PÁGINA
       (delegação de eventos: funciona com links injetados)
    ================================================= */
    document.addEventListener("click", function (event) {
        var link = event.target.closest("a");
        if (!link || navegando) return;

        var href = link.getAttribute("href");
        if (!href || href === "#" || href.charAt(0) === "#") return;

        // Links externos
        if (
            href.indexOf("http://") === 0 ||
            href.indexOf("https://") === 0 ||
            href.indexOf("//") === 0 ||
            href.indexOf("mailto:") === 0 ||
            href.indexOf("tel:") === 0 ||
            href.indexOf("javascript:") === 0
        ) return;

        // Nova aba, teclas modificadoras, botão que não é o esquerdo
        if (
            link.target === "_blank" ||
            link.hasAttribute("download") ||
            event.ctrlKey || event.shiftKey || event.metaKey ||
            event.button !== 0
        ) return;

        // Sem barra para animar, navega normalmente
        var bar = document.querySelector(".loader-progress-bar");
        if (!bar) return;

        event.preventDefault();
        navegando = true;
        clearInterval(progressInterval);

        progressBar = bar;
        loader.classList.remove("loader-hidden");

        progress = 0;
        progressBar.style.width = "0%";

        var pageProgress = 0;
        var pageInterval = setInterval(function () {
            pageProgress += 2;

            if (pageProgress >= 100) {
                clearInterval(pageInterval);
                progressBar.style.width = "100%";

                setTimeout(function () {
                    window.location.href = href;
                }, 700);
            } else {
                progressBar.style.width = pageProgress + "%";
            }
        }, 40);
    });

    /* =================================================
       VOLTAR PELO BOTÃO DO NAVEGADOR (cache bfcache)
    ================================================= */
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            navegando = false;
            loader.classList.add("loader-hidden");
        }
    });
})();