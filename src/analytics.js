const GA_MEASUREMENT_ID = 'G-264851XE35';
const PRODUCTION_HOSTS = new Set(['frontlab.kr', 'www.frontlab.kr']);

export function initAnalytics() {
	if (!PRODUCTION_HOSTS.has(window.location.hostname)) return;

	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag() {
		window.dataLayer.push(arguments);
	};

	window.gtag('js', new Date());
	window.gtag('config', GA_MEASUREMENT_ID);

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
	document.head.appendChild(script);
}

export function trackEvent(name, parameters = {}) {
	window.gtag?.('event', name, parameters);
}
