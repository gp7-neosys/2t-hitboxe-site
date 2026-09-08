$(document).ready(function () {
    var $slider = $('.hs-slider').owlCarousel({
        items: 1,
        loop: true,
        nav: false,
        dots: true,
        autoplay: false,
        smartSpeed: 600
    });

    // vincula o 'ended' direto em CADA vídeo (sem delegação)
    function bindVideoEnded() {
        $slider.find('.hs-video-bg').off('ended').on('ended', function () {
            $slider.trigger('next.owl.carousel');
        });
    }
    bindVideoEnded();

    // toca o vídeo do slide ativo (ou agenda troca se for imagem)
    $slider.on('changed.owl.carousel', function (e) {
        var $activeItem = $slider.find('.owl-item').eq(e.item.index);
        var $video = $activeItem.find('.hs-video-bg');

        // pausa todos os outros vídeos, por segurança
        $slider.find('.hs-video-bg').not($video).each(function () {
            this.pause();
        });

        if ($video.length) {
            $video[0].currentTime = 0;
            $video[0].play();
        } else {
            setTimeout(function () {
                $slider.trigger('next.owl.carousel');
            }, 5000);
        }
    });
});