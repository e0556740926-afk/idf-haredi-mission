export function StepHead({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex gap-[10px] items-center my-[23px] mb-3">
      <span className="w-[25px] h-[25px] border border-[#c7d3e0] rounded-full grid place-items-center text-blue text-[12px]">
        {step}
      </span>
      <h3 className="text-[16px]">{title}</h3>
    </div>
  );
}
