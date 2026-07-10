"use client";

import { BmiActions } from "@/components/bmi/BmiActions";
import { BmiForm } from "@/components/bmi/BmiForm";
import { BmiResult } from "@/components/bmi/BmiResult";
import { useBmiAnalyzer } from "@/hooks/useBmiAnalyzer";

/**
 * Main calculator feature shell. All stateful BMI logic now lives in
 * `useBmiAnalyzer()` so this component can focus on wiring the UI sections
 * together.
 *
 * @returns {import("react").JSX.Element}
 */
export function BmiAnalyzer() {
  const {
    actionError,
    actionStatus,
    authEnabled,
    busyAction,
    categoryContent,
    error,
    form,
    handleCalculate,
    handleExport,
    handleReset,
    handleSave,
    loginHref,
    pendingAction,
    result,
    resultRef,
    registerHref,
    status,
    updateField,
  } = useBmiAnalyzer();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <BmiForm
        authEnabled={authEnabled}
        error={error}
        form={form}
        onCalculate={handleCalculate}
        onReset={handleReset}
        status={status}
        updateField={updateField}
      />

      <div className="space-y-6">
        <BmiResult
          categoryContent={categoryContent}
          result={result}
          resultRef={resultRef}
        />
        <BmiActions
          actionError={actionError}
          actionStatus={actionStatus}
          busyAction={busyAction}
          hasResult={Boolean(result)}
          loginHref={loginHref}
          onExport={handleExport}
          onSave={handleSave}
          pendingAction={pendingAction}
          registerHref={registerHref}
        />
      </div>
    </div>
  );
}
