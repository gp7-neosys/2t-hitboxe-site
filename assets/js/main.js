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
                /* =================================================
                   ELEMENTOS
                ================================================= */
                const loader = document.getElementById("hitboxe-loader");
                const progressBar = document.querySelector(".loader-progress-bar");
                if (!loader || !progressBar) {
                    return;
                }
                /* =================================================
                   VARIÁVEIS
                ================================================= */
                let progress = 0;
                /* =================================================
                   CARREGAMENTO DA PÁGINA
                ================================================= */
                const progressInterval = setInterval(function () {
                    /*
                     * A barra vai lentamente até 90%.
                     */
                    if (progress < 90) {
                        progress += 1;
                        progressBar.style.width = progress + "%";
                    }
                }, 100);
                /* =================================================
                   PÁGINA TOTALMENTE CARREGADA
                ================================================= */
                window.addEventListener("load", function () {
                    clearInterval(progressInterval);
                    /*
                     * Pequeno tempo antes
                     * de completar a barra.
                     */
                    setTimeout(function () {
                        progress = 100;
                        progressBar.style.width = "100%";
                        /*
                         * Mantém 100% na tela
                         * para o usuário visualizar.
                         */
                        setTimeout(function () {
                            loader.classList.add("loader-hidden");
                        }, 1200);
                    }, 500);
                });
                /* =================================================
                   LOADER AO TROCAR DE PÁGINA
                ================================================= */
                document.addEventListener("click", function (event) {
                    const link = event.target.closest("a");
                    if (!link) {
                        return;
                    }
                    const href = link.getAttribute("href");
                    if (!href) {
                        return;
                    }
                    /*
                     * Não faz loader para #.
                     */
                    if (href === "#") {
                        return;
                    }
                    /*
                     * Links externos não recebem
                     * o loader de troca de página.
                     */
                    if (
                        href.startsWith("http://") ||
                        href.startsWith("https://") ||
                        href.startsWith("//") ||
                        href.startsWith("mailto:") ||
                        href.startsWith("tel:")
                    ) {
                        return;
                    }
                    /*
                     * Não interfere em abrir
                     * link em nova aba.
                     */
                    if (
                        link.target === "_blank" ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.metaKey ||
                        event.button !== 0
                    ) {
                        return;
                    }
                    /*
                     * Impede a troca imediata.
                     */
                    event.preventDefault();
                    /*
                     * Mostra o loader.
                     */
                    loader.classList.remove("loader-hidden");
                    /*
                     * Reinicia barra.
                     */
                    progress = 0;
                    progressBar.style.width = "0%";
                    /*
                     * Carregamento visual
                     * da troca de página.
                     */
                    let pageProgress = 0;
                    const pageInterval = setInterval(function () {
                        pageProgress += 2;
                        if (pageProgress >= 100) {
                            pageProgress = 100;
                            progressBar.style.width = "100%";
                            clearInterval(pageInterval);
                            /*
                             * Segura a tela
                             * antes da navegação.
                             */
                            setTimeout(function () {
                                window.location.href = href;
                            }, 700);
                        } else {
                            progressBar.style.width = pageProgress + "%";
                        }
                    }, 40);
                });
            })();