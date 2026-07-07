export function Lights() {
  return (
    <>
      <ambientLight intensity={1.45} />
      <directionalLight position={[3, 5, 4]} intensity={2.4} />
      <pointLight position={[-2.8, 1.8, 3]} intensity={18} distance={8} />
      <pointLight position={[2.8, -1.8, 2.4]} intensity={10} distance={7} />
    </>
  );
}
