import { cn } from "@/lib/utils";

interface ImageSource {
  src: string;
  alt: string;
}

interface RevealImageListItemProps {
  text: string;
  images: [ImageSource, ImageSource];
  color?: string;
  icon?: React.ReactNode;
}

function RevealImageListItem({ text, images, color, icon }: RevealImageListItemProps) {
  const container = "absolute right-8 -top-1 z-40 h-20 w-16";
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-md";

  return (
    <div className="group relative h-fit w-fit overflow-visible py-6 sm:py-8">
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className="transition-all duration-500 group-hover:scale-110"
            style={{ color }}
          >
            {icon}
          </div>
        )}
        <h2
          className="text-4xl sm:text-5xl lg:text-7xl font-black transition-all duration-500 group-hover:opacity-40"
          style={{ color: "white" }}
        >
          {text}
        </h2>
      </div>
      <div className={container}>
        <div className={effect}>
          <img
            alt={images[1].alt}
            src={images[1].src}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12"
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img
            alt={images[0].alt}
            src={images[0].src}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      {/* Colored underline on hover */}
      <div
        className="absolute bottom-4 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

interface RevealImageListProps {
  items: RevealImageListItemProps[];
  label?: string;
}

function RevealImageList({ items, label }: RevealImageListProps) {
  return (
    <div className="flex flex-col gap-1 px-0 py-4">
      {label && (
        <h3 className="text-[10px] font-medium tracking-[0.3em] uppercase mb-4 text-white/30">
          {label}
        </h3>
      )}
      {items.map((item, index) => (
        <RevealImageListItem key={index} {...item} />
      ))}
    </div>
  );
}

export { RevealImageList, RevealImageListItem };
export type { RevealImageListItemProps, ImageSource };
