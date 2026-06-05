interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className="h-2 rounded-full transition-all duration-300 ease-out"
          style={{
            width: currentStep === step ? 32 : 8,
            background:
              currentStep === step
                ? "var(--accent)"
                : step < currentStep
                ? "rgba(242, 169, 0, 0.5)"
                : "rgba(255, 255, 255, 0.15)",
          }}
        />
      ))}
    </div>
  );
}
