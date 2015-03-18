$(function () {

                // You can use any kind of selectors for jQuery Fluidbox
                $('#product-gallery a').fluidbox();

                // Load an image dynamically
                $('a[data-func="loadImg"]').on('click', function(e) {
                    e.preventDefault();

                    // Construct new content
                    $newContent = $('<p>This paragraph and its accompanying image are dynamically-added.</p><a href="http://i.imgur.com/aNhtkPh.jpg" title="" data-fluidbox><img src="http://i.imgur.com/aNhtkPh.jpg" alt="" title="" /></a>');

                    // Append new content to immediate sibling, <article>
                    // Then search for the anchor we want fluidbox to work on, apply method .fluidobx()
                    $(this)
                        .next('article')
                        .append($newContent)
                        .find('a[data-fluidbox]')
                            .fluidbox();

                    // Prevent repeated appending of content, just because it's gonna be silly
                    $(this).off('click').on('click', function(e) {
                        e.preventDefault();
                    });
                });

                // Smooth scrolling plugin by Chris Coiyer - not needed for Fluidbox functionality
                // Source: http://css-tricks.com/snippets/jquery/smooth-scrolling/
                $('a[href*=#]:not([href=#])').click(function() {
                    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                        var target = $(this.hash);
                        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                        if (target.length) {
                            $('html,body').animate({
                                scrollTop: target.offset().top
                            }, 1000);
                            return false;
                        }
                    }
                });
            });