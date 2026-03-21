export default function ShapesGrid() {
  const shapes = [
    { x: 50, y: 100, color: "#FFB3AB", r: 60 },
    { x: 200, y: 50, color: "#008755", r: 40 },
    { x: 350, y: 150, color: "#305379", r: 50 },
    { x: 500, y: 80, color: "#DB6B30", r: 45 },
    { x: 100, y: 300, color: "#7C6992", r: 55 },
    { x: 300, y: 350, color: "#C63527", r: 35 },
    { x: 600, y: 250, color: "#FFA400", r: 65 },
    { x: 700, y: 400, color: "#00594F", r: 50 },
    { x: 150, y: 500, color: "#305379", r: 40 },
    { x: 450, y: 450, color: "#FFB3AB", r: 45 },
  ];

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {shapes.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} />
      ))}
    </svg>
  );
}
