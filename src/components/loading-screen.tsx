// import { Spinner } from "./ui/spinner"

// const LoadingScreen = () => {
//   return (
//     <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
//       <Spinner className="size-6" />
//     </div>
//   )
// }

// export { LoadingScreen }

const LoadingScreen = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span
          className="absolute h-24 w-24 rounded-full border border-foreground/40"
          style={{ animation: "hb-ring 1.6s ease-out infinite 0s" }}
        />
        <span
          className="absolute h-16 w-16 rounded-full border border-foreground/40"
          style={{ animation: "hb-ring 1.6s ease-out infinite 0.22s" }}
        />
        <span
          className="absolute h-10 w-10 rounded-full border border-foreground/40"
          style={{ animation: "hb-ring 1.6s ease-out infinite 0.44s" }}
        />

        <span
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/60"
          style={{ animation: "hb-core 1.6s ease-in-out infinite" }}
        >
          <span className="h-2 w-2 rounded-full bg-background" />
        </span>

        <style>{`
          @keyframes hb-ring {
            0%   { transform: scale(0.4); opacity: 0.7; }
            60%  { transform: scale(1);   opacity: 0.2; }
            100% { transform: scale(1.1); opacity: 0;   }
          }
          @keyframes hb-core {
            0%   { transform: scale(1);    opacity: 0.60; }
            12%  { transform: scale(1.35); opacity: 0.80; }
            25%  { transform: scale(0.9);  opacity: 0.50; }
            38%  { transform: scale(1.2);  opacity: 0.70; }
            55%  { transform: scale(1);    opacity: 0.60; }
            100% { transform: scale(1);    opacity: 0.60; }
          }
        `}</style>
      </div>
    </div>
  )
}

export { LoadingScreen }
