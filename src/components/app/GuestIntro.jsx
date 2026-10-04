import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import introVideo from '../../assets/مقدمه AD.MP4';
import './GuestIntro.css';

const INTRO_SESSION_KEY = 'ad-card:guest-intro-seen';

const hasSeenIntro = () => {
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
  } catch {
    // The intro remains functional when storage is unavailable.
  }
};

const GuestIntro = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => !isAuthenticated && !hasSeenIntro());
  const [needsSoundPermission, setNeedsSoundPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const closeIntro = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    markIntroSeen();
    setIsVisible(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsVisible(false);
      return;
    }

    if (!hasSeenIntro()) setIsVisible(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isVisible || !videoRef.current) return undefined;

    const video = videoRef.current;
    video.muted = false;
    video.volume = 1;

    const playWithSound = async () => {
      try {
        await video.play();
        setNeedsSoundPermission(false);
        setIsMuted(false);
      } catch {
        // Browsers generally block unmuted autoplay. Keep the intro moving and
        // offer a single-tap way to enable its original sound.
        video.muted = true;
        setIsMuted(true);
        setNeedsSoundPermission(true);
        video.play().catch(() => {});
      }
    };

    playWithSound();
    return () => video.pause();
  }, [isVisible]);

  const enableSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      setIsMuted(false);
      setNeedsSoundPermission(false);
    } catch {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    setNeedsSoundPermission(false);
    if (!video.muted) video.play().catch(() => {});
  };

  if (!isVisible || isAuthenticated) return null;

  return (
    <section className="guest-intro" dir="rtl" aria-label="مقدمة AD Card">
      <video
        ref={videoRef}
        className="guest-intro__video"
        src={introVideo}
        autoPlay
        playsInline
        preload="auto"
        onEnded={closeIntro}
      />
      <div className="guest-intro__shade" aria-hidden="true" />

      <div className="guest-intro__topbar">
        <span className="guest-intro__eyebrow">AD CARD</span>
        <button type="button" className="guest-intro__skip" onClick={closeIntro}>
          <span>تخطي المقدمة</span>
          <X size={17} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      <div className="guest-intro__content">
        {needsSoundPermission ? (
          <button type="button" className="guest-intro__sound-cta" onClick={enableSound}>
            <Volume2 size={21} aria-hidden="true" />
            تشغيل المقدمة بالصوت
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="guest-intro__volume"
        onClick={toggleMute}
        aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
      >
        {isMuted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
      </button>
    </section>
  );
};

export default GuestIntro;
