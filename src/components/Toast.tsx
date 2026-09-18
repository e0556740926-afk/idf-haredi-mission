export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue text-white px-[22px] py-[13px] rounded-xl z-20 shadow-[0_5px_30px_#0002] text-[13px] max-w-[90%] text-center"
    >
      {message}
    </div>
  );
}
