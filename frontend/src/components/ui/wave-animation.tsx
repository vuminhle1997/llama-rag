export function WaveBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-56 md:h-64 overflow-hidden select-none"
    >
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-auto"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <g className="wave-1">
          <path
            fill="#2563eb"
            fillOpacity="0.25"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
          <path
            fill="#2563eb"
            fillOpacity="0.35"
            d="M0,120L60,124C120,128,240,136,360,141.3C480,147,600,149,720,144C840,139,960,128,1080,122.7C1200,117,1320,117,1380,117.3L1440,118L1440,200L1380,200C1320,200,1200,200,1080,200C960,200,840,200,720,200C600,200,480,200,360,200C240,200,120,200,60,200L0,200Z"
          />
        </g>
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-auto"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <g className="wave-2">
          <path
            fill="#10b981"
            fillOpacity="0.20"
            d="M0,128L40,122.7C80,117,160,107,240,96C320,85,400,75,480,80C560,85,640,107,720,117.3C800,128,880,128,960,122.7C1040,117,1120,107,1200,112C1280,117,1360,139,1400,149.3L1440,160L1440,200L1400,200C1360,200,1280,200,1200,200C1120,200,1040,200,960,200C880,200,800,200,720,200C640,200,560,200,480,200C400,200,320,200,240,200C160,200,80,200,40,200L0,200Z"
          />
          <path
            fill="#10b981"
            fillOpacity="0.28"
            d="M0,144L48,149.3C96,155,192,165,288,170.7C384,176,480,176,576,170.7C672,165,768,155,864,149.3C960,144,1056,144,1152,154.7C1248,165,1344,187,1392,192L1440,197L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"
          />
        </g>
      </svg>
      <style jsx>{`
        @keyframes waveSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes waveSlideSlow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .wave-1 {
          animation: waveSlide 22s linear infinite;
        }
        .wave-2 {
          animation: waveSlideSlow 32s linear infinite;
        }
      `}</style>
    </div>
  );
}
