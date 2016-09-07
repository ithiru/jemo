
$(document).foundation();
$('.jscroll').jscroll({
	loadingHtml: '<img src="/loading.gif" alt="Loading" /> Loading...',
	nextSelector: 'a.jscroll-next',
	contentSelector: '.jscroll',
	callback: function() {
		$(".leftnav").hide();
	}
});	

/* globals hopscotch: false */

/* ============ */
/* EXAMPLE TOUR */
/* ============ */
var tour = {
  id: 'books',
  steps: [
    {
      target: 'book-tour',
      title: 'நல்வரவு!',
      content: 'இங்கு ஜெயமோகனின் நாவல், கதை, குறுநாவல், கட்டுரைகளை படிக்க நீங்கள் உங்களுக்குப் பிடித்ததை சொடுக்கவும் அல்லது தொடவும்.',
      placement: 'right',
      xOffset: 'center',
      arrowOffset: 'center'
    },
    {
      target: "volumes-tour",
      title: 'புத்தகப் பகுதியை தேர்ந்தெடுக்கவும்.',
      content: 'நீங்கள் தேர்ந்த்தெடுக்கும் புத்தகம் பகுதிகளாக பிரிக்கப்பட்டிருந்தால் அவைகளின் பட்டியல் இங்கு வரிசை படுத்தப்படும். விரும்பிய பகுதியை சொடுக்கவும் அல்லது தொடவும்.',
      placement: 'right',
      yOffset: -20
    },
    {
      target: 'book-cover-tour',
      placement: 'left',
      title: 'புத்தகத்தின் அட்டைப்படம்',
      content: 'இது நீங்கள் தேர்ந்த்தெடுக்கும் புத்தகத்தின் அட்டைப்படம்'
    },
    {
      target: 'chapters-tour',
      placement: 'right',
      title: 'அத்தியாயங்கள்',
      content: 'நீங்கள் தேர்ந்த்தெடுக்கும் புத்தத்தின் பகுதி அத்தியாயங்களாக பிரிக்கப்பட்டிருந்தால் அவைகளின் பட்டியல் இங்கு வரிசை படுத்தப்படும். விரும்பிய அத்தியாயத்தை சொடுக்கவும் அல்லது தொடவும்.',
      yOffset: -25
    },		
    {
      target: 'volume-cover-tour',
      placement: 'left',
      title: 'புத்தகப் பகுதியின் அட்டைப்படம்.',
      content: 'இது நீங்கள் தேர்ந்த்தெடுக்கும் புத்தகப் பகுதியின் அட்டைப்படம்.',
      yOffset: -25
    },
    {
      target: 'chapter-topic-tour',
      placement: 'top',
      title: 'அத்தியாயத்தின் விவரம்',
      content: 'நீங்கள் படிக்கும் அத்தியாயத்தின் விவரம் - பகுதியின் பெயர் மற்றும் அத்தியாயத்தின் பெயர்.',
      arrowOffset: 100
    },
    {
      target: 'chapter-nav-tour',
      placement: 'left',
      title: 'முன்னும் பின்னும் செல்ல',
      content: 'நீங்கள் முந்தய அல்லது அடுத்த அத்தியாயத்திற்கு செல்ல முந்தய அல்லது அடுத்த அத்தியாயத்தின் பெயரை இங்கு சொடுக்கவும். ',
    },
    {
      target: 'chapter-poster-tour',
      placement: 'left',
      title: 'ஒவியம்/புகைப்படம்',
      content: 'நீங்கள் படிக்கும் அத்தியாயத்தில் ஒவியம் இருந்தால் அது இங்கு பதிக்கப்படும். பெரிதாக பார்க்க ஒவியத்தை சொடுக்கவும் அல்லது தொடவும்.',
    },
    {
      target: 'chapter-nav-auto-tour',
      placement: 'top',
      title: 'அடுத்த அத்தியாயம் செல்ல',
      content: 'நீங்கள் அடுத்த அத்தியாயம் செல்வதற்கு சொடுக்க வேண்டிய அவசியம் இல்லை, நீங்கள் அத்தியாயத்தின் இறுதியான வாக்கியத்திற்கு வந்தவுடன், தானாகவே அடுத்த அத்தியாயம் வந்துவிடும்.'
    },
    {
      target: 'author-tour',
      placement: 'left',
      title: 'எழுத்தாளர் ஜெயமோகன்',
      content: 'எழுத்தாளர் ஜெயமோனைப்பற்றி தெரிந்து கொள்ள இங்கு சொடுக்கவும் அல்லது தொடவும்.'
    },
    {
      target: 'home-tour',
      placement: 'right',
      title: 'முகப்பு',
      content: 'முகப்புக்கு செல்ல இங்கு சொடுக்கவும் அல்லது தொடவும்.'
    }	
  ],
  showPrevButton: true,
  scrollTopMargin: 100
},

/* ========== */
/* TOUR SETUP */
/* ========== */
addClickListener = function(el, fn) {
  if (el.addEventListener) {
    el.addEventListener('click', fn, false);
  }
  else {
    el.attachEvent('onclick', fn);
  }
},

init = function() {
  var startBtnId = 'startTourBtn',
      calloutId = 'startTourCallout',
      mgr = hopscotch.getCalloutManager(),
      state = hopscotch.getState();

  if (state && state.indexOf('hello-hopscotch:') === 0) {
    // Already started the tour at some point!
    hopscotch.startTour(tour);
  }
  else {
    // Looking at the page for the first(?) time.
    setTimeout(function() {
      mgr.createCallout({
        id: calloutId,
        target: startBtnId,
        placement: 'top',
        title: 'Take an example tour',
        content: 'Start by taking an example tour to see Hopscotch in action!',
        xOffset: 'center',
        arrowOffset: 'center',
        width: 240
      });
    }, 100);
  }

  addClickListener(document.getElementById(startBtnId), function() {
    if (!hopscotch.isActive) {
      mgr.removeAllCallouts();
      hopscotch.startTour(tour);
    }
  });
};

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-55130844-1', 'auto');
ga('send', 'pageview');
