<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import Lenis from 'lenis';
import { trackEvent } from './analytics';

const hero = ref(null);
const video = ref(null);
const progress = ref(0);
const videoReady = ref(false);
const mobileOpen = ref(false);
const reducedMotion = ref(false);

const scenes = [
	{ from: 0, to: 0.2, title: '사용자에게 필요한 기능을\n먼저 정의합니다.' },
	{ from: 0.18, to: 0.4, title: '정보와 기능을\n명확한 구조로 정리합니다.' },
	{ from: 0.38, to: 0.6, title: '누구나 쉽게 사용할 수 있는\nUI를 디자인합니다.' },
	{ from: 0.58, to: 0.8, title: '디자인을 빠르고 안정적인\n웹으로 개발합니다.' },
	{ from: 0.78, to: 1.01, title: 'UI/UX 디자인부터\n프론트엔드 개발까지.', final: true },
];

const currentScene = computed(() => {
	const active = scenes.findIndex((scene) => progress.value >= scene.from && progress.value < scene.to);
	return active === -1 ? scenes.length - 1 : active;
});

const projects = [
	{
		no: '01',
		type: '프론트엔드 · 웹 퍼블리싱',
		name: '헥토그룹 셀링부스터',
		desc: '마켓 트렌드부터 성과 리포트까지 연결하는 셀러 데이터 플랫폼',
		color: 'violet',
		image: '/assets/sellingbooster.png',
		url: 'https://sellingbooster.io/',
	},
	{
		no: '02',
		type: '프론트엔드 · 웹 퍼블리싱',
		name: 'NE능률 NE Tutor',
		desc: '진단·처방·교수학습·평가를 연결하는 대한민국 대표 티칭 플랫폼',
		color: 'orange',
		image: '/assets/netutor.png',
		url: 'https://www.netutor.co.kr/',
	},
	{
		no: '03',
		type: '프론트엔드 · 웹 퍼블리싱',
		name: 'CG인바이츠 인바이츠루프',
		desc: '건강정보와 일상을 연결하는 디지털 헬스케어 서비스',
		color: 'blue',
		image: '/assets/invitesloop.png',
		url: 'https://www.invitesloop.com/',
	},
	{
		no: '04',
		type: '프론트엔드 · 웹 퍼블리싱',
		name: '법무법인 광장',
		desc: '전문성과 신뢰를 명료하게 전달하는 법무법인 공식 웹사이트',
		color: 'stone',
		image: '/assets/leeko.png',
		url: 'https://www.leeko.com/',
	},
];

const services = [
	{
		no: '01',
		name: 'UI/UX 디자인',
		desc: '사용자의 흐름과 비즈니스 목표를 연결해 직관적이고 아름다운 디지털 경험을 설계합니다.',
		tags: ['사용자 경험 전략', 'UI 디자인', '프로토타입', '디자인 시스템'],
	},
	{
		no: '02',
		name: '웹 퍼블리싱',
		desc: '디자인의 디테일을 놓치지 않으면서 모든 화면에서 빠르고 접근 가능한 웹으로 구현합니다.',
		tags: ['반응형 웹', '인터랙션', '웹 접근성', '마크업'],
	},
	{
		no: '03',
		name: '프론트엔드 개발',
		desc: '운영과 확장을 고려한 컴포넌트 구조로 안정적인 제품을 개발하고 실제 서비스에 연결합니다.',
		tags: ['Vue', 'React', 'Nuxt', 'API 연동'],
	},
];

let frameId = 0;
let targetTime = 0;
let lenis = null;

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function updateScroll() {
	if (!hero.value) return;
	const rect = hero.value.getBoundingClientRect();
	const max = hero.value.offsetHeight - window.innerHeight;
	progress.value = clamp(-rect.top / max, 0, 1);
	targetTime = (video.value?.duration || 0) * progress.value;
}

function renderFrame(time) {
	lenis?.raf(time);
	if (video.value && videoReady.value && !reducedMotion.value) {
		const delta = targetTime - video.value.currentTime;
		if (!video.value.seeking && Math.abs(delta) > 0.03) {
			video.value.currentTime = Math.min(targetTime, Math.max(0, video.value.duration - 0.04));
		}
	}
	frameId = requestAnimationFrame(renderFrame);
}

function onVideoReady() {
	videoReady.value = true;
	updateScroll();
}

function scrollToId(id) {
	mobileOpen.value = false;
	trackEvent('navigation_click', { section: id.replace('#', '') });
	if (lenis) {
		lenis.scrollTo(id, { duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
	} else {
		document.querySelector(id)?.scrollIntoView({ behavior: reducedMotion.value ? 'auto' : 'smooth' });
	}
}

function trackProject(project) {
	trackEvent('project_click', {
		project_name: project.name,
		project_url: project.url,
	});
}

function trackEmail() {
	trackEvent('generate_lead', { contact_method: 'email' });
}

onMounted(async () => {
	reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	await nextTick();
	if (reducedMotion.value) progress.value = 1;
	if (!reducedMotion.value) {
		lenis = new Lenis({
			lerp: 0.075,
			wheelMultiplier: 0.85,
			smoothWheel: true,
			syncTouch: false,
		});
	}
	window.addEventListener('scroll', updateScroll, { passive: true });
	window.addEventListener('resize', updateScroll);
	if (!reducedMotion.value) updateScroll();
	frameId = requestAnimationFrame(renderFrame);
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', updateScroll);
	window.removeEventListener('resize', updateScroll);
	lenis?.destroy();
	cancelAnimationFrame(frameId);
});
</script>

<template>
	<div class="site-shell">
		<header class="header" :class="{ 'header--solid': progress > 0.82 || mobileOpen, 'header--menu-open': mobileOpen }">
			<a class="logo" href="#top" aria-label="FrontLAB 홈" @click.prevent="scrollToId('#top')"> Front<span>LAB</span> </a>
			<nav class="desktop-nav" aria-label="주요 메뉴">
				<button @click="scrollToId('#work')">프로젝트</button>
				<button @click="scrollToId('#services')">서비스</button>
				<button @click="scrollToId('#about')">소개</button>
			</nav>
			<button class="contact-link" @click="scrollToId('#contact')">프로젝트 문의</button>
			<button
				class="menu-button"
				:class="{ 'menu-button--open': mobileOpen }"
				:aria-expanded="mobileOpen"
				:aria-label="mobileOpen ? '메뉴 닫기' : '메뉴 열기'"
				@click="mobileOpen = !mobileOpen"
			>
				<span></span><span></span>
			</button>
			<div v-if="mobileOpen" class="mobile-nav">
				<button @click="scrollToId('#work')">프로젝트</button>
				<button @click="scrollToId('#services')">서비스</button>
				<button @click="scrollToId('#about')">소개</button>
				<button @click="scrollToId('#contact')">문의</button>
			</div>
		</header>

		<main>
			<section id="top" ref="hero" class="hero" aria-label="프론트랩 소개">
				<div class="hero-sticky">
					<video ref="video" class="hero-video" muted playsinline preload="auto" aria-hidden="true" @loadedmetadata="onVideoReady">
						<!-- <source media="(max-width: 700px)" src="/assets/frontlab-concept-mobile.mp4" type="video/mp4" /> -->
						<source src="./../public/video/18069232-uhd_3840_2160_24fps.mp4" type="video/mp4" />
					</video>
					<div class="video-shade"></div>

					<div class="scene-wrap" aria-live="polite">
						<Transition name="scene" mode="out-in">
							<div :key="currentScene" class="scene" :class="{ 'scene--final': scenes[currentScene].final }">
								<h1>{{ scenes[currentScene].title }}</h1>
								<div v-if="scenes[currentScene].final" class="hero-actions">
									<button class="button button--light" @click="scrollToId('#work')">작업 사례 보기</button>
									<button class="button button--ghost" @click="scrollToId('#contact')">프로젝트 문의</button>
								</div>
							</div>
						</Transition>
					</div>

					<div class="scroll-meter">
						<span></span>
						<div><i :style="{ transform: `scaleX(${progress})` }"></i></div>
						<b>{{ String(Math.round(progress * 100)).padStart(2, '0') }}</b>
					</div>

					<div v-if="!videoReady" class="loader">
						<span></span>
						<p>Loading experience</p>
					</div>
				</div>
			</section>

			<section id="work" class="section section--light work-section">
				<div class="section-head reveal-block">
					<span class="kicker">주요 프로젝트</span>
					<h2>문제를 해결하고<br />경험을 바꾼 작업들.</h2>
					<p>화면을 만드는 데서 그치지 않습니다.<br />사용자와 비즈니스에 필요한 변화를 구현합니다.</p>
				</div>

				<div class="project-list">
					<a
						v-for="project in projects"
						:key="project.no"
						class="project-card"
						:href="project.url"
						target="_blank"
						rel="noreferrer"
						@click="trackProject(project)"
					>
						<div class="project-visual" :class="`project-visual--${project.color}`">
							<div class="mock-browser">
								<div class="mock-top"><i></i><i></i><i></i><span></span></div>
								<div class="mock-screen">
									<img :src="project.image" :alt="`${project.name} 웹사이트 스크린샷`" loading="lazy" />
								</div>
							</div>
							<span class="view-project">
								<span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
							</span>
						</div>
						<div class="project-copy">
							<h3>{{ project.name }}</h3>
							<p>{{ project.desc }}</p>
						</div>
					</a>
				</div>
			</section>

			<section id="services" class="section services-section">
				<div class="section-head section-head--dark">
					<span class="kicker">제공 서비스</span>
					<h2>설계부터 구현까지,<br />하나의 흐름으로.</h2>
				</div>
				<div class="service-list">
					<article v-for="service in services" :key="service.no" class="service-row">
						<span class="service-no">{{ service.no }}</span>
						<h3>{{ service.name }}</h3>
						<div class="service-detail">
							<p>{{ service.desc }}</p>
							<div class="tags">
								<span v-for="tag in service.tags" :key="tag">{{ tag }}</span>
							</div>
						</div>
					</article>
				</div>
			</section>

			<section id="about" class="section section--accent about-section">
				<div class="about-label"><span>작은 팀.</span><span>높은 완성도.</span></div>
				<div class="about-copy">
					<span class="kicker">FrontLAB 소개</span>
					<h2>두 명의 실무자가<br />처음부터 끝까지<br />직접 함께합니다.</h2>
					<p>적은 커뮤니케이션 단계, 빠른 판단, 높은 실행 밀도. 디자인과 개발의 경계를 넘나들며 실제로 작동하는 결과를 만듭니다.</p>
				</div>
				<div class="team-grid">
					<article>
						<div class="team-photo team-photo--dev">
							<img src="./../public/assets/man.png" alt="" />
						</div>
						<div>
							<h3>프론트엔드 개발</h3>
							<p>전략 · 구조 설계 · 개발</p>
						</div>
					</article>
					<article>
						<div class="team-photo team-photo--design">
							<img src="./../public/assets/woman.png" alt="" />
						</div>
						<div>
							<h3>UI/UX 디자인</h3>
							<p>조사 · 사용자 경험 · 시각 디자인</p>
						</div>
					</article>
				</div>
			</section>

			<section id="contact" class="section contact-section">
				<div>
					<span class="kicker">프로젝트 문의</span>
					<h2>만들고 싶은<br />제품이 있나요?</h2>
				</div>
				<div class="contact-side">
					<p>아직 정리되지 않은 아이디어도 괜찮습니다.<br />현재 단계부터 편하게 들려주세요.</p>
					<a class="contact-email" href="mailto:contact@frontlab.kr" @click="trackEmail">
						<span>contact@frontlab.kr</span>
						<span class="material-symbols-rounded" aria-hidden="true">mail</span>
					</a>
				</div>
				<footer>
					<a class="logo" href="#top">Front<span>LAB</span></a>
					<button @click="scrollToId('#top')">맨 위로 ↑</button>
				</footer>
			</section>
		</main>
	</div>
</template>
